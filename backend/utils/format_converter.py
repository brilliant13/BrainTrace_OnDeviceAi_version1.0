def convert_neo4j_to_forcegraph(neo4j_result: dict) -> dict:
    """Neo4j 결과를 ForceGraph 시각화용 { nodes, links } 형식으로 변환"""
    # 노드 추출
    all_nodes = neo4j_result.get("nodes", []) + neo4j_result.get("relatedNodes", [])
    node_map = {}

    for node in all_nodes:
        if node is None:
            continue
        props = dict(node.items())
        name = props.get("name", "")
        label = props.get("label", "")
        node_map[name] = {
            "id": name,
            "label": label,
            "group": label
        }

    # 링크 추출
    relationships = neo4j_result.get("relationships", [])
    links = []
    for rel in relationships:
        try:
            source = dict(rel.start_node.items()).get("name", "")
            target = dict(rel.end_node.items()).get("name", "")
            relation = dict(rel).get("relation", getattr(rel, "type", "관계"))
            links.append({
                "source": source,
                "target": target,
                "label": relation
            })
        except Exception as e:
            print(f"❌ 관계 처리 오류: {e}")

    return {
        "nodes": list(node_map.values()),
        "links": links
    }
