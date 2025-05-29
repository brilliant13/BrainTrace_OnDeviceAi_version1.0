from fastapi import APIRouter, HTTPException, status, Query, File, UploadFile
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlite_db.sqlite_handler import SQLiteHandler
from services.voiceService import transcribe
import logging
import os
import tempfile
from pathlib import Path


sqlite_handler = SQLiteHandler()
router = APIRouter(
    prefix="/voices",
    tags=["voices"],
    responses={404: {"description": "Not found"}}
)

# ───────── Pydantic 모델 ─────────
class VoiceCreate(BaseModel):
    voice_title: str = Field(..., description="음성 파일 제목", min_length=1, max_length=100)
    voice_path:  str = Field(..., description="음성 파일 경로")
    folder_id:   Optional[int] = Field(None, description="음성 파일이 속한 폴더 ID")
    type:        Optional[str] = Field(None, description="파일 확장자명")
    brain_id:    Optional[int] = Field(None, description="연결할 Brain ID")

class VoiceUpdate(BaseModel):
    voice_title: Optional[str] = Field(None, description="새 음성 파일 제목", min_length=1, max_length=100)
    voice_path:  Optional[str] = Field(None, description="새 음성 파일 경로")
    type:        Optional[str] = Field(None, description="파일 확장자명")
    brain_id:    Optional[int] = Field(None, description="새로운 Brain ID")

class VoiceResponse(BaseModel):
    voice_id:    int
    voice_title: str
    voice_path:  str
    voice_date:  str
    type:        Optional[str]
    folder_id:   Optional[int]
    brain_id:    Optional[int]


# ───────── CREATE ─────────
@router.post("/", response_model=VoiceResponse, status_code=status.HTTP_201_CREATED,
    summary="음성 파일 생성",
    description="새로운 음성 파일을 생성합니다. 폴더 ID, Brain ID 선택 가능.")
async def create_voice(voice_data: VoiceCreate):
    # 폴더 유효성 검사
    if voice_data.folder_id is not None:
        if not sqlite_handler.get_folder(voice_data.folder_id):
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
    # Brain 유효성 검사
    if voice_data.brain_id is not None:
        if not sqlite_handler.get_brain(voice_data.brain_id):
            raise HTTPException(status_code=404, detail="Brain 엔티티를 찾을 수 없습니다")

    try:
        voice = sqlite_handler.create_voice(
            voice_title=voice_data.voice_title,
            voice_path=voice_data.voice_path,
            folder_id=voice_data.folder_id,
            type=voice_data.type,
            brain_id=voice_data.brain_id
        )
        return voice
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("음성 파일 생성 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")


# ───────── DEFAULT ─────────
@router.get("/default", response_model=List[VoiceResponse],
    summary="폴더 없이 저장된 음성 파일 조회")
async def get_default_voices():
    try:
        return sqlite_handler.get_default_voices()
    except Exception as e:
        logging.error("기본 음성 파일 조회 오류: %s", e)
        raise HTTPException(status_code=500, detail="기본 음성 파일 조회 중 오류 발생")


# ───────── GET BY ID ─────────
@router.get("/{voice_id}", response_model=VoiceResponse,
    summary="음성 파일 조회")
async def get_voice(voice_id: int):
    voice = sqlite_handler.get_voice(voice_id)
    if not voice:
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")
    return voice


# ───────── UPDATE ─────────
@router.put("/{voice_id}", response_model=VoiceResponse,
    summary="음성 파일 수정")
async def update_voice(voice_id: int, voice_data: VoiceUpdate):
    voice = sqlite_handler.get_voice(voice_id)
    if not voice:
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")
    # Brain 유효성 검사
    if voice_data.brain_id is not None:
        if not sqlite_handler.get_brain(voice_data.brain_id):
            raise HTTPException(status_code=404, detail="Brain 엔티티를 찾을 수 없습니다")

    try:
        updated = sqlite_handler.update_voice(
            voice_id=voice_id,
            voice_title=voice_data.voice_title,
            voice_path=voice_data.voice_path,
            folder_id=voice.get("folder_id"),  # ✅ 기존 folder_id 유지
            type=voice_data.type,
            brain_id=voice_data.brain_id
        )
        if not updated:
            raise HTTPException(status_code=400, detail="업데이트할 정보가 없습니다")
        return sqlite_handler.get_voice(voice_id)
    except Exception as e:
        logging.error("음성 파일 업데이트 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")


# ───────── DELETE ─────────
@router.delete("/{voice_id}", status_code=status.HTTP_204_NO_CONTENT,
    summary="음성 파일 삭제")
async def delete_voice(voice_id: int):
    if not sqlite_handler.delete_voice(voice_id):
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")

# ───────── MOVE FOLDER ─────────
@router.put(
    "/brain/{brain_id}/changeFolder/{target_folder_id}/{voice_id}",
    response_model=VoiceResponse,
    summary="음성 파일 폴더 이동 (brainId 경로 포함)"
)
async def change_voice_folder(
    brain_id: int,
    target_folder_id: int,
    voice_id: int
):
    # 1) 음성 파일 존재 확인
    if not sqlite_handler.get_voice(voice_id):
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")
    # 2) 대상 폴더 존재 확인
    if not sqlite_handler.get_folder(target_folder_id):
        raise HTTPException(status_code=404, detail="대상 폴더를 찾을 수 없습니다")

    try:
        updated = sqlite_handler.update_voice(
            voice_id=voice_id,
            voice_title=None,
            voice_path=None,
            folder_id=target_folder_id,
            type=None,
            brain_id=brain_id    # ← brain_id 경로 파라미터로 덮어쓰기
        )
        if not updated:
            raise HTTPException(status_code=400, detail="폴더 변경 실패")
        return sqlite_handler.get_voice(voice_id)

    except Exception as e:
        logging.error("음성 파일 폴더 변경 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")


# ───────── REMOVE FROM FOLDER ─────────
@router.put(
    "/brain/{brain_id}/MoveOutFolder/{voice_id}",
    response_model=VoiceResponse,
    summary="음성 파일 폴더 제거 (brainId 경로 포함)"
)
async def move_voice_out_of_folder(
    brain_id: int,
    voice_id: int
):
    # 1) 음성 파일 존재 확인
    if not sqlite_handler.get_voice(voice_id):
        raise HTTPException(status_code=404, detail="음성 파일을 찾을 수 없습니다")

    try:
        updated = sqlite_handler.update_voice(
            voice_id=voice_id,
            voice_title=None,
            voice_path=None,
            folder_id=None,
            type=None,
            brain_id=brain_id    # ← brain_id 경로 파라미터로 덮어쓰기
        )
        if not updated:
            raise HTTPException(status_code=400, detail="폴더 제거 실패")
        return sqlite_handler.get_voice(voice_id)

    except Exception as e:
        logging.error("음성 파일 폴더 제거 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")

# ───────── GET BY FOLDER ─────────
@router.get("/folder/{folder_id}", response_model=List[VoiceResponse],
    summary="폴더의 음성 파일 목록 조회")
async def get_voices_by_folder(folder_id: int):
    if not sqlite_handler.get_folder(folder_id):
        raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
    try:
        return sqlite_handler.get_folder_voices(folder_id)
    except Exception as e:
        logging.error("폴더 음성 파일 조회 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")


# ───────── GET BY BRAIN ─────────
@router.get(
    "/brain/{brain_id}",
    response_model=List[VoiceResponse],
    summary="Brain 기준 음성 파일 목록 조회 (루트 vs 모든 폴더)"
)
async def get_voices_by_brain(
    brain_id: int,
    folder_id: Optional[int] = Query(
        None,
        description="없으면 루트 only, 있으면 모든 폴더 내 음성 파일"
    )
):
    try:
        return sqlite_handler.get_voices_by_brain_and_folder(brain_id, folder_id)
    except Exception as e:
        logging.error("음성 파일 조회 오류: %s", e)
        raise HTTPException(status_code=500, detail="서버 오류")

@router.post("/transcribe",
    summary="음성 파일 텍스트 변환",
    description="오디오 파일을 텍스트로 변환합니다.",
    response_model=dict)
async def transcribe_audio(file: UploadFile = File(...)):
    """
    다양한 오디오 파일(webm, mp3, wav 등)을 텍스트로 변환합니다.
    """
    try:
        ext = Path(file.filename).suffix or ".mp3"
        logging.info(f"[변환 요청] 파일명: {file.filename}, 확장자: {ext}")

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
            logging.info(f"[파일 저장] 임시 경로: {temp_file_path}")

        text = transcribe(temp_file_path)
        logging.info(f"[변환 완료] 추출 텍스트: {text[:30]}...")

        os.unlink(temp_file_path)
        return {"text": text}

    except Exception as e:
        logging.exception("음성 변환 중 예외 발생")  # ← traceback 포함 전체 로그 기록
        raise HTTPException(
            status_code=500,
            detail=f"음성 변환 중 오류가 발생했습니다: {str(e)}"
        )