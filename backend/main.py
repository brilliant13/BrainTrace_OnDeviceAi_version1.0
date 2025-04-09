from fastapi import FastAPI
from neo4j_db.utils import run_neo4j
import uvicorn  # ✅ 추가

app = FastAPI(title="BrainTrace API")

@app.get("/")
async def root():
    return {"message": "BrainTrace API에 오신 것을 환영합니다!"}

if __name__ == "__main__":
   
    import signal
    import os

    neo4j_process = None
    try:
        neo4j_process = run_neo4j()
        if neo4j_process:
            print("✅ Neo4j 실행됨. FastAPI 서버도 바로 시작합니다!")
        else:
            print("❌ Neo4j 실행 실패")
        
        print("🚀 FastAPI 실행 중... http://127.0.0.1:8000")
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

    except KeyboardInterrupt:
        print("⛔ 종료 감지. Neo4j 정리 중...")
    finally:
        if neo4j_process:
            if os.name == "nt":
                neo4j_process.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                neo4j_process.terminate()
            neo4j_process.wait()
