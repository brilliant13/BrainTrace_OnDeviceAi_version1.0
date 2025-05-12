import os
import subprocess
import re


def parse_response(response_text):
    # 1단계: [BEGIN]: 와 [END] 사이의 텍스트 추출
    begin_end_pattern = r'\[BEGIN\]:\s*(.*?)\s*\[END\]'
    match = re.search(begin_end_pattern, response_text, re.DOTALL)
    if not match:
        print("ERROR: [BEGIN]와 [END] 사이의 텍스트를 찾을 수 없습니다.")
        return None, None
    
    content = match.group(1)
    
    # 2단계: 추출된 콘텐츠에서 Answer와 Referenced nodes 파싱
    answer_pattern = r'Answer:\s*(.*?)\s*(?=Referenced nodes:)'
    ref_nodes_pattern = r'Referenced nodes:\s*(.*)'
    
    answer_match = re.search(answer_pattern, content, re.DOTALL)
    ref_nodes_match = re.search(ref_nodes_pattern, content, re.DOTALL)
    
    answer = answer_match.group(1).strip() if answer_match else None
    referenced_nodes = ref_nodes_match.group(1).strip() if ref_nodes_match else None
    return answer, referenced_nodes


def get_answer(schema_text: str, question: str):
    # 현재 파일(get_answer.py)이 있는 LLM 폴더 경로
    local_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"현재 파일 경로: {__file__}")
    print(f"절대 경로: {os.path.abspath(__file__)}")
    print(f"로컬 디렉토리: {local_dir}")

    # genie-t2t-run.exe와 genie_config.json 파일은 genie_bundle_3_2 폴더 안에 있습니다.
    genie_dir = os.path.join(local_dir, "genie_bundle_3_2")
    print(f"Genie 디렉토리: {genie_dir}")
    exe_path = os.path.join(genie_dir, "genie-t2t-run.exe")
    config_path = os.path.join(genie_dir, "genie_config.json")
    print(f"실행 파일 경로: {exe_path}")
    print(f"설정 파일 경로: {config_path}")
    
    # 파일 존재 여부 확인
    print(f"실행 파일 존재 여부: {os.path.exists(exe_path)}")
    print(f"설정 파일 존재 여부: {os.path.exists(config_path)}")

    prompt = (
        "<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n"
        "Generate the final answer by invoking the AI based on the following schema and question.\n\n"
        "Schema:\n" + schema_text + "\n\n"
        "Question: " + question + "\n\n"
        "When providing your answer, be sure to include the key node information that you referenced. Please respond using the following format:\n\n"
        "Answer: [Provide a detailed answer to the question here]\n\n"
        "Referenced nodes: [List the names of the key nodes used to generate the answer, separated by commas]"
        "Only list the node names for the referenced nodes."
        "\n<|eot_id|><|start_header_id|>assistant<|end_header_id|>"
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
    
    # 응답에서 Answer와 Referenced nodes 부분 추출
    # answer_match = re.search(r'Answer:\s*(.*?)(?=Referenced nodes:|$)', output, re.DOTALL)
    # nodes_match = re.search(r'Referenced nodes:\s*(.*?)$', output, re.DOTALL)
    
    # answer = answer_match.group(1).strip() if answer_match else "답변을 생성할 수 없습니다."
    # referenced_nodes = nodes_match.group(1).strip() if nodes_match else ""
    
    print("output: ", output)
    
    # 파싱 실행
    answer, referenced_nodes = parse_response(output)

    print("answer: ", answer)
    print("referenced_nodes: ", referenced_nodes)

    return {
        "answer": answer,
        "referenced_nodes": referenced_nodes
    }

if __name__ == '__main__':
    result = get_answer(schema, question)
    print("\n최종 결과:")
    print(result)
