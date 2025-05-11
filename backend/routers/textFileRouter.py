from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlite_db.sqlite_handler import SQLiteHandler
import logging

# SQLite 핸들러 인스턴스 생성
sqlite_handler = SQLiteHandler()

# 라우터 정의
router = APIRouter(
    prefix="/textfiles",
    tags=["textfiles"],
    responses={404: {"description": "Not found"}}
)

# Pydantic 모델 정의
class TextFileCreate(BaseModel):
    txt_title: str = Field(..., description="텍스트 파일 제목", min_length=1, max_length=100)
    txt_path: str = Field(..., description="텍스트 파일 경로")
    folder_id: Optional[int] = Field(None, description="텍스트 파일이 속한 폴더 ID")
    type: Optional[str] = Field(None, description="파일 확장자명")

class TextFileUpdate(BaseModel):
    txt_title: Optional[str] = Field(None, description="새 텍스트 파일 제목", min_length=1, max_length=100)
    txt_path: Optional[str] = Field(None, description="새 텍스트 파일 경로")
    type: Optional[str] = Field(None, description="파일 확장자명")

class TextFileResponse(BaseModel):
    txt_id: int = Field(..., description="텍스트 파일 ID")
    txt_title: str = Field(..., description="텍스트 파일 제목")
    txt_path: str = Field(..., description="텍스트 파일 경로")
    txt_date: str = Field(..., description="텍스트 파일 생성/수정일")
    type: Optional[str] = Field(None, description="파일 확장자명")
    folder_id: Optional[int] = Field(None, description="텍스트 파일이 속한 폴더 ID")

# API 엔드포인트 정의
@router.post("/", response_model=TextFileResponse, status_code=status.HTTP_201_CREATED,
    summary="텍스트 파일 생성",
    description="새로운 텍스트 파일을 생성합니다. 제목, 경로, 폴더 ID(선택)를 지정할 수 있습니다.")
async def create_textfile(textfile_data: TextFileCreate):
    """
    새 텍스트 파일을 생성합니다:
    
    - **txt_title**: 텍스트 파일 제목
    - **txt_path**: 텍스트 파일 경로
    - **folder_id**: (선택) 텍스트 파일을 생성할 폴더 ID
    - **type**: (선택) 파일 확장자명
    """
    try:
        if textfile_data.folder_id is not None:
            folder = sqlite_handler.get_folder(textfile_data.folder_id)
            if not folder:
                raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")

        textfile = sqlite_handler.create_textfile(
            textfile_data.txt_title,
            textfile_data.txt_path,
            textfile_data.folder_id,
            textfile_data.type
        )
        return textfile
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("텍스트 파일 생성 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.get("/{txt_id}", response_model=TextFileResponse,
    summary="텍스트 파일 조회",
    description="지정된 ID의 텍스트 파일 정보를 조회합니다.")
async def get_textfile(txt_id: int):
    """
    지정된 텍스트 파일 정보를 반환합니다:
    
    - **txt_id**: 조회할 텍스트 파일의 ID
    """
    textfile = sqlite_handler.get_textfile(txt_id)
    if not textfile:
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")
    return textfile

@router.put("/{txt_id}", response_model=TextFileResponse,
    summary="텍스트 파일 수정",
    description="지정된 ID의 텍스트 파일 정보를 수정합니다. 제목, 경로, 타입을 변경할 수 있습니다.")
async def update_textfile(txt_id: int, textfile_data: TextFileUpdate):
    """
    텍스트 파일 정보를 업데이트합니다:
    
    - **txt_id**: 수정할 텍스트 파일의 ID
    - **txt_title**: (선택) 새 텍스트 파일 제목
    - **txt_path**: (선택) 새 텍스트 파일 경로
    - **type**: (선택) 파일 확장자명
    """
    textfile = sqlite_handler.get_textfile(txt_id)
    if not textfile:
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")
    
    try:
        updated = sqlite_handler.update_textfile(
            txt_id,
            textfile_data.txt_title,
            textfile_data.txt_path,
            None,  # folder_id는 변경하지 않음
            textfile_data.type
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="업데이트할 정보가 없습니다")
            
        updated_textfile = sqlite_handler.get_textfile(txt_id)
        return updated_textfile
    except Exception as e:
        logging.error("텍스트 파일 업데이트 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.delete("/{txt_id}", status_code=status.HTTP_204_NO_CONTENT,
    summary="텍스트 파일 삭제",
    description="지정된 ID의 텍스트 파일을 삭제합니다.")
async def delete_textfile(txt_id: int):
    """
    텍스트 파일을 삭제합니다:
    
    - **txt_id**: 삭제할 텍스트 파일의 ID
    """
    deleted = sqlite_handler.delete_textfile(txt_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")

@router.put("/changeFolder/{target_folder_id}/{txt_id}", response_model=TextFileResponse,
    summary="텍스트 파일 폴더 이동",
    description="텍스트 파일을 다른 폴더로 이동합니다.")
async def change_textfile_folder(target_folder_id: int, txt_id: int):
    """
    텍스트 파일을 다른 폴더로 이동합니다:
    
    - **target_folder_id**: 이동할 대상 폴더의 ID
    - **txt_id**: 이동할 텍스트 파일의 ID
    """
    textfile = sqlite_handler.get_textfile(txt_id)
    if not textfile:
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")
    
    if target_folder_id is not None:
        folder = sqlite_handler.get_folder(target_folder_id)
        if not folder:
            raise HTTPException(status_code=404, detail="대상 폴더를 찾을 수 없습니다")
    
    try:
        updated = sqlite_handler.update_textfile(
            txt_id,
            txt_title=None,
            txt_path=None,
            folder_id=target_folder_id,
            type=None
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="폴더 변경 실패")
            
        updated_textfile = sqlite_handler.get_textfile(txt_id)
        return updated_textfile
    except Exception as e:
        logging.error("텍스트 파일 폴더 변경 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.put("/MoveOutFolder/{txt_id}", response_model=TextFileResponse,
    summary="텍스트 파일 폴더 제거",
    description="텍스트 파일을 현재 폴더에서 제거합니다.")
async def move_textfile_out_of_folder(txt_id: int):
    """
    텍스트 파일을 폴더에서 제거합니다:
    
    - **txt_id**: 폴더에서 제거할 텍스트 파일의 ID
    """
    textfile = sqlite_handler.get_textfile(txt_id)
    if not textfile:
        raise HTTPException(status_code=404, detail="텍스트 파일을 찾을 수 없습니다")
    
    try:
        updated = sqlite_handler.update_textfile(
            txt_id,
            txt_title=None,
            txt_path=None,
            folder_id=None,
            type=None
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="텍스트 파일 폴더 제거 실패")
            
        updated_textfile = sqlite_handler.get_textfile(txt_id)
        return updated_textfile
    except Exception as e:
        logging.error("텍스트 파일 폴더 제거 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류") 
    
@router.get(
    "/folder/{folder_id}",
    response_model=List[TextFileResponse],
    summary="폴더의 텍스트 파일 목록 조회",
    description="특정 폴더에 속한 텍스트 파일들을 반환합니다."
)
async def get_textfiles_by_folder(folder_id: int):
    # 폴더 존재 여부 확인 (선택)
    folder = sqlite_handler.get_folder(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")

    try:
        # sqlite_handler에 아래 메서드가 있어야 합니다.
        textfiles = sqlite_handler.get_folder_textfiles(folder_id)
        return textfiles
    except Exception as e:
        logging.error("폴더 텍스트 파일 조회 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="텍스트 파일 조회 중 오류 발생")