import logging
import openai
import json
from .chunk_service import chunk_text

# OpenAI 클라이언트 설정 (노드/엣지 추출에 활용)
client = openai.OpenAI(api_key="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")

def extract_graph_components(text: str, source_id: str):
    """
    입력 텍스트에서 LLM을 활용해 노드와 엣지 정보를 추출합니다.
    텍스트가 2000자 이상인 경우 청킹하여 처리합니다.
    반환 형식: (nodes: list, edges: list)
    """
    # 모든 노드와 엣지를 저장할 리스트
    all_nodes = []
    all_edges = []
    
    # 텍스트가 2000자 이상이면 청킹
    if len(text) >= 2000:
        chunks = chunk_text(text)
        logging.info(f"✅ 텍스트가 {len(chunks)}개의 청크로 분할되어 처리됩니다.")
        
        # 각 청크별로 노드와 엣지 추출
        for i, chunk in enumerate(chunks, 1):
            logging.info(f"청크 {i}/{len(chunks)} 처리 중...")
            nodes, edges = _extract_from_chunk(chunk, source_id)
            all_nodes.extend(nodes)
            all_edges.extend(edges)
    else:
        # 2000자 미만이면 직접 처리
        all_nodes, all_edges = _extract_from_chunk(text, source_id)
    
    # 중복 제거
    all_nodes = _remove_duplicate_nodes(all_nodes)
    all_edges = _remove_duplicate_edges(all_edges)
    
    logging.info(f"✅ 총 {len(all_nodes)}개의 노드와 {len(all_edges)}개의 엣지가 추출되었습니다.")
    return all_nodes, all_edges

def _extract_from_chunk(chunk: str, source_id: str):
    """개별 청크에서 노드와 엣지 정보를 추출합니다."""
    prompt = (
        "다음 텍스트를 분석해서 노드와 엣지 정보를 추출해줘. "
        "노드는 { \"label\": string, \"name\": string, \"description\": string } 형식의 객체 배열, "
        "엣지는 { \"source\": string, \"target\": string, \"relation\": string } 형식의 객체 배열로 출력해줘. "
        "여기서 source와 target은 노드의 name을 참조해야 해. source_id를 사용하면 안돼. "
        "출력 결과는 반드시 다음 JSON 형식을 지켜야 해:\n"
        "{\n"
        '  "nodes": [ ... ],\n'
        '  "edges": [ ... ]\n'
        "}\n"
        "description은 해당 노드에 대한 간단한 설명을 포함해야 해. description은 최대한 간단하게 표현해줘."
        "노드는 한글로 해줘. 만약 추출할 내용이 없으면 빈 배열을 출력해줘.\n\n"
        "텍스트에서 알 수 없는 정보는 추가 금지"
        "*json 형식 외에는 출력 금지*\n\n"
        f"텍스트: {chunk}"
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "너는 텍스트에서 구조화된 노드와 엣지를 추출하는 전문가야. 엣지의 source와 target은 반드시 노드의 name을 참조해야 해."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=5000,
            temperature=0.3
        )
        result_text = response.choices[0].message.content.strip()
        data = json.loads(result_text)
        
        # 각 노드에 source_id 추가 및 구조 검증
        valid_nodes = []
        for node in data.get("nodes", []):
            # 필수 필드 검증
            if not all(key in node for key in ["label", "name"]):
                logging.warning("필수 필드가 누락된 노드: %s", node)
                continue
                
            # descriptions 필드 초기화
            if "descriptions" not in node:
                node["descriptions"] = []
                
            # source_id 추가
            node["source_id"] = source_id
            
            # description 처리
            if "description" in node:
                node["descriptions"].append({
                    "description": node["description"],
                    "source_id": source_id  # 각 description에도 source_id 추가
                })
                del node["description"]
                
            valid_nodes.append(node)
        
        # 엣지의 source와 target이 노드의 name을 참조하는지 검증
        valid_edges = []
        node_names = {node["name"] for node in valid_nodes}
        for edge in data.get("edges", []):
            if "source" in edge and "target" in edge and "relation" in edge:
                if edge["source"] in node_names and edge["target"] in node_names:
                    valid_edges.append(edge)
                else:
                    logging.warning("잘못된 엣지 참조: %s", edge)
            else:
                logging.warning("필수 필드가 누락된 엣지: %s", edge)
        
        return valid_nodes, valid_edges
    except Exception as e:
        logging.error(f"청크 처리 중 오류 발생: {str(e)}")
        return [], []

def _remove_duplicate_nodes(nodes: list) -> list:
    """중복된 노드를 제거합니다."""
    seen = set()
    unique_nodes = []
    for node in nodes:
        node_key = (node["name"], node["label"])
        if node_key not in seen:
            seen.add(node_key)
            unique_nodes.append(node)
        else:
            # 같은 이름의 노드가 있으면 descriptions만 추가
            for existing_node in unique_nodes:
                if existing_node["name"] == node["name"] and existing_node["label"] == node["label"]:
                    existing_node["descriptions"].extend(node["descriptions"])
    return unique_nodes

def _remove_duplicate_edges(edges: list) -> list:
    """중복된 엣지를 제거합니다."""
    seen = set()
    unique_edges = []
    for edge in edges:
        edge_key = (edge["source"], edge["target"], edge["relation"])
        if edge_key not in seen:
            seen.add(edge_key)
            unique_edges.append(edge)
    return unique_edges

def generate_answer(schema_text: str, question: str) -> str:
    """
    스키마 텍스트와 질문을 기반으로 AI를 호출하여 최종 답변을 생성합니다.
    """
    prompt = (
        "다음 스키마와 질문을 바탕으로 AI를 호출하여 최종 답변을 생성해줘.\n\n"
        "스키마:\n" + schema_text + "\n\n"
        "질문: " + question + "\n\n"
        "답변할 때 반드시 참고한 핵심 노드 정보도 함께 제공해줘. 다음 형식으로 응답해줘:\n\n"
        "답변: [여기에 질문에 대한 상세 답변 제공]\n\n"
        "참고한 노드: [답변 생성에 사용한 핵심 노드 이름들을 쉼표로 구분하여 나열]"
    )
    try:
        gpt_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "너는 Neo4j 스키마 정보를 기반으로 질문에 답하는 AI 어시스턴트야. 항상 참고한 노드 정보도 함께 제공해야 해."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=512,
            temperature=0.6
        )
        final_answer = gpt_response.choices[0].message.content.strip()
        return final_answer
    except Exception as e:
        logging.error("GPT 응답 오류: %s", str(e))
        raise RuntimeError("GPT 응답 생성 중 오류 발생")

def generate_schema_text(nodes, related_nodes, relationships) -> str:
    """
    Neo4j에서 가져온 노드, 인접 노드, 관계 데이터를 받아 간략한 스키마 텍스트를 생성합니다.
    """
    try:
        logging.info("스키마 텍스트 생성 시작: %d개 노드, %d개 관련 노드, %d개 관계",
                    len(nodes) if isinstance(nodes, list) else 0,
                    len(related_nodes) if isinstance(related_nodes, list) else 0,
                    len(relationships) if isinstance(relationships, list) else 0)
                    
        def filter_node(node):
            try:
                if node is None:
                    return {"name": "알 수 없음", "label": "알 수 없음", "descriptions": []}
                    
                # Neo4j 노드 객체인 경우 dict로 변환
                d = dict(node) if hasattr(node, '__iter__') else {}
                
                # 필수 필드 확인
                name = d.get("name", "알 수 없음")
                label = d.get("label", "알 수 없음")
                descriptions = d.get("descriptions", [])
                
                # descriptions가 문자열인 경우 JSON으로 파싱
                parsed_descriptions = []
                if descriptions:
                    if isinstance(descriptions, str):
                        try:
                            descriptions = [json.loads(descriptions)]
                        except json.JSONDecodeError:
                            descriptions = []
                    
                    for desc_item in descriptions:
                        if isinstance(desc_item, str):
                            try:
                                desc_obj = json.loads(desc_item)
                                if isinstance(desc_obj, dict):
                                    parsed_descriptions.append(desc_obj)
                            except json.JSONDecodeError:
                                continue
                        elif isinstance(desc_item, dict):
                            parsed_descriptions.append(desc_item)
                
                return {
                    "name": name,
                    "label": label,
                    "descriptions": parsed_descriptions
                }
            except Exception as e:
                logging.error("노드 필터링 오류: %s", str(e))
                return {"name": "알 수 없음", "label": "알 수 없음", "descriptions": []}
        
        # 노드 처리
        all_nodes = {}
        for node in nodes if isinstance(nodes, list) else []:
            if node is not None:
                node_data = filter_node(node)
                all_nodes[node_data["name"]] = node_data
        
        # 관련 노드 처리
        for node in related_nodes if isinstance(related_nodes, list) else []:
            if node is not None:
                node_data = filter_node(node)
                if node_data["name"] not in all_nodes:
                    all_nodes[node_data["name"]] = node_data
        
        # 관계 처리
        simplified_relationships = []
        
        # 관계 데이터 타입 검증
        if not relationships:
            logging.warning("관계 데이터가 비어 있습니다.")
        elif isinstance(relationships, str):
            logging.warning("관계 데이터가 문자열입니다: %s", relationships)
        else:
            for rel in relationships:
                try:
                    if rel is None:
                        continue
                        
                    # Neo4j 관계 객체 검증 및 안전한 처리
                    if not hasattr(rel, 'start_node') or not hasattr(rel, 'end_node'):
                        logging.warning("유효하지 않은 관계 객체: %s", str(rel))
                        continue
                    
                    # 시작 노드와 끝 노드 정보 추출
                    try:
                        start_node_obj = rel.start_node
                        end_node_obj = rel.end_node
                        
                        start_node_dict = dict(start_node_obj) if hasattr(start_node_obj, '__iter__') else {}
                        end_node_dict = dict(end_node_obj) if hasattr(end_node_obj, '__iter__') else {}
                        
                        start_node_name = start_node_dict.get("name", "알 수 없음")
                        end_node_name = end_node_dict.get("name", "알 수 없음")
                        
                        # 관계 유형 추출
                        relation_type = rel.type if hasattr(rel, 'type') else "관계"
                        relation_props = dict(rel) if hasattr(rel, '__iter__') else {}
                        relation_label = relation_props.get("relation", relation_type)
                        
                        # 노드 정보 가져오기
                        start_node = all_nodes.get(start_node_name, {"name": start_node_name, "label": "알 수 없음", "descriptions": []})
                        end_node = all_nodes.get(end_node_name, {"name": end_node_name, "label": "알 수 없음", "descriptions": []})
                        
                        # descriptions에서 description 텍스트만 추출
                        start_descs = []
                        for desc in start_node.get("descriptions", []):
                            if isinstance(desc, dict) and "description" in desc:
                                desc_text = desc.get("description", "")
                                if desc_text:
                                    start_descs.append(desc_text)
                        
                        end_descs = []
                        for desc in end_node.get("descriptions", []):
                            if isinstance(desc, dict) and "description" in desc:
                                desc_text = desc.get("description", "")
                                if desc_text:
                                    end_descs.append(desc_text)
                        
                        start_desc_str = ", ".join(start_descs) if start_descs else ""
                        end_desc_str = ", ".join(end_descs) if end_descs else ""
                        
                        # 형식: label-name(descriptions) -> relation -> label-name(descriptions)
                        start_label = start_node.get("label", "")
                        end_label = end_node.get("label", "")
                        
                        relationship_str = f"{start_label}-{start_node.get('name', '알 수 없음')}({start_desc_str}) -> {relation_label} -> {end_label}-{end_node.get('name', '알 수 없음')}({end_desc_str})"
                        simplified_relationships.append(relationship_str)
                    except Exception as e:
                        logging.error("관계 정보 추출 오류: %s", str(e))
                        continue
                except Exception as e:
                    logging.error("관계 처리 오류: %s", str(e))
                    continue
        
        # 중복 제거
        simplified_relationships = list(set(simplified_relationships))
        
        # 노드 정보 생성
        node_info_list = []
        for node in all_nodes.values():
            try:
                node_descs = []
                for desc in node.get("descriptions", []):
                    if isinstance(desc, dict) and "description" in desc:
                        desc_text = desc.get("description", "")
                        if desc_text:
                            node_descs.append(desc_text)
                
                desc_str = ", ".join(node_descs) if node_descs else ""
                node_label = node.get("label", "")
                node_info = f"{node_label}-{node.get('name', '알 수 없음')}({desc_str})"
                node_info_list.append(node_info)
            except Exception as e:
                logging.error("노드 정보 생성 오류: %s", str(e))
                continue
        
        if not simplified_relationships and not node_info_list:
            logging.warning("스키마 정보가 없습니다.")
            return "스키마 정보를 찾을 수 없습니다."
        
        # 스키마 텍스트 생성
        raw_schema_text = ""
        if simplified_relationships:
            raw_schema_text += "관계:\n" + "\n".join(simplified_relationships)
        
        if node_info_list:
            if raw_schema_text:
                raw_schema_text += "\n\n"
            raw_schema_text += "노드:\n" + "\n".join(node_info_list)
        
        logging.info("스키마 텍스트 생성 완료 (%d자)\n%s", len(raw_schema_text), raw_schema_text)
        return raw_schema_text
    except Exception as e:
        logging.error("스키마 생성 오류: %s", str(e))
        return "스키마 생성 실패"
from fastapi import APIRouter, HTTPException
from models.request_models import ProcessTextRequest, AnswerRequest
from services import ai_service, embedding_service
from neo4j_db.Neo4jHandler import Neo4jHandler
import logging

router = APIRouter(
    prefix="/brainGraph",
    tags=["brainGraph"],
    responses={404: {"description": "Not found"}},
)

@router.post(
    "/process_text", 
    summary="텍스트 처리 및 그래프 생성",
    description="입력 텍스트에서 노드와 엣지를 추출하여 Neo4j에 저장한 뒤, 노드 정보를 벡터 DB에 임베딩합니다.",
    response_description="처리된 노드와 엣지 정보를 반환합니다."
)
async def process_text_endpoint(request_data: ProcessTextRequest):
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
    
    # Step 1: 텍스트에서 노드/엣지 추출 (AI 서비스 이용)
    nodes, edges = ai_service.extract_graph_components(text, source_id)
    logging.info("추출된 노드: %s", nodes)
    logging.info("추출된 엣지: %s", edges)

    # Step 2: Neo4j에 노드와 엣지 저장
    neo4j_handler = Neo4jHandler()
    neo4j_handler.insert_nodes_and_edges(nodes, edges)
    logging.info("Neo4j에 노드와 엣지 삽입 완료")

    # Step 3: 벡터 DB 임베딩 (컬렉션이 없으면 초기화)
    if not embedding_service.is_index_ready(brain_id):
        embedding_service.initialize_collection(brain_id)
    embeddings = embedding_service.update_index_and_get_embeddings(brain_id, nodes)
    logging.info("벡터 DB에 노드 임베딩 저장 완료")

    return {
        "message": "텍스트 처리 완료: 그래프가 생성되었고 벡터 DB에 임베딩되었습니다.",
        "nodes": nodes,
        "edges": edges
    }

@router.post(
    "/answer",
    summary="질문에 대한 답변 생성",
    description="사용자 질문을 기반으로 Neo4j에서 유사 노드를 검색하고 스키마를 조회한 후 최종 답변을 생성합니다.",
    response_description="생성된 답변을 반환합니다."
)
async def answer_endpoint(request_data: AnswerRequest):
    question = request_data.question
    brain_id = request_data.brain_id
    
    if not question:
        raise HTTPException(status_code=400, detail="question 파라미터가 필요합니다.")
    if not brain_id:
        raise HTTPException(status_code=400, detail="brain_id 파라미터가 필요합니다.")
    
    logging.info("질문: %s, brain_id: %s", question, brain_id)
    
    try:
        # 컬렉션이 없으면 초기화
        if not embedding_service.is_index_ready(brain_id):
            embedding_service.initialize_collection(brain_id)
            logging.info("Qdrant 컬렉션 초기화 완료: %s", brain_id)
        
        # 질문 임베딩 계산
        question_embedding = embedding_service.encode_text(question)
        
        # 임베딩 검색
        similar_node_names = embedding_service.search_similar_nodes(brain_id, question_embedding)
        if not similar_node_names:
            raise Exception("질문과 유사한 노드를 찾지 못했습니다.")
        logging.info("유사 노드: %s", similar_node_names)
        
        # 관련 노드 스키마 조회
        neo4j_handler = Neo4jHandler()
        schema_record = neo4j_handler.query_schema_by_node_names(similar_node_names)
        if not schema_record:
            raise Exception("스키마 조회 결과가 없습니다.")
        
        nodes_result = schema_record.get("nodes", [])
        related_nodes_result = schema_record.get("relatedNodes", [])
        relationships_result = schema_record.get("relationships", [])
        
        # 스키마 텍스트 생성 및 LLM 답변 생성
        raw_schema_text = ai_service.generate_schema_text(nodes_result, related_nodes_result, relationships_result)
        final_answer = ai_service.generate_answer(raw_schema_text, question)
        
        return {"answer": final_answer}
    except Exception as e:
        logging.error("answer 오류: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))
