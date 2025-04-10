from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer
import numpy as np
import logging
import os

# Qdrant 저장 경로 설정 (디스크 기반)
QDRANT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "qdrant")
os.makedirs(QDRANT_PATH, exist_ok=True)

# Qdrant 클라이언트 초기화
client = QdrantClient(path=QDRANT_PATH)

# SentenceTransformer 모델 초기화 (임베딩 차원: 384)
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def get_collection_name(brain_id: str) -> str:
    """brain_id를 기반으로 컬렉션 이름 생성 (예: 'brain_math_notes')"""
    return f"brain_{brain_id}"

def initialize_collection(brain_id: str):
    """특정 brain_id에 대한 Qdrant 컬렉션 초기화 (이미 있으면 삭제 후 재생성)"""
    collection_name = get_collection_name(brain_id)
    try:
        # 기존 컬렉션이 있으면 삭제
        try:
            client.delete_collection(collection_name)
        except Exception as e:
            logging.warning(f"컬렉션 {collection_name} 삭제 실패 (없을 수 있음): {e}")
            
        # 새로운 컬렉션 생성
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=384,                # 임베딩 차원 (all-MiniLM-L6-v2)
                distance=models.Distance.COSINE
            )
        )
        logging.info(f"✅ Qdrant 컬렉션 초기화 완료 (brain_id: {brain_id}, 경로: {QDRANT_PATH})")
    except Exception as e:
        logging.error(f"❌ Qdrant 초기화 실패 for brain_id {brain_id}: {str(e)}")

def update_index_and_get_embeddings(brain_id: str, nodes: list) -> np.ndarray:
    """
    주어진 노드들의 텍스트를 임베딩하고, 
    해당 brain_id에 해당하는 컬렉션에 업로드합니다.
    
    각 노드는 반드시 다음 필드를 포함해야 합니다:
      - 'node_id': 노드의 고유 식별자 (삭제 및 수정 시 사용)
      - 'node_name': 노드의 표시 이름 (검색 결과 반환)
      - 'label': 노드 분류나 태그
      - 'description': 노드 내용
    """
    collection_name = get_collection_name(brain_id)
    texts = [f"{node['label']} - {node['node_name']}: {node['description']}" for node in nodes]
    embeddings = model.encode(texts, convert_to_numpy=True)
    
    # 각 노드별로 Qdrant에 저장할 포인트 구성
    points = []
    for node, embedding in zip(nodes, embeddings):
        points.append(
            models.PointStruct(
                id=node["node_id"],  # node_id를 Qdrant 포인트의 고유 ID로 사용
                vector=embedding.tolist(),
                payload={
                    "node_name": node["node_name"],
                    "node_id": node["node_id"],
                    "label": node["label"],
                    "description": node["description"]
                }
            )
        )
    
    client.upsert(
        collection_name=collection_name,
        points=points
    )
    logging.info(f"✅ {len(nodes)}개의 노드 임베딩 저장 완료 (brain_id: {brain_id}, 영구 저장)")
    return embeddings

def encode_text(text: str) -> np.ndarray:
    """단일 텍스트의 임베딩 생성"""
    return model.encode([text], convert_to_numpy=True)

def search_similar_nodes(brain_id: str, query_embedding: np.ndarray, k: int = 10, threshold: float = 0.6) -> list:
    """
    해당 brain_id의 컬렉션에서 query_embedding과 유사한 노드 검색.
    유사도(score)가 threshold 이상인 경우, 결과로 node_name 반환.
    """
    collection_name = get_collection_name(brain_id)
    search_result = client.search(
        collection_name=collection_name,
        query_vector=query_embedding[0].tolist(),
        limit=k
    )
    
    similar_node_names = []
    for hit in search_result:
        if hit.score >= threshold:
            similar_node_names.append(hit.payload.get("node_name"))
    
    return similar_node_names

def is_index_ready(brain_id: str) -> bool:
    """해당 brain_id 컬렉션의 인덱스(벡터 저장소)가 준비되었는지 확인"""
    collection_name = get_collection_name(brain_id)
    try:
        return client.get_collection(collection_name) is not None
    except Exception:
        return False

def delete_node(brain_id: str, node_id) -> None:
    """
    특정 brain_id의 컬렉션에서 주어진 node_id의 노드를 삭제합니다.
    이렇게 삭제된 노드는 이후 검색 결과에서 제외됩니다.
    """
    collection_name = get_collection_name(brain_id)
    try:
        # Qdrant의 delete 메서드를 사용하여 지정된 node_id를 가진 포인트 삭제
        client.delete(
            collection_name=collection_name,
            points_selector=models.PointIdsList(points=[node_id])
        )
        logging.info(f"✅ 노드 {node_id} 삭제됨 (brain_id: {brain_id})")
    except Exception as e:
        logging.error(f"❌ 노드 {node_id} 삭제 실패 (brain_id: {brain_id}): {e}")

# 예시: 서버 시작 시 특정 brain_id에 대해 컬렉션 초기화
if __name__ == "__main__":
    test_brain_id = "example_brain"
    initialize_collection(test_brain_id)
