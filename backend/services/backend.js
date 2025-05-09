// src/services/backend.js
import { api } from './api';

/* ───────── USERS ───────── */
export const createUser = (username, password) => api.post('/users', { username, password }).then(r => r.data);
export const listUsers = () => api.get('/users').then(r => r.data);
export const getUser = id => api.get(`/users/${id}`).then(r => r.data);
export const updateUser = (id, body) => api.put(`/users/${id}`, body).then(r => r.data);
export const authUser = (username, password) => api.post('/users/auth', { username, password }).then(r => r.data);

/* ───────── BRAINS ───────── */
export const createBrain = ({ brain_name, user_id, icon_key, files }) =>
    api.post('/brains', {
        brain_name,
        user_id,
        icon_key,
        files,
    }).then(res => res.data);
export const listBrains = () => api.get('/brains').then(r => r.data);
export const listUserBrains = user_id => api.get(`/brains/user/${user_id}`).then(r => r.data);
export const getBrain = id => api.get(`/brains/${id}`).then(r => r.data);
export const updateBrain = (id, body) => api.put(`/brains/${id}`, body).then(r => r.data);
export const deleteBrain = id => api.delete(`/brains/${id}`);
export const renameBrain = (id, brain_name) => api.patch(`/brains/${id}/rename`, { brain_name }).then(r => r.data);

/* ───────── FOLDERS ───────── */
export const createFolder = (folder_name, brain_id) => api.post('/folders/create_folder', { folder_name, brain_id }).then(r => r.data);
export const listBrainFolders = brain_id => api.get(`/folders/brain/${brain_id}`).then(r => r.data);
export const getFolder = id => api.get(`/folders/${id}`).then(r => r.data);
export const updateFolder = (id, folder_name) => api.put(`/folders/${id}`, { folder_name }).then(r => r.data);
export const deleteFolder = id => api.delete(`/folders/${id}`);
export const deleteFolderWithMemos = id => api.delete(`/folders/deleteAll/${id}`).then(r => r.data);

/* ───────── MEMOS ───────── */
/** 새 메모 생성 */
export const createMemo = body => api.post('/memos', body).then(r => r.data);

/** 메모 조회 */
export const getMemo = id => api.get(`/memos/${id}`).then(r => r.data);

/** 메모 전체 업데이트 */
export const updateMemo = (id, body) => api.put(`/memos/${id}`, body).then(r => r.data);

/** 메모 삭제 */
export const deleteMemo = id => api.delete(`/memos/${id}`);

/** 메모를 소스로 설정 */
export const setMemoAsSource = id => api.put(`/memos/${id}/isSource`).then(r => r.data);

/** 메모를 비소스로 설정 */
export const setMemoAsNotSource = id => api.put(`/memos/${id}/isNotSource`).then(r => r.data);

/** 메모의 폴더 변경 (이동) */
export const moveMemoToFolder = (targetFolderId, memoId) => api.put(`/memos/changeFolder/${targetFolderId}/${memoId}`).then(r => r.data);

/** 메모를 폴더에서 제거 (Move out folder) */
export const removeMemoFromFolder = memoId => api.put(`/memos/MoveOutFolder/${memoId}`).then(r => r.data);