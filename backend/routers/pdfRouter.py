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

