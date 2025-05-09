from fastapi import APIRouter, HTTPException
from models.request_models import ProcessTextRequest, AnswerRequest, GraphResponse
from services import ai_service, embedding_service
from neo4j_db.Neo4jHandler import Neo4jHandler
import logging

router = APIRouter(
    prefix="/brainGraph",
    tags=["brainGraph"],
    responses={404: {"description": "Not found"}}
)

@router.get("/getNodeEdge/{brain_id}", response_model=GraphResponse,
           summary="브레인의 그래프 데이터 조회",
           description="특정 브레인의 모든 노드와 엣지(관계) 정보를 반환합니다.")
async def get_brain_graph(brain_id: str):
    """
    특정 브레인의 그래프 데이터를 반환합니다:
    
    - **brain_id**: 그래프를 조회할 브레인 ID
    
    반환값:
    - **nodes**: 노드 목록 (각 노드는 name 속성을 가짐)
    - **links**: 엣지 목록 (각 엣지는 source, target, relation 속성을 가짐)
    """
    logging.info(f"getNodeEdge 엔드포인트 호출됨 - brain_id: {brain_id}")
    try:
        neo4j_handler = Neo4jHandler()
        logging.info("Neo4j 핸들러 생성됨")
        
        graph_data = neo4j_handler.get_brain_graph(brain_id)
        logging.info(f"Neo4j에서 받은 데이터: nodes={len(graph_data['nodes'])}, links={len(graph_data['links'])}")
        
        if not graph_data['nodes'] and not graph_data['links']:
            logging.warning(f"brain_id {brain_id}에 대한 데이터가 없습니다")
        
        return graph_data
    except Exception as e:
        logging.error("그래프 데이터 조회 오류: %s", str(e))
        raise HTTPException(status_code=500, detail=f"그래프 데이터 조회 중 오류가 발생했습니다: {str(e)}") 

@router.post("/process_text", 
    summary="텍스트 처리 및 그래프 생성",
    description="입력된 텍스트에서 노드와 엣지를 추출하여 Neo4j에 저장하고, 노드 정보를 벡터 DB에 임베딩합니다.",
    response_description="처리된 노드와 엣지 정보를 반환합니다.")
async def process_text_endpoint(request_data: ProcessTextRequest):
    """
    텍스트를 받아 노드/엣지 추출, Neo4j 저장, 벡터 DB 임베딩까지 전체 파이프라인 실행
    """
    text = request_data.text
    source_id = request_data.source_id
    brain_id = request_data.brain_id
    
    if not text:
        raise HTTPException(status_code=400, detail="text 파라미터가 필요합니다.")
    if not source_id:
        raise HTTPException(status_code=400, detail="source_id 파라미터가 필요합니다.")
    if not brain_id:
        raise HTTPException(status_code=400, detail="brain_id 파라미터가 필요합니다.")
    
    logging.info("사용자 입력 텍스트: %s, source_id: %s, brain_id: %s", text, source_id, brain_id)
    
    # Step 1: 텍스트에서 노드/엣지 추출 (AI 서비스)
    nodes, edges = ai_service.extract_graph_components(text, source_id)
    logging.info("추출된 노드: %s", nodes)
    logging.info("추출된 엣지: %s", edges)

    # Step 2: Neo4j에 노드와 엣지 저장 
    neo4j_handler = Neo4jHandler()
    neo4j_handler.insert_nodes_and_edges(nodes, edges, brain_id)
    logging.info("Neo4j에 노드와 엣지 삽입 완료")

    # Step 3: 노드 정보를 벡터 DB에 임베딩
    # 컬렉션이 없으면 초기화
    if not embedding_service.is_index_ready(brain_id):
        embedding_service.initialize_collection(brain_id)
    
    # 노드 정보 임베딩 및 저장
    embeddings = embedding_service.update_index_and_get_embeddings(nodes, brain_id)
    logging.info("벡터 DB에 노드 임베딩 저장 완료")

    return {
        "message": "텍스트 처리 완료, 그래프(노드와 엣지)가 생성되었고 벡터 DB에 임베딩되었습니다.",
        "nodes": nodes,
        "edges": edges
    }

@router.post("/answer",
    summary="질문에 대한 답변 생성",
    description="사용자의 질문에 대해 Neo4j에서 관련 정보를 찾아 답변을 생성합니다.",
    response_description="생성된 답변을 반환합니다.")
async def answer_endpoint(request_data: AnswerRequest):
    """
    사용자 질문을 받아 임베딩을 통해 유사한 노드를 찾고, 
    해당 노드들의 2단계 깊이 스키마를 추출 후 LLM을 이용해 최종 답변 생성
    """
    question = request_data.question
    brain_id = request_data.brain_id  # 요청에서 brain_id 받아오기
    
    if not question:
        raise HTTPException(status_code=400, detail="question 파라미터가 필요합니다.")
    if not brain_id:
        raise HTTPException(status_code=400, detail="brain_id 파라미터가 필요합니다.")
    
    logging.info("질문 접수: %s, brain_id: %s", question, brain_id)
    
    try:
        # Step 1: 컬렉션이 없으면 초기화
        if not embedding_service.is_index_ready(brain_id):
            embedding_service.initialize_collection(brain_id)
            logging.info("Qdrant 컬렉션 초기화 완료: %s", brain_id)
        
        # Step 2: 질문 임베딩 계산
        question_embedding = embedding_service.encode_text(question)
        
        # Step 3: 임베딩을 통해 유사한 노드 검색
        similar_nodes = embedding_service.search_similar_nodes(embedding=question_embedding, brain_id=brain_id)
        if not similar_nodes:
            raise Exception("질문과 유사한 노드를 찾지 못했습니다.")
        
        # 노드 이름만 추출
        similar_node_names = [node["name"] for node in similar_nodes]
        logging.info("유사 노드 이름: %s", similar_node_names)
        logging.info("유사 노드 점수: %s", [f"{node['name']}:{node['score']:.2f}" for node in similar_nodes])
        
        # Step 4: 유사한 노드들의 2단계 깊이 스키마 조회
        neo4j_handler = Neo4jHandler()
        result = neo4j_handler.query_schema_by_node_names(similar_node_names, brain_id)
        if not result:
            raise Exception("스키마 조회 결과가 없습니다.")
            
        logging.info("### Neo4j 조회 결과 전체: %s", result)
        
        # 결과를 즉시 처리
        nodes_result = result.get("nodes", [])
        related_nodes_result = result.get("relatedNodes", [])
        relationships_result = result.get("relationships", [])
        
        logging.info("Neo4j 조회 결과: nodes=%d, related_nodes=%d, relationships=%d", 
                   len(nodes_result), len(related_nodes_result), len(relationships_result))
        
        # Step 5: 스키마 간결화 및 텍스트 구성
        raw_schema_text = ai_service.generate_schema_text(nodes_result, related_nodes_result, relationships_result)
        
        # Step 6: LLM을을 사용해 최종 답변 생성
        final_answer = ai_service.generate_answer(raw_schema_text, question)
        
        return {"answer": final_answer}
    except Exception as e:
        logging.error("answer 오류: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))