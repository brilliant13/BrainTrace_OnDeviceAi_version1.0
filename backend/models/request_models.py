from pydantic import BaseModel, Field
# Pydantic은 FastAPI가 사용하는 데이터 검증 및 직렬화 라이브러리

class ProcessTextRequest(BaseModel):
    text: str
    brain_id: str = Field(..., description="브레인 ID (문자열)")
    source_id: str = Field(..., description="소스 ID (문자열)")

class AnswerRequest(BaseModel):
    question: str
    brain_id: str = Field(..., description="브레인 ID (문자열)")
