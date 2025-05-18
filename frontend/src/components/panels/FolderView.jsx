// src/components/panels/FolderView.jsx
import React, { useState, useEffect } from 'react';
import { TiUpload } from 'react-icons/ti';
import FileIcon from './FileIcon';
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/Scrollbar.css';
import './styles/FileView.css';
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { GoPencil } from 'react-icons/go';
import { RiDeleteBinLine } from 'react-icons/ri';
import ConfirmDialog from '../ConfirmDialog';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
    getFolderTextfiles,
    getFolderPdfs,
    getFolderVoices,
    deletePdf,
    deleteTextFile,
    deleteVoice,
    updatePdf,
    updateTextFile,
    updateVoice,
    deleteFolderWithMemos,  // ✅ 폴더 삭제 추가
    updateFolder            // ✅ 폴더 이름 수정 추가
} from '../../../../backend/services/backend';

export default function FolderView({
    item,
    depth = 0,
    selectedFile,
    onSelectFile,
    onDropFileToFolder,
    onOpenPDF,
    fileMap,
    moveItem,      // 부모 FileView의 moveItem
    refreshParent, // 부모 FileView의 전체 트리 갱신 함수
    refreshKey,
    brainId,
    onGraphRefresh
}) {
    const [isOpen, setIsOpen] = useState(depth === 1);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragEnterCount, setDragEnterCount] = useState(0);
    const [childrenFiles, setChildrenFiles] = useState([]);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState('');
    const [fileToDelete, setFileToDelete] = useState(null);
    // 파일 추가 로딩 큐  
    const [uploadQueue, setUploadQueue] = useState([]);

    // 폴더 열 때, 자식 파일들 API 호출
    const fetchFolderFiles = async () => {
        if (!item.folder_id) return;
        try {
            const [txts, pdfs, voices] = await Promise.all([
                getFolderTextfiles(item.folder_id),
                getFolderPdfs(item.folder_id),
                getFolderVoices(item.folder_id)
            ]);
            const all = [
                ...txts.map(f => ({ id: f.txt_id, name: f.txt_title, filetype: 'txt', meta: f })),
                ...pdfs.map(f => ({ id: f.pdf_id, name: f.pdf_title, filetype: 'pdf', meta: f })),
                ...voices.map(f => ({ id: f.voice_id, name: f.voice_title, filetype: 'voice', meta: f }))
            ];
            setChildrenFiles(all);
        } catch (err) {
            console.error('폴더 파일 불러오기 실패:', err);
        }
    };

    const toggleFolder = e => {
        e.stopPropagation();
        const willOpen = !isOpen;
        setIsOpen(willOpen);
        if (willOpen) fetchFolderFiles();
    };

    useEffect(() => {
        if (isOpen) fetchFolderFiles();
    }, [refreshKey, isOpen]);

    const handleDragEnter = e => {
        e.preventDefault(); e.stopPropagation();
        setDragEnterCount(c => c + 1);
        setIsDragOver(true);
    };
    const handleDragLeave = e => {
        e.preventDefault(); e.stopPropagation();
        setDragEnterCount(c => {
            const nc = c - 1;
            if (nc <= 0) {
                setIsDragOver(false);
                return 0;
            }
            return nc;
        });
    };

    const handleDrop = async e => {
        e.preventDefault(); e.stopPropagation();
        setIsDragOver(false);
        setDragEnterCount(0);

        // 1) 내부 이동용 JSON
        const movedRaw = e.dataTransfer.getData('application/json');
        if (movedRaw) {
            try {
                const { id, filetype } = JSON.parse(movedRaw);
                // 부모에 이동 요청
                await moveItem({ id, filetype }, item.folder_id);
                // 부모 전체 갱신
                await refreshParent();
                // 내 자식 리스트도 갱신
                await fetchFolderFiles();
            } catch (err) {
                console.error('파일 이동 실패:', err);
            }
            return;
        }

        // 2) 메모 드롭(json-memo)
        const memoData = e.dataTransfer.getData('application/json-memo');
        if (memoData) {
            const { name, content } = JSON.parse(memoData);
            const key = `${name}-${Date.now()}`;
            // 1) 큐에 등록
            setUploadQueue(q => [...q, { key, name, filetype: 'txt' }]);
            try {
                // 2) 생성 & 그래프
                const newFile = new File([content], name, { type: 'text/plain' });
                const results = await onDropFileToFolder(item.folder_id, [newFile]);
                const newId = results?.[0]?.id;

                // 3) 큐에서 제거
                setUploadQueue(q => q.filter(i => i.key !== key));

                if (onGraphRefresh) onGraphRefresh();
                refreshParent();
                fetchFolderFiles();
            } catch (err) {
                console.error('메모 파일 생성 실패:', err);
                setUploadQueue(q => q.filter(i => i.key !== key));
            }
            return;
        }

        // 3) OS 파일 드롭
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            // 각 파일에 대해 큐에 스피너 추가 후 생성
            droppedFiles.forEach(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                const key = `${file.name}-${Date.now()}`;
                // 1) 로딩 큐에 등록
                setUploadQueue(q => [...q, { key, name: file.name, filetype: ext }]);

                // 2) 실제 생성 & 그래프
                onDropFileToFolder(item.folder_id, [file])
                    .then(results => {
                        // (선택) results 배열에서 신규 id를 가져올 수 있으면 r.id 사용
                        const newId = results?.[0]?.id;

                        // 3) 큐에서 제거
                        setUploadQueue(q => q.filter(i => i.key !== key));

                        if (onGraphRefresh) onGraphRefresh();
                        refreshParent();
                        fetchFolderFiles();
                    })
                    .catch(err => {
                        console.error('폴더 파일 생성 실패', err);
                        setUploadQueue(q => q.filter(i => i.key !== key));
                    });
            });
        }
    };

    const handleNameChange = async (file) => {
        const newName = tempName.trim();
        if (!newName || newName === file.name) {
            setEditingId(null);
            return;
        }

        try {
            if (file.filetype === 'pdf') await updatePdf(file.id, { pdf_title: newName, brain_id: brainId });
            if (file.filetype === 'txt') await updateTextFile(file.id, { txt_title: newName, brain_id: brainId });
            if (file.filetype === 'voice') await updateVoice(file.id, { voice_title: newName, brain_id: brainId });
            await fetchFolderFiles();
        } catch (e) {
            alert('이름 변경 실패');
        } finally {
            setEditingId(null);
        }
    };

    const handleDelete = async target => {
        try {
            if (target.filetype) {
                if (target.filetype === 'pdf') await deletePdf(target.id);
                else if (target.filetype === 'txt') await deleteTextFile(target.id);
                else if (target.filetype === 'voice') await deleteVoice(target.id);
            } else if (target.folder_id) {
                await deleteFolderWithMemos(target.folder_id, brainId); // 🔐
            }
            await fetchFolderFiles();
            refreshParent();
            if (onGraphRefresh) onGraphRefresh();
        } catch (e) {
            alert('삭제 실패');
        }
    };
    const handleFolderRename = async (folder) => {
        const newName = tempName.trim();
        if (!newName || newName === folder.name) {
            setEditingId(null);
            return;
        }
        try {
            await updateFolder(folder.folder_id, newName);
            await refreshParent();
        } catch (e) {
            alert('폴더 이름 변경 실패');
        } finally {
            setEditingId(null);
        }
    };

    const openDeleteConfirm = (f) => {
        setFileToDelete(f); // 삭제할 파일 지정
        setMenuOpenId(null); // 점점점 메뉴 닫기
    };
    return (
        <div
            className={`folder-container ${isDragOver ? 'folder-drag-over' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
        >
            {isDragOver && (
                <div className="drop-overlay">
                    <div className="drop-icon"><TiUpload /></div>
                </div>
            )}
            <div
                className={`file-item folder-item${isDragOver ? ' drag-over' : ''}`}
                style={{ paddingLeft: `${depth * 16}px` }}
                onClick={toggleFolder}
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', item.folder_id)}
            >
                <span className="tree-toggle">{isOpen ? <MdOutlineKeyboardArrowDown /> : <MdOutlineKeyboardArrowRight />}</span>


                {editingId === item.folder_id ? (
                    <input
                        className="rename-input"
                        autoFocus
                        defaultValue={item.name}
                        onChange={e => setTempName(e.target.value)}
                        onBlur={() => handleFolderRename(item)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleFolderRename(item);
                            if (e.key === 'Escape') setEditingId(null);
                        }}
                    />
                ) : (
                    <span className="file-name folder-name">{item.name}</span>
                )}

                <div
                    className="file-menu-button"
                    onClick={e => {
                        e.stopPropagation();
                        setMenuOpenId(prev => prev === item.folder_id ? null : item.folder_id);
                    }}
                >
                    ⋮
                    {menuOpenId === item.folder_id && (
                        <div className="file-menu-popup" onClick={e => e.stopPropagation()}>
                            <div
                                className="popup-item"
                                onClick={() => {
                                    setEditingId(item.folder_id);
                                    setTempName(item.name);
                                    setMenuOpenId(null);
                                }}
                            >
                                <GoPencil size={14} style={{ marginRight: 4 }} /> 이름 바꾸기
                            </div>
                            <div
                                className="popup-item"
                                onClick={() => {
                                    setFileToDelete(item);
                                    setMenuOpenId(null);
                                }}
                            >
                                <RiDeleteBinLine size={14} style={{ marginRight: 4 }} /> 삭제
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* ── 업로드 진행중 표시 ── */}
            {uploadQueue.map(item => (
                <div
                    key={item.key}
                    className="file-item uploading"
                    style={{ paddingLeft: `${(depth + 1) * 16}px` }}
                >
                    <FileIcon fileName={item.name} />
                    <span className="file-name">{item.name}</span>
                    <span className="upload-status">
                        <span className="loading-text">그래프 변환 중</span>
                        <AiOutlineLoading3Quarters className="loading-spinner" />

                    </span>
                </div>
            ))
            }

            {isOpen && (
                <div className="tree-children">
                    {childrenFiles.map(child => (
                        <div
                            key={child.id}
                            className={`file-item ${selectedFile === `${item.name}/${child.name}` ? 'selected' : ''}`}
                            style={{ paddingLeft: `${(depth + 1) * 16}px` }}
                            onClick={() => {
                                const path = `${item.name}/${child.name}`;
                                onSelectFile(path);
                                if (child.filetype === 'pdf') {
                                    onOpenPDF(child.meta);
                                }
                            }}
                            draggable
                            onDragStart={e => {
                                e.dataTransfer.setData(
                                    'application/json',
                                    JSON.stringify({ id: child.id, filetype: child.filetype })
                                );
                            }}
                        >
                            <FileIcon fileName={child.name} />
                            {editingId === child.id ? (
                                <input
                                    className="rename-input"
                                    autoFocus
                                    defaultValue={child.name}
                                    onChange={e => setTempName(e.target.value)}
                                    onBlur={() => handleNameChange(child)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleNameChange(child);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                />
                            ) : (
                                <span className="file-name">{child.name}</span>
                            )}
                            <div
                                className="file-menu-button"
                                onClick={e => {
                                    e.stopPropagation();
                                    setMenuOpenId(prev => prev === child.id ? null : child.id);
                                }}
                            >
                                ⋮
                                {menuOpenId === child.id && (
                                    <div className="file-menu-popup" onClick={e => e.stopPropagation()}>
                                        <div className="popup-item" onClick={() => { setEditingId(child.id); setTempName(child.name); setMenuOpenId(null); }}>
                                            <GoPencil size={14} style={{ marginRight: 4 }} /> 이름 바꾸기
                                        </div>
                                        <div className="popup-item" onClick={() => openDeleteConfirm(child)}>
                                            <RiDeleteBinLine size={14} style={{ marginRight: 4 }} /> 삭제
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {fileToDelete && (
                <ConfirmDialog
                    message={`"${fileToDelete.name}" ${fileToDelete.filetype ? '파일' : '폴더'}을 삭제하시겠습니까?`}
                    onCancel={() => setFileToDelete(null)}
                    onOk={async () => {
                        await handleDelete(fileToDelete);
                        setFileToDelete(null);
                    }}
                />
            )}
        </div>
    );
}
