// src/services/backend.js
import { api } from './api';

/* ───────── USERS ───────── */
export const createUser = (username, password) => api.post('/users', { username, password }).then(r => r.data);
export const listUsers = () => api.get('/users').then(r => r.data);
export const getUser = id => api.get(`/users/${id}`).then(r => r.data);
export const updateUser = (id, body) => api.put(`/users/${id}`, body).then(r => r.data);
export const authUser = (username, password) => api.post('/users/auth', { username, password }).then(r => r.data);

/* ───────── BRAINS ───────── */
export const createBrain = ({ brain_name, user_id, icon_key }) =>
    api.post('/brains', {
        brain_name,
        user_id,
        icon_key,
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
export const getFolderTextfiles = folderId => api.get(`/textfiles/folder/${folderId}`).then(r => r.data);
export const getFolderPdfs = folderId => api.get(`/pdfs/folder/${folderId}`).then(r => r.data);
export const getFolderVoices = folderId => api.get(`/voices/folder/${folderId}`).then(r => r.data);

/* ───────── MEMOS ───────── */
export const createMemo = body => api.post('/memos', body).then(r => r.data);
export const getMemo = id => api.get(`/memos/${id}`).then(r => r.data);
export const updateMemo = (id, body) => api.put(`/memos/${id}`, body).then(r => r.data);
export const deleteMemo = id => api.delete(`/memos/${id}`);
export const setMemoAsSource = id => api.put(`/memos/${id}/isSource`).then(r => r.data);
export const setMemoAsNotSource = id => api.put(`/memos/${id}/isNotSource`).then(r => r.data);
export const moveMemoToFolder = (targetFolderId, memoId) => api.put(`/memos/changeFolder/${targetFolderId}/${memoId}`).then(r => r.data);
export const removeMemoFromFolder = memoId => api.put(`/memos/MoveOutFolder/${memoId}`).then(r => r.data);

/* ───────── PDF FILES ───────── */
export const createPdf = body => api.post('/pdfs', body).then(r => r.data);
export const getPdf = id => api.get(`/pdfs/${id}`).then(r => r.data);
export const updatePdf = (id, body) => api.put(`/pdfs/${id}`, body).then(r => r.data);
export const deletePdf = id => api.delete(`/pdfs/${id}`);
export const movePdfToFolder = (brainId, targetFolderId, pdfId) =>
    api.put(
        `/pdfs/brain/${brainId}/changeFolder/${targetFolderId}/${pdfId}`
    ).then(r => r.data);

export const removePdfFromFolder = (brainId, pdfId) =>
    api.put(
        `/pdfs/brain/${brainId}/MoveOutFolder/${pdfId}`
    ).then(r => r.data);
export const getPdfsByBrain = brainId => api.get(`/pdfs/brain/${brainId}`).then(r => r.data)

/* ───────── TEXT FILES ───────── */
export const createTextFile = body => api.post('/textfiles', body).then(r => r.data);
export const getTextFile = id => api.get(`/textfiles/${id}`).then(r => r.data);
export const updateTextFile = (id, body) => api.put(`/textfiles/${id}`, body).then(r => r.data);
export const deleteTextFile = id => api.delete(`/textfiles/${id}`);
export const moveTextfileToFolder = (brainId, targetFolderId, txtId) =>
    api.put(
        `/textfiles/brain/${brainId}/changeFolder/${targetFolderId}/${txtId}`
    ).then(r => r.data);

export const removeTextFileFromFolder = (brainId, txtId) =>
    api.put(
        `/textfiles/brain/${brainId}/MoveOutFolder/${txtId}`
    ).then(r => r.data);
export const getTextfilesByBrain = brainId => api.get(`/textfiles/brain/${brainId}`).then(r => r.data)

/* ───────── VOICE FILES ───────── */
export const createVoice = body => api.post('/voices', body).then(r => r.data);
export const getVoice = id => api.get(`/voices/${id}`).then(r => r.data);
export const updateVoice = (id, body) => api.put(`/voices/${id}`, body).then(r => r.data);
export const deleteVoice = id => api.delete(`/voices/${id}`);
export const moveVoiceToFolder = (brainId, targetFolderId, voiceId) =>
    api.put(
        `/voices/brain/${brainId}/changeFolder/${targetFolderId}/${voiceId}`
    ).then(r => r.data);

export const removeVoiceFromFolder = (brainId, voiceId) =>
    api.put(
        `/voices/brain/${brainId}/MoveOutFolder/${voiceId}`
    ).then(r => r.data);
export const getVoicesByBrain = brainId => api.get(`/voices/brain/${brainId}`).then(r => r.data)

// ───────── DEFAULT (루트) ───────── //
export const getDefaultPdfs = () => api.get(`/pdfs/default`).then(r => r.data);
export const getDefaultTextfiles = () => api.get(`/textfiles/default`).then(r => r.data);
export const getDefaultVoices = () => api.get(`/voices/default`).then(r => r.data);
