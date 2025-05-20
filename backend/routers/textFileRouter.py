from fastapi import APIRouter, HTTPException, status, Query,UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlite_db.sqlite_handler import SQLiteHandler
import logging, uuid, os, re

sqlite_handler = SQLiteHandler()
router = APIRouter(
    prefix="/textfiles",
    tags=["textfiles"],
    responses={404: {"description": "Not found"}}
)

# ───────── Pydantic 모델 ─────────
class TextFileCreate(BaseModel):
    txt_title: str = Field(..., description="텍스트 파일 제목", min_length=1, max_length=100)
    txt_path:  str = Field(..., description="텍스트 파일 경로")
    folder_id: Optional[int] = Field(None, description="텍스트 파일이 속한 폴더 ID")
    type:      Optional[str] = Field(None, description="파일 확장자명")
    brain_id:  Optional[int] = Field(None, description="연결할 Brain ID")

class TextFileUpdate(BaseModel):
    txt_title: Optional[str] = Field(None, description="새 텍스트 파일 제목", min_length=1, max_length=100)
    txt_path:  Optional[str] = Field(None, description="새 텍스트 파일 경로")
    type:      Optional[str] = Field(None, description="파일 확장자명")
    brain_id:  Optional[int] = Field(None, description="새로운 Brain ID")

class TextFileResponse(BaseModel):
    txt_id:    int
    txt_title: str
    txt_path:  str
    txt_date:  str
    type:      Optional[str]
    folder_id: Optional[int]
    brain_id:  Optional[int]


# ───────── CREATE ─────────
@router.post("/", response_model=TextFileResponse, status_code=status.HTTP_201_CREATED,
    summary="텍스트 파일 생성",
    description="새로운 텍스트 파일을 생성합니다. 폴더 ID, Brain ID 선택 가능.")
async def create_textfile(textfile_data: TextFileCreate):
    # 폴더 유효성 검사
    if textfile_data.folder_id is not None:
        if not sqlite_handler.get_folder(textfile_data.folder_id):
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
    # Brain 유효성 검사
    if textfile_data.brain_id is not None:
        if not sqlite_handler.get_brain(textfile_data.brain_id):
            raise HTTPException(status_code=404, detail="Brain 엔티티를 찾을 수 없습니다")

    try:
        textfile = sqlite_handler.create_textfile(
            txt_title=textfile_data.txt_title,
            txt_path=textfile_data.txt_path,
            folder_id=textfile_data.folder_id,
            type=textfile_data.type,
            brain_id=textfile_data.brain_id
        )
        return textfile
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("텍스트 파일 생성 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")


# ───────── DEFAULT ─────────
@router.get("/default", response_model=List[TextFileResponse],
    summary="폴더 없이 저장된 텍스트 파일 조회",
    description="folder_id 가 null 인 텍스트 파일들을 반환합니다.")
async def get_default_textfiles():
    try:
        return sqlite_handler.get_default_textfiles()
    except Exception as e:
        logging.error("기본 텍스트 파일 조회 오류: %s", e)
        raise HTTPException(status_code=500, detail="기본 텍스트 파일 조회 중 오류 발생")


# ───────── GET BY ID ─────────
@router.get("/{txt_id}", response_model=TextFileResponse,
    summary="텍스트 파일 조회")
async def get_textfile(txt_id: int):
    textfile = sqlite_handler.get_textfile(txt_id)
    if not textfile:
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")
    return textfile


# ───────── UPDATE ─────────
@router.put("/{txt_id}", response_model=TextFileResponse,
    summary="텍스트 파일 수정")
async def update_textfile(txt_id: int, textfile_data: TextFileUpdate):
    textfile = sqlite_handler.get_textfile(txt_id)
    if not textfile:
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")
    # Brain 유효성 검사
    if textfile_data.brain_id is not None:
        if not sqlite_handler.get_brain(textfile_data.brain_id):
            raise HTTPException(status_code=404, detail="Brain 엔티티를 찾을 수 없습니다")

    try:
        updated = sqlite_handler.update_textfile(
            txt_id=txt_id,
            txt_title=textfile_data.txt_title,
            txt_path=textfile_data.txt_path,
            folder_id=textfile.get("folder_id"),  # ✅ 기존 folder_id 유지
            type=textfile_data.type,
            brain_id=textfile_data.brain_id
        )
        if not updated:
            raise HTTPException(status_code=400, detail="업데이트할 정보가 없습니다")
        return sqlite_handler.get_textfile(txt_id)
    except Exception as e:
        logging.error("텍스트 파일 업데이트 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")


# ───────── DELETE ─────────
@router.delete("/{txt_id}", status_code=status.HTTP_204_NO_CONTENT,
    summary="텍스트 파일 삭제")
async def delete_textfile(txt_id: int):
    if not sqlite_handler.delete_textfile(txt_id):
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")



# ───────── MOVE FOLDER ─────────
@router.put(
    "/brain/{brain_id}/changeFolder/{target_folder_id}/{txt_id}",
    response_model=TextFileResponse,
    summary="텍스트 파일 폴더 이동 (brainId 경로 포함)"
)
async def change_textfile_folder(
    brain_id: int,
    target_folder_id: int,
    txt_id: int
):
    # 1) 파일 존재 확인
    if not sqlite_handler.get_textfile(txt_id):
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")
    # 2) 대상 폴더 확인
    if not sqlite_handler.get_folder(target_folder_id):
        raise HTTPException(status_code=404, detail="대상 폴더를 찾을 수 없습니다")

    try:
        # folder_id만 바꾸고 brain_id는 그대로 덮어쓰기
        updated = sqlite_handler.update_textfile(
            txt_id=txt_id,
            txt_title=None,
            txt_path=None,
            folder_id=target_folder_id,
            type=None,
            brain_id=brain_id      # ← 여기에 brain_id 추가
        )
        if not updated:
            raise HTTPException(status_code=400, detail="폴더 변경 실패")
        return sqlite_handler.get_textfile(txt_id)
    except Exception as e:
        logging.error("텍스트 파일 폴더 변경 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")

# ───────── REMOVE FROM FOLDER ─────────
@router.put(
    "/brain/{brain_id}/MoveOutFolder/{txt_id}",
    response_model=TextFileResponse,
    summary="텍스트 파일 폴더 제거 (brainId 경로 포함)"
)
async def move_textfile_out_of_folder(
    brain_id: int,
    txt_id: int
):
    # 1) 파일 존재 확인
    if not sqlite_handler.get_textfile(txt_id):
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")

    try:
        # folder_id=null, brain_id는 경로값으로 재설정
        updated = sqlite_handler.update_textfile(
            txt_id=txt_id,
            txt_title=None,
            txt_path=None,
            folder_id=None,
            type=None,
            brain_id=brain_id      # ← 여기에 brain_id 추가
        )
        if not updated:
            raise HTTPException(status_code=400, detail="폴더 제거 실패")
        return sqlite_handler.get_textfile(txt_id)
    except Exception as e:
        logging.error("텍스트 파일 폴더 제거 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")

# ───────── GET BY FOLDER ─────────
@router.get("/folder/{folder_id}", response_model=List[TextFileResponse],
    summary="폴더의 텍스트 파일 목록 조회")
async def get_textfiles_by_folder(folder_id: int):
    # 폴더 존재 여부 검사...
    try:
        return sqlite_handler.get_folder_textfiles(folder_id)
    except Exception as e:
        logging.error("폴더 텍스트 파일 조회 오류: %s", e)
        raise HTTPException(status_code=500, detail="텍스트 파일 조회 중 오류 발생")


# ───────── GET BY BRAIN ─────────
@router.get(
    "/brain/{brain_id}",
    response_model=List[TextFileResponse],
    summary="Brain 기준 텍스트 파일 목록 조회 (루트 vs 모든 폴더)"
)
async def get_textfiles_by_brain(
    brain_id: int,
    folder_id: Optional[int] = Query(
        None,
        description="없으면 루트 only, 있으면 모든 폴더 내 텍스트 파일"
    )
):
    try:
        return sqlite_handler.get_textfiles_by_brain_and_folder(brain_id, folder_id)
    except Exception as e:
        logging.error("텍스트 파일 조회 오류: %s", e)
        raise HTTPException(status_code=500, detail="서버 오류")
    
UPLOAD_TXT_DIR = "uploaded_txts"
os.makedirs(UPLOAD_TXT_DIR, exist_ok=True)

def sanitize_filename(name):
    return re.sub(r'[^\w\-_\. ]', '_', name)

@router.post("/upload-txt", response_model=List[TextFileResponse],
             summary="텍스트 파일 업로드 및 저장",
             description=".txt 파일을 업로드하고 DB에 저장합니다.")
async def upload_textfiles(
    files: List[UploadFile] = File(...),
    folder_id: Optional[int] = Form(None),
    brain_id: Optional[int] = Form(None)
):
    uploaded_textfiles = []

    # 폴더 및 Brain 유효성 검사
    if folder_id is not None and not sqlite_handler.get_folder(folder_id):
        raise HTTPException(status_code=404, detail="해당 폴더가 존재하지 않습니다.")
    if brain_id is not None and not sqlite_handler.get_brain(brain_id):
        raise HTTPException(status_code=404, detail="해당 Brain이 존재하지 않습니다.")

    for file in files:
        try:
            ext = os.path.splitext(file.filename)[1].lower()
            if ext != ".txt":
                continue  # txt 파일만 처리

            safe_name = sanitize_filename(file.filename)
            unique_name = f"{uuid.uuid4().hex}_{safe_name}"
            file_path = os.path.join(UPLOAD_TXT_DIR, unique_name)

            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)

            created = sqlite_handler.create_textfile(
                txt_title=safe_name,
                txt_path=file_path,
                folder_id=folder_id,
                type="txt",
                brain_id=brain_id
            )
            uploaded_textfiles.append(created)

        except Exception as e:
            logging.error("TXT 업로드 실패 (%s): %s", file.filename, e)

    return uploaded_textfiles