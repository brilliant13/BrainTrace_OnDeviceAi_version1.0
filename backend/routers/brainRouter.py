from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlite_db.sqlite_handler import SQLiteHandler
import logging

# SQLite 핸들러 인스턴스 생성
sqlite_handler = SQLiteHandler()

# 라우터 정의
router = APIRouter(
    prefix="/brains",
    tags=["brains"],
    responses={404: {"description": "Not found"}}
)

# Pydantic 모델 정의
class BrainCreate(BaseModel):
    brain_name: str = Field(..., description="브레인 이름", min_length=1, max_length=50, example="파이썬 학습")
    user_id: int = Field(..., description="소유자 사용자 ID", example=1)

class BrainUpdate(BaseModel):
    brain_name: str = Field(..., description="새 브레인 이름", min_length=1, max_length=50, example="파이썬 고급 학습")

class BrainResponse(BaseModel):
    brain_id: int = Field(..., description="브레인 ID", example=1)
    brain_name: str = Field(..., description="브레인 이름", example="파이썬 학습")
    user_id: int = Field(..., description="소유자 사용자 ID", example=1)
    
    class Config:
        schema_extra = {
            "example": {
                "brain_id": 1,
                "brain_name": "파이썬 학습",
                "user_id": 1
            }
        }

# API 엔드포인트 정의
@router.post("/", response_model=BrainResponse, status_code=status.HTTP_201_CREATED,
            summary="브레인 생성",
            description="새로운 브레인을 생성합니다. 각 브레인은 지식 그래프의 독립된 공간입니다.",
            response_description="생성된 브레인 정보")
async def create_brain(brain_data: BrainCreate):
    """
    새 브레인을 생성합니다:
    
    - **brain_name**: 브레인 이름
    - **user_id**: 브레인 소유자의 사용자 ID
    """
    try:
        brain = sqlite_handler.create_brain(brain_data.brain_name, brain_data.user_id)
        return brain
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("브레인 생성 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.get("/", response_model=List[BrainResponse],
           summary="모든 브레인 조회",
           description="시스템에 등록된 모든 브레인 목록을 반환합니다.",
           response_description="브레인 목록")
async def get_all_brains():
    """모든 브레인 목록을 반환합니다."""
    brains = sqlite_handler.get_all_brains()
    return brains

@router.get("/user/{user_id}", response_model=List[BrainResponse],
           summary="사용자 브레인 조회",
           description="특정 사용자가 소유한 모든 브레인 목록을 반환합니다.",
           response_description="브레인 목록")
async def get_user_brains(user_id: int):
    """
    특정 사용자의 모든 브레인을 반환합니다:
    
    - **user_id**: 브레인을 소유한 사용자 ID
    """
    # 사용자 존재 여부 확인
    user = sqlite_handler.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
        
    brains = sqlite_handler.get_user_brains(user_id)
    return brains

@router.get("/{brain_id}", response_model=BrainResponse,
           summary="특정 브레인 조회",
           description="지정된 ID의 브레인 정보를 반환합니다.",
           response_description="브레인 정보")
async def get_brain(brain_id: int):
    """
    지정된 브레인 정보를 반환합니다:
    
    - **brain_id**: 조회할 브레인의 ID
    """
    brain = sqlite_handler.get_brain(brain_id)
    if not brain:
        raise HTTPException(status_code=404, detail="브레인을 찾을 수 없습니다")
    return brain

@router.put("/{brain_id}", response_model=BrainResponse,
           summary="브레인 이름 수정",
           description="브레인의 이름을 업데이트합니다.",
           response_description="업데이트된 브레인 정보")
async def update_brain(brain_id: int, brain_data: BrainUpdate):
    """
    브레인 이름을 업데이트합니다:
    
    - **brain_id**: 수정할 브레인의 ID
    - **brain_name**: 새로운 브레인 이름
    """
    # 브레인 존재 여부 확인
    brain = sqlite_handler.get_brain(brain_id)
    if not brain:
        raise HTTPException(status_code=404, detail="브레인을 찾을 수 없습니다")
    
    # 업데이트 수행
    try:
        sqlite_handler.update_brain_name(brain_id, brain_data.brain_name)
        brain["brain_name"] = brain_data.brain_name
        return brain
    except Exception as e:
        logging.error("브레인 업데이트 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.delete("/{brain_id}", status_code=status.HTTP_204_NO_CONTENT,
              summary="브레인 삭제",
              description="특정 브레인을 시스템에서 삭제합니다.")
async def delete_brain(brain_id: int):
    """
    브레인을 삭제합니다:
    
    - **brain_id**: 삭제할 브레인의 ID
    """
    deleted = sqlite_handler.delete_brain(brain_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="브레인을 찾을 수 없습니다") 