import os
import sys
import subprocess
import re

def extract_content(output_text):
    match = re.search(r'\[BEGIN\]:\s*(.*?)\[END\]', output_text, re.DOTALL)
    if match:
        return match.group(1).strip()
    else:
        return None

def basic_chat(question):
    # 현재 파일(get_response.py)이 있는 폴더 경로 (예: ...\backend\LLM)
    local_dir = os.path.dirname(os.path.abspath(__file__))
    # genie-t2t-run.exe와 genie_config.json 파일은 genie_bundle_3_2 폴더 안에 있습니다.
    genie_dir = os.path.join(local_dir, "genie_bundle_3_2")
    exe_path = os.path.join(genie_dir, "genie-t2t-run.exe")
    config_path = os.path.join(genie_dir, "genie_config.json")
    
    # 질문 텍스트를 그대로 prompt로 사용합니다.
    prompt = f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n{question}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"

    # genie_bundle_3_2 폴더를 작업 디렉터리(cwd)로 설정하여 실행합니다.
    process = subprocess.run(
        [exe_path, "-c", config_path, "-p", prompt],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        cwd=genie_dir
    )
    output = process.stdout.strip()

    content = extract_content(output)
    return content
