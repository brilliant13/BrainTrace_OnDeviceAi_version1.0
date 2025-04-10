from neo4j import GraphDatabase
import logging
import json

NEO4J_URI = "bolt://localhost:7687"
NEO4J_AUTH = ("neo4j", "YOUR_PASSWORD")  # 실제 비밀번호로 교체


class Neo4jHandler:
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH)

    def close(self):
        self.driver.close()

    #노드와 엣지를 저장
    def insert_nodes_and_edges(self, nodes, edges):
        try:
            with self.driver.session() as session:
                for node in nodes:
                    session.run(
                        """
                        MERGE (n:Node {name: $name})
                        SET n.label = $label, n.description = $description
                        """,
                        name=node["name"],
                        label=node["label"],
                        description=node["description"]
                    )
                for edge in edges:
                    session.run(
                        """
                        MATCH (a:Node {name: $source}), (b:Node {name: $target})
                        CREATE (a)-[:REL {relation: $relation}]->(b)
                        """,
                        source=edge["source"],
                        target=edge["target"],
                        relation=edge["relation"]
                    )
        except Exception as e:
            logging.error("Neo4j 저장 오류: %s", str(e))
            raise RuntimeError("Neo4j에 데이터 저장 중 오류가 발생했습니다.")

    def fetch_all_nodes(self):
        nodes = []
        try:
            with self.driver.session() as session:
                result = session.run("MATCH (n:Node) RETURN n.label AS label, n.name AS name, n.description AS description")
                for record in result:
                    nodes.append({
                        "label": record["label"],
                        "name": record["name"],
                        "description": record["description"]
                    })
        except Exception as e:
            logging.error("노드 불러오기 오류: %s", str(e))
        return nodes

    def query_schema_by_node_names(self, node_names):
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH (n:Node)
                    WHERE n.name IN $names
                    OPTIONAL MATCH (n)-[r*1..2]-(m:Node)
                    WITH DISTINCT n, m, r
                    RETURN collect(n) AS nodes, collect(m) AS relatedNodes, collect(r) AS relationships
                    """,
                    names=node_names
                )
                return result.single()
        except Exception as e:
            logging.error("Neo4j 쿼리 오류: %s", str(e))
            raise RuntimeError("Neo4j 쿼리 실행 중 오류 발생")
