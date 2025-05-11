from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional,Dict,Any
from sqlite_db.sqlite_handler import SQLiteHandler
import logging

# SQLite 핸들러 인스턴스 생성
sqlite_handler = SQLiteHandler()

# 라우터 정의
router = APIRouter(
    prefix="/folders",
    tags=["folders"],
    responses={404: {"description": "Not found"}}
)

# Pydantic 모델 정의
class FolderCreate(BaseModel):
    folder_name: str = Field(..., description="폴더 이름", min_length=1, max_length=50, example="학습 자료")
    brain_id: int = Field(..., description="폴더가 속한 브레인 ID", example=1)

class FolderUpdate(BaseModel):
    folder_name: Optional[str] = Field(None, description="새 폴더 이름", min_length=1, max_length=50, example="중요 자료")

class FolderResponse(BaseModel):
    folder_id: int = Field(..., description="폴더 ID", example=1)
    folder_name: str = Field(..., description="폴더 이름", example="학습 자료")
    brain_id: int = Field(..., description="폴더가 속한 브레인 ID", example=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "folder_id": 1,
                "folder_name": "학습 자료",
                "brain_id": 1
            }
        }

# 메모 관련 모델 정의
class MemoResponse(BaseModel):
    memo_id: int = Field(..., description="메모 ID", example=1)
    memo_title: str = Field(..., description="메모 제목", example="파이썬 문법 정리")
    memo_text: str = Field(..., description="메모 내용", example="파이썬은 들여쓰기가 중요한 언어입니다.")
    memo_date: str = Field(..., description="메모 작성/수정일", example="2023-06-15 14:30:45")
    is_source: bool = Field(..., description="소스 메모 여부", example=False)
    folder_id: Optional[int] = Field(None, description="메모가 속한 폴더 ID", example=1)

class MemoTitleResponse(BaseModel):
    memo_id: int = Field(..., description="메모 ID", example=1)
    memo_title: str = Field(..., description="메모 제목", example="파이썬 문법 정리")
    memo_date: str = Field(..., description="메모 작성/수정일", example="2023-06-15 14:30:45")
    is_source: bool = Field(..., description="소스 메모 여부", example=False)

class MemoCreate(BaseModel):
    memo_title: str = Field(..., description="메모 제목", min_length=1, max_length=100, example="파이썬 문법 정리")
    memo_text: str = Field(..., description="메모 내용", example="파이썬은 들여쓰기가 중요한 언어입니다.")
    is_source: Optional[bool] = Field(False, description="소스 메모 여부", example=False)

class MemoIdRequest(BaseModel):
    memo_id: int = Field(..., description="추가할 메모의 ID", example=1)

class DeleteFolderResponse(BaseModel):
    folder_id: int = Field(..., description="삭제된 폴더의 ID", example=1)
    deleted_memos_count: int = Field(..., description="삭제된 메모의 수", example=5)
    success: bool = Field(..., description="삭제 성공 여부", example=True)

# (기존 FolderResponse 모델 대신)
class FolderWithChildren(BaseModel):
    folder_id: int
    folder_name: str
    brain_id: int
    memos: List[Dict[str, Any]]      # sqlite_handler.get_folder_memos 형태
    pdfs: List[Dict[str, Any]]       # sqlite_handler.get_folder_pdfs 형태
    textfiles: List[Dict[str, Any]]  # sqlite_handler.get_folder_textfiles 형태
    voices: List[Dict[str, Any]]     # sqlite_handler.get_folder_voices 형태



# API 엔드포인트 정의
@router.post("/create_folder", response_model=FolderResponse, status_code=status.HTTP_201_CREATED,
            summary="폴더 생성",
            description="새로운 폴더를 생성합니다. 각 폴더는 특정 브레인에 속합니다.")
async def create_folder(folder_data: FolderCreate):
    """
    새 폴더를 생성합니다:
    
    - **folder_name**: 폴더 이름
    - **brain_id**: 폴더가 속한 브레인 ID
    """
    try:
        folder = sqlite_handler.create_folder(
            folder_data.folder_name, 
            folder_data.brain_id
        )
        return folder
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("폴더 생성 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.get("/brain/{brain_id}", response_model=List[FolderResponse],
           summary="브레인의 폴더 목록 조회",
           description="특정 브레인에 속한 모든 폴더 목록을 반환합니다.")
async def get_brain_folders(brain_id: int):
    # 폴더 리스트
    folders = sqlite_handler.get_brain_folders(brain_id)
    result = []
    for f in folders:
        result.append({
            **f,
            "memos": sqlite_handler.get_folder_memos(f["folder_id"]),
            "pdfs": sqlite_handler.get_folder_pdfs(f["folder_id"]),
            "textfiles": sqlite_handler.get_folder_textfiles(f["folder_id"]),
            "voices": sqlite_handler.get_folder_voices(f["folder_id"])
        })
    return result

@router.get("/{folder_id}", response_model=FolderResponse,
           summary="특정 폴더 조회",
           description="지정된 ID의 폴더 정보를 반환합니다.")
async def get_folder(folder_id: int):
    """
    지정된 폴더 정보를 반환합니다:
    
    - **folder_id**: 조회할 폴더의 ID
    """
    folder = sqlite_handler.get_folder(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
    return folder

@router.put("/{folder_id}", response_model=FolderResponse,
           summary="폴더 정보 수정",
           description="폴더의 이름을 업데이트합니다.")
async def update_folder(folder_id: int, folder_data: FolderUpdate):
    """
    폴더 정보를 업데이트합니다:
    
    - **folder_id**: 수정할 폴더의 ID
    - **folder_name**: (선택) 새 폴더 이름
    """
    # 폴더 존재 여부 확인
    folder = sqlite_handler.get_folder(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
    
    # 업데이트 수행
    try:
        updated = sqlite_handler.update_folder(
            folder_id, 
            folder_data.folder_name
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="업데이트할 정보가 없습니다")
            
        # 업데이트된 정보 반영
        updated_folder = sqlite_handler.get_folder(folder_id)
        return updated_folder
    except Exception as e:
        logging.error("폴더 업데이트 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT,
              summary="폴더 삭제",
              description="특정 폴더를 시스템에서 삭제합니다.")
async def delete_folder(folder_id: int):
    """
    폴더를 삭제합니다:
    
    - **folder_id**: 삭제할 폴더의 ID
    """
    deleted = sqlite_handler.delete_folder(folder_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")

@router.get("/getMemos/{folder_id}", response_model=List[MemoResponse],
           summary="폴더의 모든 메모 조회",
           description="특정 폴더에 속한 모든 메모 목록을 반환합니다.")
async def get_folder_memos(folder_id: int):
    """
    특정 폴더의 모든 메모를 반환합니다:
    
    - **folder_id**: 메모 목록을 조회할 폴더 ID
    """
    # 폴더 존재 여부 확인
    folder = sqlite_handler.get_folder(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
        
    memos = sqlite_handler.get_folder_memos(folder_id)
    return memos

@router.get("/getMemo-titles/{folder_id}", response_model=List[MemoTitleResponse],
           summary="폴더의 모든 메모 제목 조회",
           description="특정 폴더에 속한 모든 메모의 제목 목록만 반환합니다.")
async def get_folder_memo_titles(folder_id: int):
    """
    특정 폴더의 모든 메모 제목을 반환합니다:
    
    - **folder_id**: 메모 제목 목록을 조회할 폴더 ID
    """
    # 폴더 존재 여부 확인
    folder = sqlite_handler.get_folder(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
        
    memo_titles = sqlite_handler.get_folder_memo_titles(folder_id)
    return memo_titles

@router.post("/{folder_id}/{memo_id}/addMemo", response_model=MemoResponse,
           summary="폴더에 기존 메모 추가",
           description="특정 폴더에 기존 메모를 추가합니다.")
async def add_memo_to_folder(folder_id: int, memo_id: int):
    """
    기존 메모를 폴더에 추가합니다:
    
    - **folder_id**: 메모를 추가할 폴더의 ID
    - **memo_id**: 추가할 메모의 ID
    """
    # 폴더 존재 여부 확인
    folder = sqlite_handler.get_folder(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
    
    # 메모 존재 여부 확인
    memo = sqlite_handler.get_memo(memo_id)
    if not memo:
        raise HTTPException(status_code=404, detail="메모를 찾을 수 없습니다")
        
    try:
        # 메모의 folder_id만 업데이트
        updated = sqlite_handler.update_memo(
            memo_id,
            memo_title=None,
            memo_text=None,
            is_source=None,
            folder_id=folder_id
        )
        
        if not updated:
            raise HTTPException(status_code=400, detail="메모 폴더 업데이트 실패")
            
        updated_memo = sqlite_handler.get_memo(memo_id)
        return updated_memo
    except Exception as e:
        logging.error("메모 폴더 업데이트 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.delete("/deleteAll/{folder_id}", response_model=DeleteFolderResponse,
              summary="폴더와 메모 전체 삭제",
              description="특정 폴더와 그 안의 모든 메모를 삭제합니다.")
async def delete_folder_with_memos(folder_id: int):
    """
    폴더와 그 안의 모든 메모를 삭제합니다:
    
    - **folder_id**: 삭제할 폴더의 ID
    
    반환값:
    - **folder_id**: 삭제된 폴더의 ID
    - **deleted_memos_count**: 삭제된 메모의 수
    - **success**: 삭제 성공 여부
    """
    try:
        result = sqlite_handler.delete_folder_with_memos(folder_id)
        if not result["success"]:
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logging.error("폴더와 메모 삭제 오류: %s", str(e))
        raise HTTPException(status_code=500, detail="내부 서버 오류")

@router.get("/default/getMemos", response_model=List[MemoResponse],
           summary="폴더가 없는 메모 목록 조회",
           description="폴더에 속하지 않은 모든 메모 목록을 반환합니다.")
async def get_default_memos():
    """
    폴더에 속하지 않은 모든 메모를 반환합니다.
    """
    memos = sqlite_handler.get_default_memos()
    return memos

@router.get("/default/getMemoTitles", response_model=List[MemoTitleResponse],
           summary="폴더가 없는 메모 제목 목록 조회",
           description="폴더에 속하지 않은 모든 메모의 제목 목록만 반환합니다.")
async def get_default_memo_titles():
    """
    폴더에 속하지 않은 모든 메모의 제목을 반환합니다.
    """
    memo_titles = sqlite_handler.get_default_memo_titles()
    return memo_titles 