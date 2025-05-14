// src/components/panels/MemoListPanel.jsx
import React, { useState } from 'react';
import './styles/MemoList.css';
import { CiMemoPad } from 'react-icons/ci';
import { FaTrashAlt } from "react-icons/fa"; // 휴지통
import { HiOutlineMicrophone } from "react-icons/hi";
import { HiMicrophone } from "react-icons/hi2";
import { HiQueueList } from "react-icons/hi2";
import { MdOutlineRestore } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { RiDeleteBin2Line } from "react-icons/ri"; // 휴지통
import { MdOutlineDeleteForever } from "react-icons/md"; // 휴지통

import { MdKeyboardBackspace } from "react-icons/md";
function MemoListPanel({
    memos,
    deletedMemos,
    selectedId,
    highlightedId,
    onSelect,
    onAdd,
    onDelete,
    onRestore
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [showTrash, setShowTrash] = useState(false);

    const handleMicClick = () => {
        setIsRecording(prev => !prev);
        // 추후 Whisper 녹음 기능 연결 예정
    };

    const isTrash = showTrash;
    const displayedMemos = isTrash ? deletedMemos : memos;

    return (
        <div className="memo-list-wrapper notebook-style">
            <div className="memo-list-header">
                <div className="memo-list-header-left">
                    <div className="memo-list-title-row">
                        <CiMemoPad className="memo-title-icon" />
                        <span className="memo-title-text">note</span>
                    </div>
                    {/* <span className="memo-count">총 {displayedMemos.length}개</span> */}
                </div>

                <div className="memo-list-header-right">
                    {isRecording ? (
                        <HiMicrophone className="mic-icon" onClick={handleMicClick} />
                    ) : (
                        <HiOutlineMicrophone className="mic-icon" onClick={handleMicClick} />
                    )}
                    <button className="add-memo-button" onClick={onAdd}>+ 새 메모</button>
                </div>
            </div>

            {/* 리스트 / 휴지통 토글 */}
            {/* <div className="memo-list-header-toggle" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px' }}>
                <div className="memo-header-icons">
                    <HiQueueList
                        className={`header-icon ${!isTrash ? 'active' : ''}`}
                        onClick={() => setShowTrash(false)}
                        title="메모 목록"
                    />
                    <div className="icon-divider" />
                    <FaRegTrashAlt
                        className={`header-icon ${isTrash ? 'active' : ''}`}
                        onClick={() => setShowTrash(true)}
                        title="휴지통 보기"
                    />
                </div>
            </div> */}


            <div className="memo-list">
                {displayedMemos.map((memo) => {
                    const filename = `${memo.title || '메모'}.txt`;
                    const content = memo.content || '';

                    return (
                        <div
                            key={memo.id}
                            className={`memo-item ${selectedId === memo.id ? 'active' : ''} ${highlightedId === memo.id ? 'highlighted' : ''}`}
                            draggable={!isTrash}
                            onDragStart={!isTrash ? e => {
                                const dragData = { name: filename, content };
                                e.dataTransfer.setData('application/json-memo', JSON.stringify(dragData));
                                e.dataTransfer.effectAllowed = 'copy';
                                e.currentTarget.classList.add('dragging');
                            } : undefined}
                            onDragEnd={!isTrash ? e => e.currentTarget.classList.remove('dragging') : undefined}
                        >
                            <div className="memo-item-content" onClick={() => !isTrash && onSelect(memo.id)}>
                                <div className="memo-title">{memo.title || '제목 없음'}</div>
                                <div className="memo-preview">
                                    {(content.length > 0 ? content.slice(0, 40).replace(/\n/g, ' ') : '내용 없음')}...
                                </div>
                                <div className="memo-date">{new Date(memo.id).toLocaleDateString()}</div>
                            </div>

                            {!isTrash ? (
                                <button
                                    className="delete-button"
                                    onClick={e => {
                                        e.stopPropagation();
                                        onDelete(memo.id);
                                    }}
                                >
                                    <MdOutlineDeleteForever />
                                </button>
                            ) : (
                                <button
                                    className="restore-button"
                                    onClick={() => onRestore(memo.id)}
                                >
                                    <MdOutlineRestore />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="memo-footer">
                <div className="memo-count-footer">총 {displayedMemos.length}개</div>
                <div className="memo-list-header-toggle" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px' }}>
                    <div className="memo-header-icons">
                        {!showTrash ? (
                            <FaRegTrashAlt
                                className="header-icon"
                                onClick={() => setShowTrash(true)}
                                title="휴지통 보기"
                            />
                        ) : (
                            <MdKeyboardBackspace
                                className="header-icon"
                                onClick={() => setShowTrash(false)}
                                title="메모 목록으로"
                                size={22}
                            />
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}

export default MemoListPanel;
