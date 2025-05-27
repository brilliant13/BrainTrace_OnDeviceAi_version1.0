from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import logging
from services import embedding_service

router = APIRouter(
    prefix="/search",
    tags=["search"],
    responses={404: {"description": "Not found"}}
)

class SearchRequest(BaseModel):
    query: str
    brain_id: str

class SearchResponse(BaseModel):
    source_ids: List[str]  # 중복 제거된 source_id 목록

@router.post("/getSimilarSourceIds",
    summary="유사도 기반 소스 검색",
    description="입력된 설명이나 키워드와 유사한 문장을 벡터DB에서 찾아 해당 source_id들을 반환합니다.",
    response_model=SearchResponse)
async def search_similar_descriptions(request: SearchRequest):
    """
    설명이나 키워드로 유사한 문장을 검색하고 source_id를 반환합니다:
    
    - **query**: 검색할 설명이나 키워드
    - **brain_id**: 브레인 ID
    
    반환값:
    - **source_ids**: 유사도 순으로 정렬된 source_id 목록 (중복 제거됨)
    """
    logging.info(f"유사 문장 검색 시작 - query: {request.query}, brain_id: {request.brain_id}")
    
    try:
        # 1. 컬렉션이 없으면 초기화
        if not embedding_service.is_index_ready(request.brain_id):
            embedding_service.initialize_collection(request.brain_id)
            logging.info("Qdrant 컬렉션 초기화 완료: %s", request.brain_id)
        
        # 2. 검색어 임베딩
        query_embedding = embedding_service.encode_text(request.query)
        
        # 3. 유사 문장 검색 (새로운 핸들러 사용)
        similar_descriptions = embedding_service.search_similar_descriptions(
            embedding=query_embedding,
            brain_id=request.brain_id,
            limit=10
        )
        
        if not similar_descriptions:
            return {"source_ids": []}
        
        # 4. source_id 추출 (이미 중복 제거되어 있음)
        source_ids = [desc["source_id"] for desc in similar_descriptions]
        
        logging.info(f"검색 결과: {len(source_ids)}개의 고유 source_id 발견")
        return {"source_ids": source_ids}
        
    except Exception as e:
        logging.error("검색 오류: %s", str(e))
        raise HTTPException(status_code=500, detail=f"검색 중 오류가 발생했습니다: {str(e)}") 