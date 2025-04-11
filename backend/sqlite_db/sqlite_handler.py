import sqlite3
import logging
import os
from typing import Dict, List, Optional
import hashlib

class SQLiteHandler:
    def __init__(self, db_path=None):
        if db_path is None:
            # 기본 경로 설정 (backend 폴더 아래 data/sqlite.db)
            self.db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sqlite.db")
            # 경로 생성
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        else:
            self.db_path = db_path
        
        self._init_db()
    
    def _init_db(self):
        """SQLite 데이터베이스와 테이블 초기화"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # User 테이블 생성
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS User (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_name TEXT NOT NULL UNIQUE,
                user_pw TEXT NOT NULL
            )
            ''')
            
            # Brain 테이블 생성
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS Brain (
                brain_id INTEGER PRIMARY KEY AUTOINCREMENT,
                brain_name TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            )
            ''')
            
            # Folder 테이블 생성
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS Folder (
                folder_id INTEGER PRIMARY KEY AUTOINCREMENT,
                folder_name TEXT NOT NULL,
                brain_id INTEGER NOT NULL,
                is_default BOOLEAN DEFAULT 0,
                FOREIGN KEY (brain_id) REFERENCES Brain(brain_id)
            )
            ''')
            
            # Memo 테이블 생성
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS Memo (
                memo_id INTEGER PRIMARY KEY AUTOINCREMENT,
                memo_text TEXT,
                memo_title TEXT,
                memo_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_source BOOLEAN DEFAULT 0,
                folder_id INTEGER,
                FOREIGN KEY (folder_id) REFERENCES Folder(folder_id)
            )
            ''')
            
            conn.commit()
            conn.close()
            logging.info("SQLite 데이터베이스 초기화 완료: %s", self.db_path)
        except Exception as e:
            logging.error("SQLite 데이터베이스 초기화 오류: %s", str(e))
    
    def _hash_password(self, password: str) -> str:
        """비밀번호를 SHA-256 해시로 변환"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, username: str, password: str) -> dict:
        """새 사용자 생성"""
        try:
            hashed_pw = self._hash_password(password)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "INSERT INTO User (user_name, user_pw) VALUES (?, ?)",
                (username, hashed_pw)
            )
            user_id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            
            logging.info("사용자 생성 완료: user_id=%s, username=%s", user_id, username)
            return {"user_id": user_id, "user_name": username}
        except sqlite3.IntegrityError:
            logging.error("사용자 생성 실패: 이미 존재하는 사용자명")
            raise ValueError("이미 존재하는 사용자명입니다")
        except Exception as e:
            logging.error("사용자 생성 오류: %s", str(e))
            raise RuntimeError(f"사용자 생성 오류: {str(e)}")
    
    def delete_user(self, user_id: int) -> bool:
        """사용자 삭제"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM User WHERE user_id = ?", (user_id,))
            deleted = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            if deleted:
                logging.info("사용자 삭제 완료: user_id=%s", user_id)
            else:
                logging.warning("사용자 삭제 실패: 존재하지 않는 user_id=%s", user_id)
            
            return deleted
        except Exception as e:
            logging.error("사용자 삭제 오류: %s", str(e))
            raise RuntimeError(f"사용자 삭제 오류: {str(e)}")
    
    def update_username(self, user_id: int, new_username: str) -> bool:
        """사용자 이름 업데이트"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "UPDATE User SET user_name = ? WHERE user_id = ?",
                (new_username, user_id)
            )
            updated = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            if updated:
                logging.info("사용자 이름 업데이트 완료: user_id=%s, new_username=%s", user_id, new_username)
            else:
                logging.warning("사용자 이름 업데이트 실패: 존재하지 않는 user_id=%s", user_id)
            
            return updated
        except sqlite3.IntegrityError:
            logging.error("사용자 이름 업데이트 실패: 이미 존재하는 사용자명")
            raise ValueError("이미 존재하는 사용자명입니다")
        except Exception as e:
            logging.error("사용자 이름 업데이트 오류: %s", str(e))
            raise RuntimeError(f"사용자 이름 업데이트 오류: {str(e)}")
    
    def update_password(self, user_id: int, new_password: str) -> bool:
        """사용자 비밀번호 업데이트"""
        try:
            hashed_pw = self._hash_password(new_password)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "UPDATE User SET user_pw = ? WHERE user_id = ?",
                (hashed_pw, user_id)
            )
            updated = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            if updated:
                logging.info("사용자 비밀번호 업데이트 완료: user_id=%s", user_id)
            else:
                logging.warning("사용자 비밀번호 업데이트 실패: 존재하지 않는 user_id=%s", user_id)
            
            return updated
        except Exception as e:
            logging.error("사용자 비밀번호 업데이트 오류: %s", str(e))
            raise RuntimeError(f"사용자 비밀번호 업데이트 오류: {str(e)}")
    
    def get_user(self, user_id: int) -> Optional[dict]:
        """사용자 정보 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT user_id, user_name FROM User WHERE user_id = ?", (user_id,))
            user = cursor.fetchone()
            
            conn.close()
            
            if user:
                return {"user_id": user[0], "user_name": user[1]}
            else:
                return None
        except Exception as e:
            logging.error("사용자 조회 오류: %s", str(e))
            return None
    
    def get_all_users(self) -> List[dict]:
        """모든 사용자 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT user_id, user_name FROM User")
            users = cursor.fetchall()
            
            conn.close()
            
            return [{"user_id": user[0], "user_name": user[1]} for user in users]
        except Exception as e:
            logging.error("사용자 목록 조회 오류: %s", str(e))
            return []
            
    def authenticate_user(self, username: str, password: str) -> Optional[dict]:
        """사용자 인증"""
        try:
            hashed_pw = self._hash_password(password)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT user_id, user_name FROM User WHERE user_name = ? AND user_pw = ?",
                (username, hashed_pw)
            )
            user = cursor.fetchone()
            
            conn.close()
            
            if user:
                return {"user_id": user[0], "user_name": user[1]}
            else:
                return None
        except Exception as e:
            logging.error("사용자 인증 오류: %s", str(e))
            return None
    
    # Brain 관련 메서드
    def create_brain(self, brain_name: str, user_id: int) -> dict:
        """새 브레인 생성"""
        try:
            # 먼저 사용자가 존재하는지 확인
            user = self.get_user(user_id)
            if not user:
                raise ValueError(f"존재하지 않는 사용자 ID: {user_id}")
                
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "INSERT INTO Brain (brain_name, user_id) VALUES (?, ?)",
                (brain_name, user_id)
            )
            brain_id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            
            logging.info("브레인 생성 완료: brain_id=%s, brain_name=%s, user_id=%s", brain_id, brain_name, user_id)
            return {"brain_id": brain_id, "brain_name": brain_name, "user_id": user_id}
        except ValueError as e:
            logging.error("브레인 생성 실패: %s", str(e))
            raise
        except Exception as e:
            logging.error("브레인 생성 오류: %s", str(e))
            raise RuntimeError(f"브레인 생성 오류: {str(e)}")
    
    def delete_brain(self, brain_id: int) -> bool:
        """브레인 삭제"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM Brain WHERE brain_id = ?", (brain_id,))
            deleted = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            if deleted:
                logging.info("브레인 삭제 완료: brain_id=%s", brain_id)
            else:
                logging.warning("브레인 삭제 실패: 존재하지 않는 brain_id=%s", brain_id)
            
            return deleted
        except Exception as e:
            logging.error("브레인 삭제 오류: %s", str(e))
            raise RuntimeError(f"브레인 삭제 오류: {str(e)}")
    
    def update_brain_name(self, brain_id: int, new_brain_name: str) -> bool:
        """브레인 이름 업데이트"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "UPDATE Brain SET brain_name = ? WHERE brain_id = ?",
                (new_brain_name, brain_id)
            )
            updated = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            if updated:
                logging.info("브레인 이름 업데이트 완료: brain_id=%s, new_brain_name=%s", brain_id, new_brain_name)
            else:
                logging.warning("브레인 이름 업데이트 실패: 존재하지 않는 brain_id=%s", brain_id)
            
            return updated
        except Exception as e:
            logging.error("브레인 이름 업데이트 오류: %s", str(e))
            raise RuntimeError(f"브레인 이름 업데이트 오류: {str(e)}")
    
    def get_brain(self, brain_id: int) -> Optional[dict]:
        """브레인 정보 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT brain_id, brain_name, user_id FROM Brain WHERE brain_id = ?", (brain_id,))
            brain = cursor.fetchone()
            
            conn.close()
            
            if brain:
                return {"brain_id": brain[0], "brain_name": brain[1], "user_id": brain[2]}
            else:
                return None
        except Exception as e:
            logging.error("브레인 조회 오류: %s", str(e))
            return None
    
    def get_user_brains(self, user_id: int) -> List[dict]:
        """사용자의 모든 브레인 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT brain_id, brain_name, user_id FROM Brain WHERE user_id = ?", (user_id,))
            brains = cursor.fetchall()
            
            conn.close()
            
            return [{"brain_id": brain[0], "brain_name": brain[1], "user_id": brain[2]} for brain in brains]
        except Exception as e:
            logging.error("사용자 브레인 목록 조회 오류: %s", str(e))
            return []
    
    def get_all_brains(self) -> List[dict]:
        """모든 브레인 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT brain_id, brain_name, user_id FROM Brain")
            brains = cursor.fetchall()
            
            conn.close()
            
            return [{"brain_id": brain[0], "brain_name": brain[1], "user_id": brain[2]} for brain in brains]
        except Exception as e:
            logging.error("브레인 목록 조회 오류: %s", str(e))
            return []
    
    # Folder 관련 메서드
    def create_folder(self, folder_name: str, brain_id: int, is_default: bool = False) -> dict:
        """새 폴더 생성"""
        try:
            # 먼저 브레인이 존재하는지 확인
            brain = self.get_brain(brain_id)
            if not brain:
                raise ValueError(f"존재하지 않는 브레인 ID: {brain_id}")
                
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "INSERT INTO Folder (folder_name, brain_id, is_default) VALUES (?, ?, ?)",
                (folder_name, brain_id, 1 if is_default else 0)
            )
            folder_id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            
            logging.info("폴더 생성 완료: folder_id=%s, folder_name=%s, brain_id=%s, is_default=%s", 
                        folder_id, folder_name, brain_id, is_default)
            return {
                "folder_id": folder_id, 
                "folder_name": folder_name, 
                "brain_id": brain_id,
                "is_default": is_default
            }
        except ValueError as e:
            logging.error("폴더 생성 실패: %s", str(e))
            raise
        except Exception as e:
            logging.error("폴더 생성 오류: %s", str(e))
            raise RuntimeError(f"폴더 생성 오류: {str(e)}")
    
    def delete_folder(self, folder_id: int) -> bool:
        """폴더 삭제"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM Folder WHERE folder_id = ?", (folder_id,))
            deleted = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            if deleted:
                logging.info("폴더 삭제 완료: folder_id=%s", folder_id)
            else:
                logging.warning("폴더 삭제 실패: 존재하지 않는 folder_id=%s", folder_id)
            
            return deleted
        except Exception as e:
            logging.error("폴더 삭제 오류: %s", str(e))
            raise RuntimeError(f"폴더 삭제 오류: {str(e)}")
    
    def update_folder(self, folder_id: int, folder_name: str = None, is_default: bool = None) -> bool:
        """폴더 정보 업데이트"""
        try:
            # 폴더가 존재하는지 확인
            folder = self.get_folder(folder_id)
            if not folder:
                raise ValueError(f"존재하지 않는 폴더 ID: {folder_id}")
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 업데이트할 필드 지정
            update_fields = []
            params = []
            
            if folder_name is not None:
                update_fields.append("folder_name = ?")
                params.append(folder_name)
                
            if is_default is not None:
                update_fields.append("is_default = ?")
                params.append(1 if is_default else 0)
                
            if not update_fields:
                return False  # 업데이트할 내용 없음
            
            # 쿼리 구성
            query = f"UPDATE Folder SET {', '.join(update_fields)} WHERE folder_id = ?"
            params.append(folder_id)
            
            cursor.execute(query, params)
            updated = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            if updated:
                logging.info("폴더 업데이트 완료: folder_id=%s", folder_id)
            else:
                logging.warning("폴더 업데이트 실패: 존재하지 않는 folder_id=%s", folder_id)
            
            return updated
        except ValueError as e:
            logging.error("폴더 업데이트 실패: %s", str(e))
            raise
        except Exception as e:
            logging.error("폴더 업데이트 오류: %s", str(e))
            raise RuntimeError(f"폴더 업데이트 오류: {str(e)}")
    
    def get_folder(self, folder_id: int) -> Optional[dict]:
        """폴더 정보 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT folder_id, folder_name, brain_id, is_default FROM Folder WHERE folder_id = ?", 
                (folder_id,)
            )
            folder = cursor.fetchone()
            
            conn.close()
            
            if folder:
                return {
                    "folder_id": folder[0], 
                    "folder_name": folder[1], 
                    "brain_id": folder[2],
                    "is_default": bool(folder[3])
                }
            else:
                return None
        except Exception as e:
            logging.error("폴더 조회 오류: %s", str(e))
            return None
    
    def get_brain_folders(self, brain_id: int) -> List[dict]:
        """브레인의 모든 폴더 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT folder_id, folder_name, brain_id, is_default FROM Folder WHERE brain_id = ?", 
                (brain_id,)
            )
            folders = cursor.fetchall()
            
            conn.close()
            
            return [
                {
                    "folder_id": folder[0], 
                    "folder_name": folder[1], 
                    "brain_id": folder[2],
                    "is_default": bool(folder[3])
                } 
                for folder in folders
            ]
        except Exception as e:
            logging.error("브레인 폴더 목록 조회 오류: %s", str(e))
            return []
    
    def get_default_folder(self, brain_id: int) -> Optional[dict]:
        """브레인의 기본 폴더 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT folder_id, folder_name, brain_id, is_default FROM Folder WHERE brain_id = ? AND is_default = 1", 
                (brain_id,)
            )
            folder = cursor.fetchone()
            
            conn.close()
            
            if folder:
                return {
                    "folder_id": folder[0], 
                    "folder_name": folder[1], 
                    "brain_id": folder[2],
                    "is_default": bool(folder[3])
                }
            else:
                return None
        except Exception as e:
            logging.error("기본 폴더 조회 오류: %s", str(e))
            return None
    
    # Memo 관련 메서드
    def create_memo(self, memo_title: str, memo_text: str, folder_id: Optional[int] = None, is_source: bool = False) -> dict:
        """새 메모 생성"""
        try:
            # folder_id가 주어진 경우에만 폴더 존재 여부 확인
            if folder_id is not None:
                folder = self.get_folder(folder_id)
                if not folder:
                    raise ValueError(f"존재하지 않는 폴더 ID: {folder_id}")
                    
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "INSERT INTO Memo (memo_title, memo_text, folder_id, is_source) VALUES (?, ?, ?, ?)",
                (memo_title, memo_text, folder_id, 1 if is_source else 0)
            )
            memo_id = cursor.lastrowid
            
            # 현재 날짜 가져오기 (자동 생성됨)
            cursor.execute("SELECT memo_date FROM Memo WHERE memo_id = ?", (memo_id,))
            memo_date = cursor.fetchone()[0]
            
            conn.commit()
            conn.close()
            
            logging.info("메모 생성 완료: memo_id=%s, memo_title=%s, folder_id=%s", 
                        memo_id, memo_title, folder_id)
            return {
                "memo_id": memo_id, 
                "memo_title": memo_title, 
                "memo_text": memo_text,
                "memo_date": memo_date,
                "is_source": is_source,
                "folder_id": folder_id
            }
        except ValueError as e:
            logging.error("메모 생성 실패: %s", str(e))
            raise
        except Exception as e:
            logging.error("메모 생성 오류: %s", str(e))
            raise RuntimeError(f"메모 생성 오류: {str(e)}")
    
    def delete_memo(self, memo_id: int) -> bool:
        """메모 삭제"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM Memo WHERE memo_id = ?", (memo_id,))
            deleted = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            if deleted:
                logging.info("메모 삭제 완료: memo_id=%s", memo_id)
            else:
                logging.warning("메모 삭제 실패: 존재하지 않는 memo_id=%s", memo_id)
            
            return deleted
        except Exception as e:
            logging.error("메모 삭제 오류: %s", str(e))
            raise RuntimeError(f"메모 삭제 오류: {str(e)}")
    
    def update_memo(self, memo_id: int, memo_title: str = None, memo_text: str = None, is_source: bool = None, folder_id: Optional[int] = None) -> bool:
        """메모 정보 업데이트"""
        try:
            # 메모가 존재하는지 확인
            memo = self.get_memo(memo_id)
            if not memo:
                raise ValueError(f"존재하지 않는 메모 ID: {memo_id}")
            
            # folder_id가 주어진 경우 폴더 존재 여부 확인
            if folder_id is not None:
                folder = self.get_folder(folder_id)
                if not folder:
                    raise ValueError(f"존재하지 않는 폴더 ID: {folder_id}")
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 업데이트할 필드 지정
            update_fields = []
            params = []
            
            if memo_title is not None:
                update_fields.append("memo_title = ?")
                params.append(memo_title)
                
            if memo_text is not None:
                update_fields.append("memo_text = ?")
                params.append(memo_text)
                
            if is_source is not None:
                update_fields.append("is_source = ?")
                params.append(1 if is_source else 0)

            if folder_id is not None:
                update_fields.append("folder_id = ?")
                params.append(folder_id)
                
            if not update_fields:
                return False  # 업데이트할 내용 없음
            
            # 날짜 자동 업데이트
            update_fields.append("memo_date = CURRENT_TIMESTAMP")
            
            # 쿼리 구성
            query = f"UPDATE Memo SET {', '.join(update_fields)} WHERE memo_id = ?"
            params.append(memo_id)
            
            cursor.execute(query, params)
            updated = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            if updated:
                logging.info("메모 업데이트 완료: memo_id=%s", memo_id)
            else:
                logging.warning("메모 업데이트 실패: 존재하지 않는 memo_id=%s", memo_id)
            
            return updated
        except ValueError as e:
            logging.error("메모 업데이트 실패: %s", str(e))
            raise
        except Exception as e:
            logging.error("메모 업데이트 오류: %s", str(e))
            raise RuntimeError(f"메모 업데이트 오류: {str(e)}")
    
    def get_memo(self, memo_id: int) -> Optional[dict]:
        """메모 정보 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT memo_id, memo_title, memo_text, memo_date, is_source, folder_id FROM Memo WHERE memo_id = ?", 
                (memo_id,)
            )
            memo = cursor.fetchone()
            
            conn.close()
            
            if memo:
                return {
                    "memo_id": memo[0], 
                    "memo_title": memo[1], 
                    "memo_text": memo[2],
                    "memo_date": memo[3],
                    "is_source": bool(memo[4]),
                    "folder_id": memo[5]
                }
            else:
                return None
        except Exception as e:
            logging.error("메모 조회 오류: %s", str(e))
            return None
    
    def get_folder_memos(self, folder_id: int) -> List[dict]:
        """폴더의 모든 메모 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT memo_id, memo_title, memo_text, memo_date, is_source, folder_id FROM Memo WHERE folder_id = ? ORDER BY memo_date DESC", 
                (folder_id,)
            )
            memos = cursor.fetchall()
            
            conn.close()
            
            return [
                {
                    "memo_id": memo[0], 
                    "memo_title": memo[1], 
                    "memo_text": memo[2],
                    "memo_date": memo[3],
                    "is_source": bool(memo[4]),
                    "folder_id": memo[5]
                } 
                for memo in memos
            ]
        except Exception as e:
            logging.error("폴더 메모 목록 조회 오류: %s", str(e))
            return []
            
    def get_folder_memo_titles(self, folder_id: int) -> List[dict]:
        """폴더의 모든 메모 제목만 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT memo_id, memo_title, memo_date, is_source FROM Memo WHERE folder_id = ? ORDER BY memo_date DESC", 
                (folder_id,)
            )
            memos = cursor.fetchall()
            
            conn.close()
            
            return [
                {
                    "memo_id": memo[0], 
                    "memo_title": memo[1],
                    "memo_date": memo[2],
                    "is_source": bool(memo[3])
                } 
                for memo in memos
            ]
        except Exception as e:
            logging.error("폴더 메모 제목 목록 조회 오류: %s", str(e))
            return [] 