from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import logging
from services import embedding_service
from sqlite_db.sqlite_handler import SQLiteHandler

router = APIRouter(
    prefix="/search",
    tags=["search"],
    responses={404: {"description": "Not found"}}
)

class SearchRequest(BaseModel):
    query: str
    brain_id: str

class SearchResponse(BaseModel):
    sources: List[Dict[str, str]]  # source_id와 title을 포함하는 객체 리스트

@router.post("/getSimilarSourceIds",
    summary="유사도 기반 소스 검색",
    description="입력된 설명이나 키워드와 유사한 문장을 벡터DB에서 찾아 해당 source_id들과 제목을 반환합니다.",
    response_model=SearchResponse)
async def search_similar_descriptions(request: SearchRequest):
    """
    설명이나 키워드로 유사한 문장을 검색하고 source_id와 제목을 반환합니다:
    
    - **query**: 검색할 설명이나 키워드
    - **brain_id**: 브레인 ID
    
    반환값:
    - **sources**: 유사도 순으로 정렬된 source_id와 제목 목록 (중복 제거됨)
    """
    logging.info(f"유사 문장 검색 시작 - query: {request.query}, brain_id: {request.brain_id}")
    
    try:
        # 1. 텍스트 기반 제목 검색 (우선)
        db = SQLiteHandler()
        title_results = db.search_titles_by_query(request.query, int(request.brain_id))
        
        # 제목 검색 결과의 source_id와 title 추출
        title_sources = []
        seen_ids = set()  # 중복 체크를 위한 set
        
        for result in title_results:
            id_num = str(result['id'])
            if id_num not in seen_ids:
                seen_ids.add(id_num)
                title_sources.append({
                    "id": id_num,
                    "title": result['title']
                })
        
        # 2. 벡터 DB 검색
        if not embedding_service.is_index_ready(request.brain_id):
            embedding_service.initialize_collection(request.brain_id)
            logging.info("Qdrant 컬렉션 초기화 완료: %s", request.brain_id)
        
        query_embedding = embedding_service.encode_text(request.query)
        
        similar_descriptions = embedding_service.search_similar_descriptions(
            embedding=query_embedding,
            brain_id=request.brain_id,
            limit=10
        )
        
        # 벡터 검색 결과의 source_id와 title 추출
        vector_sources = []
        for desc in similar_descriptions:
            source_id = desc["source_id"]
            
            if source_id and source_id not in seen_ids:
                seen_ids.add(source_id)
                
                # PDF와 TextFile 테이블에서 모두 조회
                pdf = db.get_pdf(int(source_id))
                textfile = db.get_textfile(int(source_id))
                
                title = None
                if pdf:
                    title = pdf['pdf_title']
                elif textfile:
                    title = textfile['txt_title']
                
                if title:
                    vector_sources.append({
                        "id": source_id,
                        "title": title
                    })
        
        # 3. 결과 병합 (제목 검색 결과를 우선)
        final_sources = title_sources + vector_sources
        
        logging.info(f"검색 결과: {len(final_sources)}개의 고유 source_id 발견")
        return {"sources": final_sources}
        
    except Exception as e:
        logging.error("검색 오류: %s", str(e))
        raise HTTPException(status_code=500, detail=f"검색 중 오류가 발생했습니다: {str(e)}") 