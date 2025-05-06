// src/services/backend.js
import { api } from './api';

/* ───────── USERS ───────── */
//export const createUser = (username, password) => api.post('/users', { username, password }).then(r => r.data);
export const listUsers = () => api.get('/users').then(r => r.data);
export const getUser = id => api.get(`/users/${id}`).then(r => r.data);
export const updateUser = (id, body) => api.put(`/users/${id}`, body).then(r => r.data);
//export const authUser = (username, password) => api.post('/users/auth', { username, password }).then(r => r.data);
export const login = (username, password) =>
    api.post('/users/auth', { username, password }).then(r => r.data);
export const register = (username, password) =>
    api.post('/users', { username, password }).then(r => r.data);

/* ───────── BRAINS ───────── */
// export const createBrain = (brain_name, user_id) => api.post('/brains', { brain_name, user_id }).then(r => r.data);
// export const listBrains = () => api.get('/brains').then(r => r.data);
// export const listUserBrains = user_id => api.get(`/brains/user/${user_id}`).then(r => r.data);
// export const getBrain = id => api.get(`/brains/${id}`).then(r => r.data);
// export const updateBrain = (id, brain_name) => api.put(`/brains/${id}`, { brain_name }).then(r => r.data);
// export const deleteBrain = id => api.delete(`/brains/${id}`);

/**
 * 새 브레인 생성
 * @param {Object} brain  {
 *    brain_name : string,
 *    user_id    : number,
 *    icon_key?  : string,   // 예: "BsGraphUp"
 *    files?     : array,    // projectData[i].files 구조
 *    created_at?: string    // "2025-05-06" 같은 날짜 문자열
 * }
 */
export const createBrain = (brain) =>
    api.post('/brains', brain).then(r => r.data);

/** 모든 브레인 */
export const listBrains = () =>
    api.get('/brains').then(r => r.data);

/** 특정 사용자의 브레인 */
export const listUserBrains = (user_id) =>
    api.get(`/brains/user/${user_id}`).then(r => r.data);

/** 브레인 상세 */
export const getBrain = (id) =>
    api.get(`/brains/${id}`).then(r => r.data);

/**
 * 브레인 업데이트 (필드 선택적)
 * @param {number} id
 * @param {Object} body  {
 *    brain_name? : string,
 *    icon_key?   : string,
 *    files?      : array,
 *    created_at? : string
 * }
 */
export const updateBrain = (id, body) =>
    api.put(`/brains/${id}`, body).then(r => r.data);

/* 브레인 삭제 */
export const deleteBrain = (id) =>
    api.delete(`/brains/${id}`);

/* 브레인 제목 수정 */
export const renameBrain = (id, brain_name) =>
    api.patch(`/brains/${id}/rename`, { brain_name }).then(r => r.data);

/* ───────── FOLDERS ───────── */
export const createFolder = (folder_name, brain_id) => api.post('/folders/create_folder', { folder_name, brain_id }).then(r => r.data);
export const listBrainFolders = brain_id => api.get(`/folders/brain/${brain_id}`).then(r => r.data);
export const getFolder = id => api.get(`/folders/${id}`).then(r => r.data);
export const updateFolder = (id, folder_name) => api.put(`/folders/${id}`, { folder_name }).then(r => r.data);
export const deleteFolder = id => api.delete(`/folders/${id}`);
export const deleteFolderWithMemos = id => api.delete(`/folders/deleteAll/${id}`).then(r => r.data);

/* ───────── MEMOS ───────── */
export const createMemo = body => api.post('/memos', body).then(r => r.data);
export const getMemo = id => api.get(`/memos/${id}`).then(r => r.data);
export const updateMemo = (id, body) => api.put(`/memos/${id}`, body).then(r => r.data);
export const deleteMemo = id => api.delete(`/memos/${id}`);
export const moveMemoToFolder = (folder_id, memo_id) => api.put(`/memos/changeFolder/${folder_id}/${memo_id}`).then(r => r.data);
export const removeMemoFromFolder = memo_id => api.put(`/memos/MoveOutFolder/${memo_id}`).then(r => r.data);

