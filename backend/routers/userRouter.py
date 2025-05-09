from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlite_db.sqlite_handler import SQLiteHandler
import logging

# SQLite 핸들러 인스턴스 생성
sqlite_handler = SQLiteHandler()

# 라우터 정의
router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}}
)

# Pydantic 모델 정의
class UserCreate(BaseModel):
    username: str = Field(..., description="사용자 이름", min_length=2, max_length=8, example="홍길동")
    password: str = Field(..., description="사용자 비밀번호", min_length=4, example="1234")

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, description="새 사용자 이름", min_length=2, max_length=8, example="이순신")
    password: Optional[str] = Field(None, description="새 비밀번호", min_length=4, example="5678")

class UserResponse(BaseModel):
    user_id: int = Field(..., description="사용자 ID", example=1)
    user_name: str = Field(..., description="사용자 이름", example="홍길동")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "user_name": "홍길동"
            }
        }

class UserAuth(BaseModel):
    username: str = Field(..., description="사용자 이름", example="홍길동")
    password: str = Field(..., description="비밀번호", example="1234")

# API 엔드포인트 정의
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED,
            summary="사용자 생성",
            description="새로운 사용자 계정을 생성합니다. 사용자 이름은 고유해야 합니다.",
            response_description="생성된 사용자 정보")
async def create_user(user_data: UserCreate):
    """
    새 사용자를 생성합니다:
    
    - **username**: 2-8자 사이의 고유한 사용자 이름
    - **password**: 최소 4자 이상의 비밀번호
    """
    try:
        user = sqlite_handler.create_user(user_data.username, user_data.password)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("사용자 생성 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.get("/", response_model=List[UserResponse],
           summary="모든 사용자 조회",
           description="시스템에 등록된 모든 사용자 목록을 반환합니다.",
           response_description="사용자 목록")
async def get_all_users():
    """모든 사용자 목록을 반환합니다."""
    users = sqlite_handler.get_all_users()
    return users

@router.get("/{user_id}", response_model=Optional[UserResponse],
           summary="특정 사용자 조회",
           description="지정된 ID의 사용자 정보를 반환합니다.",
           response_description="사용자 정보")
async def get_user(user_id: int):
    """
    지정된 사용자 정보를 반환합니다:
    
    - **user_id**: 조회할 사용자의 ID
    """
    user = sqlite_handler.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    return user

@router.put("/{user_id}", response_model=UserResponse,
           summary="사용자 정보 수정",
           description="사용자의 이름 또는 비밀번호를 업데이트합니다.",
           response_description="업데이트된 사용자 정보")
async def update_user(user_id: int, user_data: UserUpdate):
    """
    사용자 정보를 업데이트합니다:
    
    - **user_id**: 수정할 사용자의 ID
    - **username**: (선택) 새로운 사용자 이름
    - **password**: (선택) 새로운 비밀번호
    """
    # 사용자 존재 여부 확인
    user = sqlite_handler.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    # 업데이트 수행
    try:
        # 사용자 이름 업데이트
        if user_data.username:
            sqlite_handler.update_username(user_id, user_data.username)
            user["user_name"] = user_data.username
        
        # 비밀번호 업데이트
        if user_data.password:
            sqlite_handler.update_password(user_id, user_data.password)
        
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("사용자 업데이트 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT,
              summary="사용자 삭제",
              description="특정 사용자를 시스템에서 삭제합니다.")
async def delete_user(user_id: int):
    """
    사용자를 삭제합니다:
    
    - **user_id**: 삭제할 사용자의 ID
    """
    deleted = sqlite_handler.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")

@router.post("/auth", response_model=Optional[UserResponse],
            summary="사용자 인증",
            description="사용자 이름과 비밀번호로 인증을 수행합니다.",
            response_description="인증된 사용자 정보")
async def authenticate_user(auth_data: UserAuth):
    """
    사용자 인증을 수행합니다:
    
    - **username**: 사용자 이름
    - **password**: 비밀번호
    """
    user = sqlite_handler.authenticate_user(auth_data.username, auth_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증 실패: 사용자 이름 또는 비밀번호가 잘못되었습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user 