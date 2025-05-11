from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlite_db.sqlite_handler import SQLiteHandler
import logging

# SQLite 핸들러 인스턴스 생성
sqlite_handler = SQLiteHandler()

# 라우터 정의
router = APIRouter(
    prefix="/voices",
    tags=["voices"],
    responses={404: {"description": "Not found"}}
)

# Pydantic 모델 정의
class VoiceCreate(BaseModel):
    voice_title: str = Field(..., description="음성 파일 제목", min_length=1, max_length=100)
    voice_path: str = Field(..., description="음성 파일 경로")
    folder_id: Optional[int] = Field(None, description="음성 파일이 속한 폴더 ID")
    type: Optional[str] = Field(None, description="파일 확장자명")

class VoiceUpdate(BaseModel):
    voice_title: Optional[str] = Field(None, description="새 음성 파일 제목", min_length=1, max_length=100)
    voice_path: Optional[str] = Field(None, description="새 음성 파일 경로")
    type: Optional[str] = Field(None, description="파일 확장자명")

class VoiceResponse(BaseModel):
    voice_id: int = Field(..., description="음성 파일 ID")
    voice_title: str = Field(..., description="음성 파일 제목")
    voice_path: str = Field(..., description="음성 파일 경로")
    voice_date: str = Field(..., description="음성 파일 생성/수정일")
    type: Optional[str] = Field(None, description="파일 확장자명")
    folder_id: Optional[int] = Field(None, description="음성 파일이 속한 폴더 ID")

# API 엔드포인트 정의
@router.post("/", response_model=VoiceResponse, status_code=status.HTTP_201_CREATED,
    summary="음성 파일 생성",
    description="새로운 음성 파일을 생성합니다. 제목, 경로, 폴더 ID(선택)를 지정할 수 있습니다.")
async def create_voice(voice_data: VoiceCreate):
    """
    새 음성 파일을 생성합니다:
    
    - **voice_title**: 음성 파일 제목
    - **voice_path**: 음성 파일 경로
    - **folder_id**: (선택) 음성 파일을 생성할 폴더 ID
    - **type**: (선택) 파일 확장자명
    """
    try:
        if voice_data.folder_id is not None:
            folder = sqlite_handler.get_folder(voice_data.folder_id)
            if not folder:
                raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")

        voice = sqlite_handler.create_voice(
            voice_data.voice_title,
            voice_data.voice_path,
            voice_data.folder_id,
            voice_data.type
        )
        return voice
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("음성 파일 생성 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.get("/{voice_id}", response_model=VoiceResponse,
    summary="음성 파일 조회",
    description="지정된 ID의 음성 파일 정보를 조회합니다.")
async def get_voice(voice_id: int):
    """
    지정된 음성 파일 정보를 반환합니다:
    
    - **voice_id**: 조회할 음성 파일의 ID
    """
    voice = sqlite_handler.get_voice(voice_id)
    if not voice:
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")
    return voice

@router.put("/{voice_id}", response_model=VoiceResponse,
    summary="음성 파일 수정",
    description="지정된 ID의 음성 파일 정보를 수정합니다. 제목, 경로, 타입을 변경할 수 있습니다.")
async def update_voice(voice_id: int, voice_data: VoiceUpdate):
    """
    음성 파일 정보를 업데이트합니다:
    
    - **voice_id**: 수정할 음성 파일의 ID
    - **voice_title**: (선택) 새 음성 파일 제목
    - **voice_path**: (선택) 새 음성 파일 경로
    - **type**: (선택) 파일 확장자명
    """
    voice = sqlite_handler.get_voice(voice_id)
    if not voice:
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")
    
    try:
        updated = sqlite_handler.update_voice(
            voice_id,
            voice_data.voice_title,
            voice_data.voice_path,
            None,  # folder_id는 변경하지 않음
            voice_data.type
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="업데이트할 정보가 없습니다")
            
        updated_voice = sqlite_handler.get_voice(voice_id)
        return updated_voice
    except Exception as e:
        logging.error("음성 파일 업데이트 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.delete("/{voice_id}", status_code=status.HTTP_204_NO_CONTENT,
    summary="음성 파일 삭제",
    description="지정된 ID의 음성 파일을 삭제합니다.")
async def delete_voice(voice_id: int):
    """
    음성 파일을 삭제합니다:
    
    - **voice_id**: 삭제할 음성 파일의 ID
    """
    deleted = sqlite_handler.delete_voice(voice_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")

@router.put("/changeFolder/{target_folder_id}/{voice_id}", response_model=VoiceResponse,
    summary="음성 파일 폴더 이동",
    description="음성 파일을 다른 폴더로 이동합니다.")
async def change_voice_folder(target_folder_id: int, voice_id: int):
    """
    음성 파일을 다른 폴더로 이동합니다:
    
    - **target_folder_id**: 이동할 대상 폴더의 ID
    - **voice_id**: 이동할 음성 파일의 ID
    """
    voice = sqlite_handler.get_voice(voice_id)
    if not voice:
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")
    
    if target_folder_id is not None:
        folder = sqlite_handler.get_folder(target_folder_id)
        if not folder:
            raise HTTPException(status_code=404, detail="대상 폴더를 찾을 수 없습니다")
    
    try:
        updated = sqlite_handler.update_voice(
            voice_id,
            voice_title=None,
            voice_path=None,
            folder_id=target_folder_id,
            type=None
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="폴더 변경 실패")
            
        updated_voice = sqlite_handler.get_voice(voice_id)
        return updated_voice
    except Exception as e:
        logging.error("음성 파일 폴더 변경 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.put("/MoveOutFolder/{voice_id}", response_model=VoiceResponse,
    summary="음성 파일 폴더 제거",
    description="음성 파일을 현재 폴더에서 제거합니다.")
async def move_voice_out_of_folder(voice_id: int):
    """
    음성 파일을 폴더에서 제거합니다:
    
    - **voice_id**: 폴더에서 제거할 음성 파일의 ID
    """
    voice = sqlite_handler.get_voice(voice_id)
    if not voice:
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")
    
    try:
        updated = sqlite_handler.update_voice(
            voice_id,
            voice_title=None,
            voice_path=None,
            folder_id=None,
            type=None
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="음성 파일 폴더 제거 실패")
            
        updated_voice = sqlite_handler.get_voice(voice_id)
        return updated_voice
    except Exception as e:
        logging.error("음성 파일 폴더 제거 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류") 
    

@router.get("/folder/{folder_id}", response_model=List[VoiceResponse],
    summary="폴더의 음성 파일 목록 조회",
    description="지정된 폴더 ID에 속한 모든 음성 파일 정보를 조회합니다.")
async def get_voices_by_folder(folder_id: int):
    """
    특정 폴더에 속한 음성 파일 목록을 반환합니다:

    - **folder_id**: 음성 파일을 조회할 폴더 ID
    """
    folder = sqlite_handler.get_folder(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")

    try:
        voices = sqlite_handler.get_folder_voices(folder_id)
        return voices
    except Exception as e:
        logging.error("폴더 음성 파일 조회 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")
