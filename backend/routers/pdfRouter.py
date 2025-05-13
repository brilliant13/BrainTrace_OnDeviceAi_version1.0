from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlite_db.sqlite_handler import SQLiteHandler
import logging

sqlite_handler = SQLiteHandler()
router = APIRouter(
    prefix="/pdfs",
    tags=["pdfs"],
    responses={404: {"description": "Not found"}}
)

# ───────── Pydantic 모델 ─────────
class PdfCreate(BaseModel):
    pdf_title: str = Field(..., description="PDF 제목", min_length=1, max_length=100)
    pdf_path:  str = Field(..., description="PDF 파일 경로")
    folder_id: Optional[int] = Field(None, description="PDF가 속한 폴더 ID")
    type:      Optional[str] = Field(None, description="파일 확장자명")
    brain_id:  Optional[int] = Field(None, description="연결할 Brain ID")

class PdfUpdate(BaseModel):
    pdf_title: Optional[str] = Field(None, description="새 PDF 제목", min_length=1, max_length=100)
    pdf_path:  Optional[str] = Field(None, description="새 PDF 파일 경로")
    type:      Optional[str] = Field(None, description="파일 확장자명")
    brain_id:  Optional[int] = Field(None, description="새로운 Brain ID")

class PdfResponse(BaseModel):
    pdf_id:    int
    pdf_title: str
    pdf_path:  str
    pdf_date:  str
    type:      Optional[str]
    folder_id: Optional[int]
    brain_id:  Optional[int]

# ───────── CREATE ─────────
@router.post("/", response_model=PdfResponse, status_code=status.HTTP_201_CREATED,
             summary="PDF 파일 생성",
             description="새로운 PDF 파일을 생성합니다. 폴더 ID, Brain ID 선택 가능.")
async def create_pdf(pdf_data: PdfCreate):
    # folder 검사
    if pdf_data.folder_id is not None:
        if not sqlite_handler.get_folder(pdf_data.folder_id):
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
    # brain 검사
    if pdf_data.brain_id is not None:
        if not sqlite_handler.get_brain(pdf_data.brain_id):
            raise HTTPException(status_code=404, detail="Brain 엔티티를 찾을 수 없습니다")

    try:
        pdf = sqlite_handler.create_pdf(
            pdf_title=pdf_data.pdf_title,
            pdf_path=pdf_data.pdf_path,
            folder_id=pdf_data.folder_id,
            type=pdf_data.type,
            brain_id=pdf_data.brain_id
        )
        return pdf
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("PDF 생성 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")

# ───────── DEFAULT ─────────
@router.get("/default", response_model=List[PdfResponse],
            summary="폴더 없이 저장된 PDF 조회")
async def get_default_pdfs():
    return sqlite_handler.get_default_pdfs()

# ───────── GET BY ID ─────────
@router.get("/{pdf_id}", response_model=PdfResponse,
            summary="PDF 파일 조회")
async def get_pdf(pdf_id: int):
    pdf = sqlite_handler.get_pdf(pdf_id)
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")
    return pdf

# ───────── UPDATE ─────────
@router.put("/{pdf_id}", response_model=PdfResponse,
            summary="PDF 파일 수정")
async def update_pdf(pdf_id: int, pdf_data: PdfUpdate):
    pdf = sqlite_handler.get_pdf(pdf_id)
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")
    # brain 검사
    if pdf_data.brain_id is not None:
        if not sqlite_handler.get_brain(pdf_data.brain_id):
            raise HTTPException(status_code=404, detail="Brain 엔티티를 찾을 수 없습니다")

    try:
        updated = sqlite_handler.update_pdf(
            pdf_id=pdf_id,
            pdf_title=pdf_data.pdf_title,
            pdf_path=pdf_data.pdf_path,
            folder_id=None,
            type=pdf_data.type,
            brain_id=pdf_data.brain_id
        )
        if not updated:
            raise HTTPException(status_code=400, detail="업데이트할 정보가 없습니다")
        return sqlite_handler.get_pdf(pdf_id)
    except Exception as e:
        logging.error("PDF 업데이트 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")

# ───────── DELETE ─────────
@router.delete("/{pdf_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="PDF 파일 삭제")
async def delete_pdf(pdf_id: int):
    if not sqlite_handler.delete_pdf(pdf_id):
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")

# ───────── MOVE FOLDER ─────────
@router.put("/brain/{brain_id}/changeFolder/{target_folder_id}/{pdf_id}", response_model=PdfResponse,
            summary="PDF 파일 폴더 이동")
async def change_pdf_folder(brain_id: int,target_folder_id: int, pdf_id: int):
    if not sqlite_handler.get_pdf(pdf_id):
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")
    if not sqlite_handler.get_folder(target_folder_id):
        raise HTTPException(status_code=404, detail="대상 폴더를 찾을 수 없습니다")

    try:
        sqlite_handler.update_pdf(pdf_id, None, None, target_folder_id, None, brain_id=brain_id )
        return sqlite_handler.get_pdf(pdf_id)
    except Exception as e:
        logging.error("PDF 폴더 변경 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")

# ───────── REMOVE FROM FOLDER ─────────
@router.put("/brain/{brain_id}/MoveOutFolder/{pdf_id}", response_model=PdfResponse,
            summary="PDF 파일 폴더 제거")
async def move_pdf_out_of_folder(brain_id: int,pdf_id: int):
    if not sqlite_handler.get_pdf(pdf_id):
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")
    try:
        sqlite_handler.update_pdf(pdf_id, None, None, None, None,brain_id=brain_id)
        return sqlite_handler.get_pdf(pdf_id)
    except Exception as e:
        logging.error("PDF 폴더 제거 오류: %s", e)
        raise HTTPException(status_code=500, detail="내부 서버 오류")

# ───────── GET BY FOLDER ─────────
@router.get("/folder/{folder_id}", response_model=List[PdfResponse],
            summary="폴더에 속한 PDF 목록 조회")
async def get_pdfs_by_folder(folder_id: int):
    try:
        return sqlite_handler.get_pdfs_by_folder(folder_id)
    except Exception as e:
        logging.error("PDF 목록 조회 실패: %s", e)
        raise HTTPException(status_code=500, detail="PDF 목록 조회 중 오류 발생")

# ───────── GET BY BRAIN ─────────
@router.get("/brain/{brain_id}", response_model=List[PdfResponse],
            summary="Brain 기준 PDF 목록 조회")
async def get_pdfs_by_brain(brain_id: int):
    try:
        return sqlite_handler.get_pdfs_by_brain(brain_id)
    except Exception as e:
        logging.error("PDF Brain 조회 오류: %s", e)
        raise HTTPException(status_code=500, detail="서버 오류")


# … 기존 import 구문 위에 다음 두 줄만 추가
import os
import uuid
from fastapi import File, UploadFile, Form

# ───────── 기존 router 정의와 CRUD 엔드포인트 그대로 ─────────
router = APIRouter(
    prefix="/pdfs",
    tags=["pdfs"],
    responses={404: {"description": "Not found"}}
)

# ───────── NEW: 파일 업로드 + PDF 생성 엔드포인트 ─────────
@router.post(
    "/upload",
    response_model=List[PdfResponse],
    summary="파일 업로드 → PDF 생성 및 URL 저장",
)
async def upload_and_create_pdfs(
    files: List[UploadFile] = File(...),
    folder_id: Optional[int] = Form(None),
    brain_id:  Optional[int] = Form(None),
):
    saved_pdfs = []

    # 1) 저장할 디렉토리 생성
    upload_dir = os.path.join("uploads", "pdfs")
    os.makedirs(upload_dir, exist_ok=True)

    for f in files:
        # 2) UUID 기반 새 파일명 + 확장자
        ext = f.filename.split(".")[-1].lower()
        new_name = f"{uuid.uuid4()}.{ext}"
        dest_path = os.path.join(upload_dir, new_name)

        # 3) 디스크에 쓰기
        with open(dest_path, "wb") as out_file:
            out_file.write(await f.read())

        # 4) 공개 URL 경로 (StaticFiles 와 매핑됨)
        public_url = f"/uploads/pdfs/{new_name}"

        # 5) DB에 메타데이터 저장
        pdf = sqlite_handler.create_pdf(
            pdf_title = f.filename,
            pdf_path  = public_url,
            folder_id = folder_id,
            type      = ext,
            brain_id  = brain_id
        )
        saved_pdfs.append(pdf)

    return saved_pdfs
