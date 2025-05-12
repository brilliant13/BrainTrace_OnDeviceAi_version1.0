import os
import sys

# 현재 파일(services/test.py)의 절대 경로를 얻습니다.
current_dir = os.path.dirname(os.path.abspath(__file__))
# 현재 파일이 있는 폴더의 상위 폴더: backend 폴더
backend_dir = os.path.dirname(current_dir)
# backend 폴더의 상위 폴더: 프로젝트 루트 (여기서는 C:\Users\Hansung\Desktop\mumu)
project_root = os.path.dirname(backend_dir)

# 프로젝트 루트를 sys.path의 맨 앞에 추가합니다.
sys.path.insert(0, project_root)

# 이제 "backend" 패키지를 기준으로 가져올 수 있습니다.
from backend.LLM.genie_bundle_3_2.get_response import get_response

# 테스트: get_response 함수를 호출하여 결과를 출력합니다.
sentence = input("input sentence : ")
print(get_response(sentence))
