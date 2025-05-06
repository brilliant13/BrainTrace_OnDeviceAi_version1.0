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
export const createBrain = (brain_name, user_id) => api.post('/brains', { brain_name, user_id }).then(r => r.data);
export const listBrains = () => api.get('/brains').then(r => r.data);
export const listUserBrains = user_id => api.get(`/brains/user/${user_id}`).then(r => r.data);
export const getBrain = id => api.get(`/brains/${id}`).then(r => r.data);
export const updateBrain = (id, brain_name) => api.put(`/brains/${id}`, { brain_name }).then(r => r.data);
export const deleteBrain = id => api.delete(`/brains/${id}`);

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

