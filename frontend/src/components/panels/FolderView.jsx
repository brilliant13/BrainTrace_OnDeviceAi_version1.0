// src/components/panels/FolderView.jsx
import React, { useState, useEffect } from 'react';
import { TiUpload } from 'react-icons/ti';
import FileIcon from './FileIcon';
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/Scrollbar.css';
import './styles/FileView.css';

import {
    getFolderTextfiles,
    getFolderPdfs,
    getFolderVoices
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
    refreshKey
}) {
    const [isOpen, setIsOpen] = useState(depth === 1);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragEnterCount, setDragEnterCount] = useState(0);
    const [childrenFiles, setChildrenFiles] = useState([]);

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
                ...txts.map(f => ({ id: f.txt_id, name: f.txt_title, filetype: 'txt' })),
                ...pdfs.map(f => ({ id: f.pdf_id, name: f.pdf_title, filetype: 'pdf' })),
                ...voices.map(f => ({ id: f.voice_id, name: f.voice_title, filetype: 'voice' }))
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
            try {
                const memo = JSON.parse(memoData);
                const newFile = new File([memo.content], memo.name, { type: 'text/plain' });
                await onDropFileToFolder(item.folder_id, [newFile]);
                await refreshParent();
                await fetchFolderFiles();
            } catch (err) {
                console.error('메모 파싱 오류:', err);
            }
            return;
        }

        // 3) OS 파일 드롭
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            await onDropFileToFolder(item.folder_id, droppedFiles);
            await refreshParent();
            await fetchFolderFiles();
        }
    };

    const handleDragStart = (e, child) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            id: child.id,
            filetype: child.filetype,
            name: child.name
        }));
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
                <span className="tree-toggle">{isOpen ? '▼' : '▶ '}</span>
                <span className="file-name folder-name">{item.name}</span>
            </div>

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
                                if (child.filetype === 'pdf' && fileMap?.[child.name]) {
                                    onOpenPDF(fileMap[child.name]);
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
                            <span className="file-name">{child.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
