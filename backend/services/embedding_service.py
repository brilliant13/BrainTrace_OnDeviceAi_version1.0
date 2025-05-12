from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer
import numpy as np
import logging
import os
import uuid
from typing import List, Dict, Optional

# Qdrant 저장 경로 설정 (디스크 기반)
QDRANT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "qdrant")
os.makedirs(QDRANT_PATH, exist_ok=True)

# Qdrant 클라이언트 초기화 (디스크 기반 저장소 사용)
client = QdrantClient(path=QDRANT_PATH)

# SentenceTransformer 모델 초기화 (임베딩 차원: 384)
# all-MiniLM-L6-v2: 경량화된 모델로, 384차원의 임베딩을 생성
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def get_collection_name(brain_id: str) -> str:
    """브레인 ID에 해당하는 컬렉션 이름을 반환합니다.
    
    Args:
        brain_id: 브레인의 고유 식별자
        
    Returns:
        str: 'brain_{brain_id}' 형식의 컬렉션 이름
    """
    return f"brain_{brain_id}"

def initialize_collection(brain_id: str) -> None:
    """브레인에 대한 새로운 컬렉션을 초기화하거나 기존 컬렉션을 재설정합니다.
    
    이 함수는:
    1. 기존 컬렉션이 있으면 삭제
    2. 지정된 벡터 설정으로 새 컬렉션 생성
    
    Args:
        brain_id: 브레인의 고유 식별자
        
    Raises:
        RuntimeError: 컬렉션 생성 실패 시
    """
    collection_name = get_collection_name(brain_id)
    try:
        # 기존 컬렉션이 있으면 삭제
        client.delete_collection(collection_name)
        logging.info("기존 컬렉션 삭제 완료: %s", collection_name)
    except Exception as e:
        logging.warning("컬렉션 %s가 존재하지 않을 수 있습니다: %s", collection_name, str(e))
    
    try:
        # 새 컬렉션 생성 (벡터 설정 포함)
        # size=384: 임베딩 차원
        # distance=COSINE: 벡터 비교를 위한 코사인 유사도 사용
        client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
        )
        logging.info("새 컬렉션 생성 완료: %s", collection_name)
    except Exception as e:
        logging.error("컬렉션 %s 생성 실패: %s", collection_name, str(e))
        raise RuntimeError(f"컬렉션 생성 실패: {str(e)}")

def update_index_and_get_embeddings(nodes: List[Dict], brain_id: str) -> Dict[str, List[float]]:
    """새로운 노드로 벡터 인덱스를 업데이트하고 임베딩을 반환합니다.
    
    이 함수는:
    1. 각 노드와 설명을 처리
    2. 각 설명에 대한 임베딩 생성
    3. 메타데이터와 함께 Qdrant에 임베딩 저장
    
    Args:
        nodes: 필수 필드(source_id, name, label, descriptions)가 포함된 노드 목록
        brain_id: 브레인의 고유 식별자
        
    Returns:
        Dict[str, List[float]]: source_id를 임베딩에 매핑하는 딕셔너리
        
    Raises:
        RuntimeError: 인덱스 업데이트 실패 시
    """
    collection_name = get_collection_name(brain_id)
    embeddings = {}
    
    try:
        for node in nodes:
            # 필수 필드 검증
            if not all(key in node for key in ["source_id", "name", "label", "descriptions"]):
                logging.warning("필수 필드가 누락된 노드: %s", node)
                continue
                
            source_id = str(node["source_id"])
            name = node["name"]
            label = node["label"]
            descriptions = node["descriptions"]
            
            # 각 설명 처리
            for desc in descriptions:
                if not isinstance(desc, dict) or "description" not in desc:
                    logging.warning("잘못된 설명 형식: %s", desc)
                    continue
                    
                description = desc["description"]
                # 임베딩을 위한 텍스트 포맷
                embedding_text = f"{name}는 {label}이며, {description}"
                print("###############################################")
                logging.info(f"[임베딩 텍스트] {embedding_text}")
                print("###############################################")

                try:
                    # 임베딩 생성 및 Qdrant 저장
                    embedding = encode_text(embedding_text)
                    embeddings[source_id] = embedding
                    
                    # source_id를 기반으로 UUID 생성
                    point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, source_id))
                    
                    client.upsert(
                        collection_name=collection_name,
                        points=[
                            models.PointStruct(
                                id=point_id,  # UUID 사용
                                vector=embedding,
                                payload={
                                    "name": name,
                                    "label": label,
                                    "description": description,
                                    "source_id": source_id,
                                    "point_id": point_id  # UUID도 payload에 저장
                                }
                            )
                        ]
                    )
                    logging.info("노드 %s의 임베딩 저장 완료 (UUID: %s)", source_id, point_id)
                except Exception as e:
                    logging.error("노드 %s의 설명 처리 실패: %s", source_id, str(e))
                    continue
                    
        logging.info("컬렉션 %s에 %d개의 임베딩 저장 완료", collection_name, len(embeddings))
        return embeddings
    except Exception as e:
        logging.error("인덱스 업데이트 실패: %s", str(e))
        raise RuntimeError(f"인덱스 업데이트 실패: {str(e)}")

def encode_text(text: str) -> List[float]:
    """단일 텍스트에 대한 임베딩을 생성합니다.
    
    Args:
        text: 인코딩할 입력 텍스트
        
    Returns:
        List[float]: 384차원 임베딩 벡터
        
    Raises:
        RuntimeError: 임베딩 생성 실패 시
    """
    try:
        # 임베딩 생성 및 리스트로 변환
        return model.encode([text], convert_to_numpy=True)[0].tolist()
    except Exception as e:
        logging.error("텍스트 임베딩 생성 실패: %s", str(e))
        raise RuntimeError(f"텍스트 임베딩 생성 실패: {str(e)}")

def search_similar_nodes(embedding: List[float], brain_id: str, limit: int = 5, threshold: float = 0.5) -> List[Dict]:
    """벡터 데이터베이스에서 유사한 노드를 검색합니다.
    
    이 함수는:
    1. 유사한 임베딩을 가진 노드 검색
    2. 유사도 임계값으로 결과 필터링
    3. 유사도 점수와 함께 노드 정보 반환
    
    Args:
        embedding: 검색할 임베딩 벡터
        brain_id: 브레인의 고유 식별자
        limit: 반환할 최대 결과 수
        threshold: 최소 유사도 점수 (0.0에서 1.0 사이)
        
    Returns:
        List[Dict]: 메타데이터와 점수가 포함된 유사 노드 목록
        
    Raises:
        RuntimeError: 검색 실패 시
    """
    collection_name = get_collection_name(brain_id)
    try:
        # 코사인 유사도를 사용하여 유사한 벡터 검색
        search_results = client.search(
            collection_name=collection_name,
            query_vector=embedding,
            limit=limit
        )
        
        # 임계값으로 결과 필터링 및 응답 포맷팅
        filtered_results = []
        for result in search_results:
            if result.score >= threshold:  # 유사도 임계값 적용
                filtered_results.append({
                    "source_id": result.payload.get("source_id", ""),
                    "name": result.payload.get("name", ""),
                    "label": result.payload.get("label", ""),
                    "description": result.payload.get("description", ""),
                    "point_id": result.payload.get("point_id", ""),  # UUID 포함
                    "score": result.score  # 코사인 유사도 점수
                })
                
        logging.info("검색 결과: %d개의 유사 노드 찾음 (임계값: %.2f)", len(filtered_results), threshold)
        return filtered_results
    except Exception as e:
        logging.error("유사 노드 검색 실패: %s", str(e))
        raise RuntimeError(f"유사 노드 검색 실패: {str(e)}")

def is_index_ready(brain_id: str) -> bool:
    """브레인에 대한 인덱스가 준비되었는지 확인합니다.
    
    Args:
        brain_id: 브레인의 고유 식별자
        
    Returns:
        bool: 컬렉션이 존재하면 True, 아니면 False
    """
    collection_name = get_collection_name(brain_id)
    try:
        collections = client.get_collections()
        return any(collection.name == collection_name for collection in collections.collections)
    except Exception as e:
        logging.error("인덱스 준비 상태 확인 실패: %s", str(e))
        return False

def delete_node(source_id: str, brain_id: str) -> None:
    """벡터 데이터베이스에서 노드를 삭제합니다.
    
    Args:
        source_id: 노드의 고유 식별자
        brain_id: 브레인의 고유 식별자
        
    Raises:
        RuntimeError: 삭제 실패 시
    """
    collection_name = get_collection_name(brain_id)
    try:
        # source_id를 기반으로 UUID 생성
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, source_id))
        
        client.delete(
            collection_name=collection_name,
            points_selector=models.PointIdsList(points=[point_id])
        )
        logging.info("컬렉션 %s에서 노드 %s 삭제 완료 (UUID: %s)", collection_name, source_id, point_id)
    except Exception as e:
        logging.error("노드 %s 삭제 실패: %s", source_id, str(e))
        raise RuntimeError(f"노드 삭제 실패: {str(e)}")

def delete_collection(brain_id: str) -> None:
    """벡터 데이터베이스에서 컬렉션을 삭제합니다.
    
    Args:
        brain_id: 브레인의 고유 식별자
    """
    collection_name = get_collection_name(brain_id)
    try:
        client.delete_collection(collection_name)
        logging.info("컬렉션 삭제 완료: %s", collection_name)
    except Exception as e:
        logging.warning("컬렉션 %s가 존재하지 않을 수 있습니다: %s", collection_name, str(e))

# 예시: 서버 시작 시 특정 brain_id에 대해 컬렉션 초기화
if __name__ == "__main__":
    test_brain_id = "1"
    initialize_collection(test_brain_id)