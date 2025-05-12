from qdrant_client import QdrantClient
from qdrant_client.http import models
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np
import logging
import os
import uuid
from typing import List, Dict, Optional

<<<<<<< HEAD
# ================================================
# Qdrant 및 KoE5 임베딩 모델 초기화
# ================================================

# 디스크 기반 Qdrant 저장 경로 설정
=======
# Qdrant storage path (disk-based)
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
QDRANT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "qdrant")
os.makedirs(QDRANT_PATH, exist_ok=True)
logging.info("Qdrant storage path set to: %s", QDRANT_PATH)

<<<<<<< HEAD
# Qdrant 클라이언트 생성 (로컬 디스크 모드)
=======
# Initialize Qdrant client with disk-based storage
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
client = QdrantClient(path=QDRANT_PATH)
logging.info("Qdrant client initialized with disk storage.")

<<<<<<< HEAD
# KoE5 임베딩 모델 로드
MODEL_NAME = "nlpai-lab/KoE5"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)
# 모델의 hidden size를 벡터 차원으로 사용
EMBED_DIM = model.config.hidden_size  # 예: 1024


def get_collection_name(brain_id: str) -> str:
    """
    주어진 brain_id로부터 Qdrant 컬렉션 이름을 생성합니다.
    Args:
        brain_id: 브레인 고유 식별자
    Returns:
        'brain_{brain_id}' 형식의 컬렉션 이름
=======
# Initialize SentenceTransformer model (embedding dimension: 768)
# paraphrase-mpnet-base-v2: high-performance model generating 768-d embeddings
model = SentenceTransformer("sentence-transformers/paraphrase-mpnet-base-v2")
logging.info("SentenceTransformer model 'paraphrase-mpnet-base-v2' loaded (dimension: 768).")

def get_collection_name(brain_id: str) -> str:
    """Return the collection name corresponding to the given brain ID.
    
    Args:
        brain_id: Unique identifier for the brain.
        
    Returns:
        str: Collection name in the format 'brain_{brain_id}'.
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    """
    collection_name = f"brain_{brain_id}"
    logging.info("Generated collection name: %s", collection_name)
    return collection_name


def initialize_collection(brain_id: str) -> None:
<<<<<<< HEAD
    """
    Qdrant에서 기존 컬렉션을 삭제하고 새로 생성합니다.
    - 기존 컬렉션이 있으면 삭제
    - EMBED_DIM 크기, 코사인 거리 기준으로 새 컬렉션 생성
    Args:
        brain_id: 브레인 고유 식별자
    Raises:
        RuntimeError: 생성 실패 시
=======
    """Initialize or reset a new collection for the brain.
    
    This function does the following:
    1. Deletes the existing collection if it exists.
    2. Creates a new collection with the specified vector configuration.
    
    Args:
        brain_id: Unique identifier for the brain.
        
    Raises:
        RuntimeError: If collection creation fails.
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    """
    collection_name = get_collection_name(brain_id)
    # 기존 컬렉션 삭제 시도
    try:
<<<<<<< HEAD
=======
        # Delete the existing collection if available
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
        client.delete_collection(collection_name)
        logging.info("Existing collection deleted: %s", collection_name)
    except Exception as e:
<<<<<<< HEAD
        logging.warning("컬렉션 %s가 존재하지 않거나 삭제 실패: %s", collection_name, str(e))
    # 새 컬렉션 생성
    try:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=EMBED_DIM,
                distance=models.Distance.COSINE
            ),
=======
        logging.warning("Collection %s may not exist: %s", collection_name, str(e))
    
    try:
        # Create new collection with vector configuration
        # size=768: embedding dimension of paraphrase-mpnet-base-v2
        # distance=COSINE: using cosine similarity for vector comparison
        client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
        )
        logging.info("New collection created successfully: %s", collection_name)
    except Exception as e:
        logging.error("Failed to create collection %s: %s", collection_name, str(e))
        raise RuntimeError(f"Collection creation failed: {str(e)}")

<<<<<<< HEAD

def encode_text(text: str) -> List[float]:
    """
    주어진 텍스트를 KoE5 모델로 임베딩하여 벡터 반환
    - 토크나이저로 입력 전처리
    - CLS 토큰 임베딩 추출
    Args:
        text: 입력 텍스트
    Returns:
        EMBED_DIM 차원의 벡터 리스트
    Raises:
        RuntimeError: 임베딩 실패 시
=======
def update_index_and_get_embeddings(nodes: List[Dict], brain_id: str) -> Dict[str, List[float]]:
    """Update the vector index with new nodes and return embeddings.
    
    The function:
    1. Processes each node and its descriptions.
    2. Generates an embedding for each description.
    3. Stores the embedding along with metadata in Qdrant.
    
    Args:
        nodes: A list of nodes containing required fields (source_id, name, label, descriptions).
        brain_id: Unique identifier for the brain.
        
    Returns:
        Dict[str, List[float]]: A dictionary mapping source_id to its embedding.
        
    Raises:
        RuntimeError: If index update fails.
    """
    collection_name = get_collection_name(brain_id)
    embeddings = {}
    logging.info("Starting index update for collection: %s", collection_name)
    
    try:
        for node in nodes:
            # Verify required fields
            if not all(key in node for key in ["source_id", "name", "label", "descriptions"]):
                logging.warning("Node is missing required fields: %s", node)
                continue
                
            source_id = str(node["source_id"])
            name = node["name"]
            label = node["label"]
            descriptions = node["descriptions"]
            logging.info("Processing node with source_id: %s", source_id)
            
            # Process each description in the node
            for desc in descriptions:
                if not isinstance(desc, dict) or "description" not in desc:
                    logging.warning("Invalid description format: %s", desc)
                    continue
                    
                description = desc["description"]
                # Format text for embedding generation
                embedding_text = f"{name}는 {label}이며, {description}"
                logging.info("Generating embedding for text: %s", embedding_text)

                try:
                    # Create embedding and store in Qdrant
                    embedding = encode_text(embedding_text)
                    embeddings[source_id] = embedding
                    
                    # Generate UUID for point using source_id
                    point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, source_id))
                    
                    client.upsert(
                        collection_name=collection_name,
                        points=[
                            models.PointStruct(
                                id=point_id,
                                vector=embedding,
                                payload={
                                    "name": name,
                                    "label": label,
                                    "description": description,
                                    "source_id": source_id,
                                    "point_id": point_id
                                }
                            )
                        ]
                    )
                    logging.info("Successfully upserted embedding for node %s (UUID: %s)", source_id, point_id)
                except Exception as e:
                    logging.error("Failed processing description for node %s: %s", source_id, str(e))
                    continue
                    
        logging.info("Stored %d embeddings in collection %s", len(embeddings), collection_name)
        return embeddings
    except Exception as e:
        logging.error("Index update failed: %s", str(e))
        raise RuntimeError(f"Index update failed: {str(e)}")

def encode_text(text: str) -> List[float]:
    """Generate an embedding for a single text.
    
    Args:
        text: Input text to encode.
        
    Returns:
        List[float]: 768-dimensional embedding vector.
        
    Raises:
        RuntimeError: If embedding generation fails.
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    """
    logging.info("Encoding text: %s", text)
    try:
<<<<<<< HEAD
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = model(**inputs)
        # CLS 토큰 인덱스(0) 임베딩 반환
        return outputs.last_hidden_state[:, 0].squeeze().tolist()
=======
        # Generate embedding and convert to list
        embedding = model.encode([text], convert_to_numpy=True)[0].tolist()
        logging.info("Text encoded successfully.")
        return embedding
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    except Exception as e:
        logging.error("Text encoding failed: %s", str(e))
        raise RuntimeError(f"Text encoding failed: {str(e)}")

<<<<<<< HEAD

def update_index_and_get_embeddings(nodes: List[Dict], brain_id: str) -> Dict[str, List[List[float]]]:
    """
    노드 목록을 여러 표현 포맷으로 임베딩하고 Qdrant에 저장

    처리 순서:
    1. 필수 필드 검증(source_id, name, label, descriptions)
    2. 여러 포맷으로 텍스트 생성
    3. encode_text로 임베딩
    4. uuid5로 point_id 생성
    5. Qdrant upsert로 벡터 및 payload 저장

    Args:
        nodes: {source_id, name, label, descriptions} 포함 노드 리스트
        brain_id: 브레인 고유 식별자
    Returns:
        source_id별 생성된 벡터 리스트 딕셔너리
    """
    collection_name = get_collection_name(brain_id)
    all_embeddings: Dict[str, List[List[float]]] = {}

    # 사용할 표현 포맷 정의
    formats = [
        "{name}는 {label}이다. {description}",
        "{name} ({label}): {description}",
        "{label}인 {name}에 대한 설명: {description}",
        "{description}"
    ]

    for node in nodes:
        # 필수 키 확인
        if not all(k in node for k in ["source_id", "name", "label", "descriptions"]):
            logging.warning("필수 필드 누락된 노드: %s", node)
            continue

        source_id = str(node["source_id"])
        name = node["name"]
        label = node["label"]
        embeddings_for_node: List[List[float]] = []

        # 각 description마다 포맷별 벡터 생성
        for desc in node["descriptions"]:
            description = desc.get("description")
            if not description:
                logging.warning("빈 description 스킵: %s", desc)
                continue

            for idx, fmt in enumerate(formats):
                # 텍스트 생성
                text = fmt.format(name=name, label=label, description=description)
                logging.info("[임베딩 텍스트] %s", text)

                # 임베딩 생성
                emb = encode_text(text)
                embeddings_for_node.append(emb)

                # 고유 point_id 생성(source_id + idx + description)
                pid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{source_id}_{idx}_{description}"))

                # Qdrant에 upsert: 벡터 및 payload 포함
                client.upsert(
                    collection_name=collection_name,
                    points=[
                        models.PointStruct(
                            id=pid,
                            vector=emb,
                            payload={
                                "source_id": source_id,
                                "name": name,
                                "label": label,
                                "description": description,
                                "point_id": pid
                            }
                        )
                    ]
                )
                logging.info("노드 %s descriptor %d 저장 완료(UUID: %s)", source_id, idx, pid)

        all_embeddings[source_id] = embeddings_for_node

    logging.info("컬렉션 %s에 %d개의 노드 임베딩 저장 완료", collection_name, len(all_embeddings))
    return all_embeddings


def search_similar_nodes(
    embedding: List[float],
    brain_id: str,
    limit: int = 3,
    threshold: float = 0.1,
    high_score_threshold: float = 0.8
) -> List[Dict]:
    """
    Qdrant에서 유사 벡터 검색 후 source_id별 필터링

    로직:
    1. 검색 결과에서 threshold 미만 제거
    2. high_score_threshold 이상은 모두 high_scores에 저장
    3. 나머지는 source_id별 최고 점수로 그룹핑
    4. 그룹핑 결과 상위 limit개 선택
    5. high_scores + 상위 limit 반환

    Args:
        embedding: 검색할 임베딩 벡터
        brain_id: 브레인 고유 식별자
        limit: 소규모 그룹핑 결과 개수 제한
        threshold: 최소 유사도 필터
        high_score_threshold: 이 이상은 무제한 포함
    Returns:
        유사 노드 리스트
    """
    collection_name = get_collection_name(brain_id)

    try:
        # 검색: 충분히 많은 후보 요청 (limit * 10)
        #   Qdrant에 query_vector와 유사도가 높은 순으로 상위 limit*10개 만큼 요청
        #   예: limit=10 -> 상위 100개(0.8 이상이든 0.5~0.8 사이든 무조건 top100 가져옴)
        #   이후 threshold 필터링 및 source_id 그룹핑 수행
=======
def search_similar_nodes(embedding: List[float], brain_id: str, limit: int = 5, threshold: float = 0.3) -> List[Dict]:
    """Search for nodes with similar embeddings in the vector database.
    
    The function:
    1. Searches for nodes with similar embeddings.
    2. Filters results based on the similarity threshold.
    3. Returns node information along with similarity scores.
    
    Args:
        embedding: The query embedding vector.
        brain_id: Unique identifier for the brain.
        limit: Maximum number of results to return.
        threshold: Minimum similarity score (between 0.0 and 1.0).
        
    Returns:
        List[Dict]: A list of similar nodes with metadata and scores.
        
    Raises:
        RuntimeError: If the search operation fails.
    """
    collection_name = get_collection_name(brain_id)
    logging.info("Starting search in collection: %s", collection_name)
    try:
        # Search for similar vectors using cosine similarity
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
        search_results = client.search(
            collection_name=collection_name,
            query_vector=embedding,
            limit=limit * 10
        )
<<<<<<< HEAD

        grouped: Dict[str, Dict] = {}
        high_scores: List[Dict] = []

        for result in search_results:
            score = result.score
            if score < threshold:
                # 임계값 미만 결과 스킵
                continue

            payload = result.payload or {}
            sid = payload.get("source_id", "")

            entry = {
                "source_id": sid,
                "point_id": payload.get("point_id", ""),
                "name": payload.get("name", ""),
                "label": payload.get("label", ""),
                "description": payload.get("description", ""),
                "score": score
            }

            if score >= high_score_threshold:
                # 고유사도 항목은 모두 무제한 수집
                high_scores.append(entry)
            else:
                # source_id별 최고 점수 항목만 그룹핑
                prev = grouped.get(sid)
                if not prev or score > prev["score"]:
                    grouped[sid] = entry

        # 그룹핑된 엔트리를 점수 내림차순으로 정렬, limit만큼 선택
        top_grouped = sorted(grouped.values(), key=lambda x: -x["score"])[:limit]

        # 최종 반환: 고유사도(high_scores) + 그룹핑된 상위 결과
        return high_scores + top_grouped

=======
        logging.info("Search completed. Raw results: %s", search_results)
        
        # Filter results by the similarity threshold and format response
        filtered_results = []
        for result in search_results:
            if result.score >= threshold:
                filtered_results.append({
                    "source_id": result.payload.get("source_id", ""),
                    "name": result.payload.get("name", ""),
                    "label": result.payload.get("label", ""),
                    "description": result.payload.get("description", ""),
                    "point_id": result.payload.get("point_id", ""),
                    "score": result.score
                })
        logging.info("Filtered search results: %d nodes found (threshold: %.2f)", len(filtered_results), threshold)
        return filtered_results
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    except Exception as e:
        logging.error("Search for similar nodes failed: %s", str(e))
        raise RuntimeError(f"Search for similar nodes failed: {str(e)}")


def is_index_ready(brain_id: str) -> bool:
<<<<<<< HEAD
    """브레인에 대한 인덱스가 준비되었는지 확인합니다.
    Args:
        brain_id: 브레인의 고유 식별자
=======
    """Check if the index for the given brain is ready.
    
    Args:
        brain_id: Unique identifier for the brain.
        
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    Returns:
        bool: True if the collection exists, otherwise False.
    """
    collection_name = get_collection_name(brain_id)
    logging.info("Checking if index is ready for collection: %s", collection_name)
    try:
        collections = client.get_collections()
        ready = any(collection.name == collection_name for collection in collections.collections)
        logging.info("Index ready: %s", ready)
        return ready
    except Exception as e:
        logging.error("Failed to check index status: %s", str(e))
        return False


def delete_node(source_id: str, brain_id: str) -> None:
<<<<<<< HEAD
    """벡터 데이터베이스에서 노드를 삭제합니다.
    Args:
        source_id: 노드의 고유 식별자
        brain_id: 브레인의 고유 식별자
=======
    """Delete a node from the vector database.
    
    Args:
        source_id: Unique identifier of the node.
        brain_id: Unique identifier for the brain.
        
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    Raises:
        RuntimeError: If deletion fails.
    """
    collection_name = get_collection_name(brain_id)
    logging.info("Deleting node with source_id: %s from collection: %s", source_id, collection_name)
    try:
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, source_id))
        client.delete(
            collection_name=collection_name,
            points_selector=models.PointIdsList(points=[point_id])
        )
        logging.info("Successfully deleted node %s (UUID: %s) from collection %s", source_id, point_id, collection_name)
    except Exception as e:
        logging.error("Failed to delete node %s: %s", source_id, str(e))
        raise RuntimeError(f"Node deletion failed: {str(e)}")


def delete_collection(brain_id: str) -> None:
<<<<<<< HEAD
    """벡터 데이터베이스에서 컬렉션을 삭제합니다.
=======
    """Delete the collection from the vector database.
    
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    Args:
        brain_id: Unique identifier for the brain.
    """
    collection_name = get_collection_name(brain_id)
    logging.info("Deleting collection: %s", collection_name)
    try:
        client.delete_collection(collection_name)
        logging.info("Collection deleted successfully: %s", collection_name)
    except Exception as e:
        logging.warning("Collection %s may not exist: %s", collection_name, str(e))

# Example: Initialize the collection for a specific brain_id when the server starts.
if __name__ == "__main__":
    test_brain_id = "1"
    logging.info("Initializing collection for brain_id: %s", test_brain_id)
    initialize_collection(test_brain_id)
    logging.info("Collection initialization completed for brain_id: %s", test_brain_id)
