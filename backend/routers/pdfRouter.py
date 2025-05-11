from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlite_db.sqlite_handler import SQLiteHandler
import logging

# SQLite 핸들러 인스턴스 생성
sqlite_handler = SQLiteHandler()

# 라우터 정의
router = APIRouter(
    prefix="/pdfs",
    tags=["pdfs"],
    responses={404: {"description": "Not found"}}
)

# Pydantic 모델 정의
class PdfCreate(BaseModel):
    pdf_title: str = Field(..., description="PDF 제목", min_length=1, max_length=100)
    pdf_path: str = Field(..., description="PDF 파일 경로")
    folder_id: Optional[int] = Field(None, description="PDF가 속한 폴더 ID")
    type: Optional[str] = Field(None, description="파일 확장자명")

class PdfUpdate(BaseModel):
    pdf_title: Optional[str] = Field(None, description="새 PDF 제목", min_length=1, max_length=100)
    pdf_path: Optional[str] = Field(None, description="새 PDF 파일 경로")
    type: Optional[str] = Field(None, description="파일 확장자명")

class PdfResponse(BaseModel):
    pdf_id: int = Field(..., description="PDF ID")
    pdf_title: str = Field(..., description="PDF 제목")
    pdf_path: str = Field(..., description="PDF 파일 경로")
    pdf_date: str = Field(..., description="PDF 생성/수정일")
    type: Optional[str] = Field(None, description="파일 확장자명")
    folder_id: Optional[int] = Field(None, description="PDF가 속한 폴더 ID")

# API 엔드포인트 정의
@router.post("/", response_model=PdfResponse, status_code=status.HTTP_201_CREATED, 
    summary="PDF 파일 생성",
    description="새로운 PDF 파일을 생성합니다. 제목, 경로, 폴더 ID(선택)를 지정할 수 있습니다.")
async def create_pdf(pdf_data: PdfCreate):
    """
    새 PDF를 생성합니다:
    
    - **pdf_title**: PDF 제목
    - **pdf_path**: PDF 파일 경로
    - **folder_id**: (선택) PDF를 생성할 폴더 ID
    - **type**: (선택) 파일 확장자명
    """
    try:
        if pdf_data.folder_id is not None:
            folder = sqlite_handler.get_folder(pdf_data.folder_id)
            if not folder:
                raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")

        pdf = sqlite_handler.create_pdf(
            pdf_data.pdf_title,
            pdf_data.pdf_path,
            pdf_data.folder_id,
            pdf_data.type
        )
        return pdf
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("PDF 생성 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")
    
@router.get(
    "/default",
    response_model=List[PdfResponse],
    summary="폴더 없이 저장된 PDF 목록 조회",
    description="folder_id 가 null 인 PDF 들을 반환합니다."
)
async def get_default_pdfs():
    return sqlite_handler.get_default_pdfs()



@router.get("/{pdf_id}", response_model=PdfResponse,
    summary="PDF 파일 조회",
    description="지정된 ID의 PDF 파일 정보를 조회합니다.")
async def get_pdf(pdf_id: int):
    """
    지정된 PDF 정보를 반환합니다:
    
    - **pdf_id**: 조회할 PDF의 ID
    """
    pdf = sqlite_handler.get_pdf(pdf_id)
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")
    return pdf

@router.put("/{pdf_id}", response_model=PdfResponse,
    summary="PDF 파일 수정",
    description="지정된 ID의 PDF 파일 정보를 수정합니다. 제목, 경로, 타입을 변경할 수 있습니다.")
async def update_pdf(pdf_id: int, pdf_data: PdfUpdate):
    """
    PDF 정보를 업데이트합니다:
    
    - **pdf_id**: 수정할 PDF의 ID
    - **pdf_title**: (선택) 새 PDF 제목
    - **pdf_path**: (선택) 새 PDF 파일 경로
    - **type**: (선택) 파일 확장자명
    """
    pdf = sqlite_handler.get_pdf(pdf_id)
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")
    
    try:
        updated = sqlite_handler.update_pdf(
            pdf_id,
            pdf_data.pdf_title,
            pdf_data.pdf_path,
            None,  # folder_id는 변경하지 않음
            pdf_data.type
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="업데이트할 정보가 없습니다")
            
        updated_pdf = sqlite_handler.get_pdf(pdf_id)
        return updated_pdf
    except Exception as e:
        logging.error("PDF 업데이트 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.delete("/{pdf_id}", status_code=status.HTTP_204_NO_CONTENT,
    summary="PDF 파일 삭제",
    description="지정된 ID의 PDF 파일을 삭제합니다.")
async def delete_pdf(pdf_id: int):
    """
    PDF를 삭제합니다:
    
    - **pdf_id**: 삭제할 PDF의 ID
    """
    deleted = sqlite_handler.delete_pdf(pdf_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")

@router.put("/changeFolder/{target_folder_id}/{pdf_id}", response_model=PdfResponse,
    summary="PDF 파일 폴더 이동",
    description="PDF 파일을 다른 폴더로 이동합니다.")
async def change_pdf_folder(target_folder_id: int, pdf_id: int):
    """
    PDF를 다른 폴더로 이동합니다:
    
    - **target_folder_id**: 이동할 대상 폴더의 ID
    - **pdf_id**: 이동할 PDF의 ID
    """
    pdf = sqlite_handler.get_pdf(pdf_id)
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")
    
    if target_folder_id is not None:
        folder = sqlite_handler.get_folder(target_folder_id)
        if not folder:
            raise HTTPException(status_code=404, detail="대상 폴더를 찾을 수 없습니다")
    
    try:
        updated = sqlite_handler.update_pdf(
            pdf_id,
            pdf_title=None,
            pdf_path=None,
            folder_id=target_folder_id,
            type=None
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="폴더 변경 실패")
            
        updated_pdf = sqlite_handler.get_pdf(pdf_id)
        return updated_pdf
    except Exception as e:
        logging.error("PDF 폴더 변경 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.put("/MoveOutFolder/{pdf_id}", response_model=PdfResponse,
    summary="PDF 파일 폴더 제거",
    description="PDF 파일을 현재 폴더에서 제거합니다.")
async def move_pdf_out_of_folder(pdf_id: int):
    """
    PDF를 폴더에서 제거합니다:
    
    - **pdf_id**: 폴더에서 제거할 PDF의 ID
    """
    pdf = sqlite_handler.get_pdf(pdf_id)
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF를 찾을 수 없습니다")
    
    try:
        updated = sqlite_handler.update_pdf(
            pdf_id,
            pdf_title=None,
            pdf_path=None,
            folder_id=None,
            type=None
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="PDF 폴더 제거 실패")
            
        updated_pdf = sqlite_handler.get_pdf(pdf_id)
        return updated_pdf
    except Exception as e:
        logging.error("PDF 폴더 제거 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류") 
    
@router.get("/folder/{folder_id}", response_model=List[PdfResponse],
        summary="폴더에 속한 PDF 목록 조회",
        description="특정 폴더에 속한 모든 PDF 목록을 반환합니다.")
async def get_pdfs_by_folder(folder_id: int):
    """
    폴더 ID에 속한 PDF 목록을 반환합니다:

    - **folder_id**: 조회할 폴더 ID
    """
    try:
        pdfs = sqlite_handler.get_pdfs_by_folder(folder_id)
        return pdfs
    except Exception as e:
        logging.error("PDF 목록 조회 실패: %s", str(e))
        raise HTTPException(status_code=500, detail="PDF 목록 조회 중 오류 발생")
