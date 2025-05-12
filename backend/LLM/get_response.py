import os
import subprocess
import re

import re
import json

def extract_cypher_query(output_text: str) -> dict:
    """
    [BEGIN]: 와 [END] 태그 사이의 텍스트를 먼저 추출한 후,
    그 안에서 JSON 객체 형식( { ... } )만 추출하여 파싱하여 반환합니다.
    """
    # 1단계: [BEGIN]: 와 [END] 사이의 텍스트 추출
    tag_match = re.search(r'\[BEGIN\]:\s*(.*?)\s*\[END\]', output_text, re.DOTALL)
    if not tag_match:
        return None
    tag_text = tag_match.group(1).strip()
    
    # 2단계: 태그 내에서 JSON 객체 형식의 부분을 추출 (첫 번째 '{'부터 대응하는 '}'까지)
    json_match = re.search(r'(\{.*\})', tag_text, re.DOTALL)
    if not json_match:
        return None
    json_str = json_match.group(1).strip()
    
    # 3단계: JSON 문자열 파싱
    try:
        return json_str
    except json.decoder.JSONDecodeError as e:
        print("JSON 파싱 오류:", e)
        return None

def get_response(memo_text):
    # 현재 파일(get_response.py)이 있는 LLM 폴더 경로
    local_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 실행 파일과 설정 파일은 genie_bundle_3_2 폴더 안에 있다고 가정
    genie_dir = os.path.join(local_dir, "genie_bundle_3_2")
    exe_path = os.path.join(genie_dir, "genie-t2t-run.exe")
    config_path = os.path.join(genie_dir, "genie_config.json")
    
    # prompt = (
    #     "<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n"
    #     "Analyze the following text and extract node and edge information. "
    #     "Output nodes as an array of objects in the following format: { \"label\": string, \"name\": string, \"description\": string }. "
    #     "Output edges as an array of objects in the following format: { \"source\": string, \"target\": string, \"relation\": string }. "
    #     "For edges, source and target should reference the node's name, and do not use source_id. "
    #     "The output must strictly adhere to the JSON format below, and any other words or explanations not allowed:\n"
    #     "{\n"
    #     '  "nodes": [ ... ],\n'
    #     '  "edges": [ ... ]\n'
    #     "}\n"
    #     "Extract all concepts mentioned in the text as nodes. Each node's description should be a concise sentence that explains the node. "
    #     "If a long description contains multiple concepts, split them into separate nodes so that each description addresses only one concept. "
    #     "Node labels and names should be in English, and avoid adding any extraneous details not present in the text. "
    #     "If no node or edge information can be extracted, output empty arrays.\n\n"
    #     "Output must be in JSON format only, no other words.\n"
    #     + memo_text +
    #     "\n<|eot_id|><|start_header_id|>assistant<|end_header_id|>"
    # )
        # prompt = (
        # "<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n"
        # "Extract node and edge information from the text below. For nodes, output an array with keys: 'label', 'name', and 'description' (each description should be a concise sentence explaining the concept). For edges, output an array with keys: 'source', 'target', and 'relation'. Find relationships between nodes directly from the sentences (only consider relationships that are explicitly mentioned or implied in the text).\n\n"
        # "Output must be valid JSON exactly like this example:\n"
        # "{\n"
        # '  "nodes": [ {"label": "Concept", "name": "example", "description": "Brief explanation."} ],\n'
        # '  "edges": [ {"source": "example", "target": "another_example", "relation": "related_to"} ]\n'
        # "}\n\n"
        # "If nothing is found, output { \"nodes\": [], \"edges\": [] }.\n\n"
        # "Text: " + memo_text + "\n"
        # "<|eot_id|><|start_header_id|>assistant<|end_header_id|>"
        # )
    prompt = (
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n"
    "Analyze the following text and extract node and edge information. "
    "Output nodes as an array of objects in the following format: "
    "{ \"label\": string, \"name\": string, \"description\": string }. "
    "Output edges as an array of objects in the following format: "
    "{ \"source\": string, \"target\": string, \"relation\": string }. "
    "For edges, 'source' and 'target' must refer only to the node's name and no additional identifiers (e.g. source_id) should be used. \n"
    "The output must strictly adhere to the JSON format shown below, and no extra commentary or text is allowed:\n"
    "{\n"
    '  "nodes": [ ... ],\n'
    '  "edges": [ ... ]\n'
    "}\n\n"
    "Extract all concepts mentioned in the text as nodes. Each node's description must be a concise sentence that explains the node. "
    "If a long description includes multiple concepts, split it into multiple nodes so that each description addresses only one concept. "
    "Node labels and names must be expressed in English, and do not add any extraneous details that are not present in the text. "
    "If no node or edge information can be extracted, output empty arrays.\n\n"
    "Output must be in JSON format only. Do not output any additional text.\n\n"
    "Text: " + memo_text + "\n"
    "<|eot_id|><|start_header_id|>assistant<|end_header_id|>"
    )




    
    # genie_bundle_3_2 폴더를 작업 디렉터리(cwd)로 설정하여 실행
    process = subprocess.run(
        [exe_path, "-c", config_path, "-p", prompt],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        cwd=genie_dir
    )
    output = process.stdout.strip()
    
    cypher_query = extract_cypher_query(output)
    
    print("\n추출된 쿼리:")
    if cypher_query:
        print(cypher_query)
    else:
        print("쿼리 추출 실패 - 태그가 존재하지 않습니다.")
    
    return cypher_query

if __name__ == '__main__':
    memo = input("input sentence : ")
    get_response(memo)
