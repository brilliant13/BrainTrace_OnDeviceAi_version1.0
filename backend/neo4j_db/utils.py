# neo4j/utils.py 또는 neo4j/run_neo4j.py
import os
import subprocess
import logging

def run_neo4j():
    is_windows = os.name == 'nt'
    
    # 사용자가 지정한 Neo4j 설치 경로
    neo4j_base_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'neo4j')
    
    if is_windows:
        script_path = os.path.join(neo4j_base_path, 'bin', 'neo4j.bat')
        if not os.path.exists(script_path):
            raise FileNotFoundError(f"Neo4j를 찾을 수 없습니다. 다음 경로를 확인하세요: {script_path}")
        
        cmd = [script_path, "console"]
        logging.info(f"Neo4j 실행 경로: {script_path}")
        process = subprocess.Popen(cmd, shell=True)
        return process
    else:
        script_path = os.path.join(neo4j_base_path, 'bin', 'neo4j')
        if not os.path.exists(script_path):
            script_path += '.sh'
        
        if not os.path.exists(script_path):
            raise FileNotFoundError(f"Neo4j를 찾을 수 없습니다. 다음 경로를 확인하세요: {script_path}")
        
        cmd = [script_path, "console"]
        logging.info(f"Neo4j 실행 경로: {script_path}")
        process = subprocess.Popen(cmd, shell=False)
        return process
