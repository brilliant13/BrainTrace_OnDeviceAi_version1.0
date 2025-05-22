// src/components/panels/MemoListPanel.jsx
import React, { useState, useRef } from 'react';
import './styles/MemoList.css';
import { CiMemoPad } from 'react-icons/ci';
import { MdOutlineRestore } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineDeleteForever } from "react-icons/md"; // 휴지통
import { MdKeyboardBackspace } from "react-icons/md";
import { BsTrash } from "react-icons/bs";
import micOff from '../../assets/icons/mic_off.png'
import micOn from '../../assets/icons/mic_on.png'
import { TbTrashX } from "react-icons/tb";
import { IoTrashBinOutline } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { LuTrash } from "react-icons/lu";

function formatTime(seconds) {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
}

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

    const [elapsedTime, setElapsedTime] = useState(0);
    const [showOnIcon, setShowOnIcon] = useState(true);
    const intervalRef = useRef(null);
    const blinkRef = useRef(null);

    const handleMicClick = () => {
        if (!isRecording) {
            // 녹음 시작
            setElapsedTime(0);
            intervalRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
            blinkRef.current = setInterval(() => {
                setShowOnIcon(prev => !prev);
            }, 1000);
        } else {
            // 녹음 중지
            clearInterval(intervalRef.current);
            clearInterval(blinkRef.current);
        }
        setIsRecording(prev => !prev);
    };

    const isTrash = showTrash;
    const displayedMemos = isTrash ? deletedMemos : memos;

    return (
        <div className="memo-list-wrapper notebook-style">
            <div className="memo-list-header">
                <div className="memo-list-header-left">
                    <div className="memo-list-title-row">
                        {isTrash ? (
                            <>
                                <BsTrash className="memo-title-icon" />
                                <span className="memo-title-text">bin</span>
                            </>
                        ) : (
                            <>
                                <CiMemoPad className="memo-title-icon" />
                                <span className="memo-title-text">note</span>
                            </>
                        )}
                    </div>
                </div>


                <div className="memo-list-header-right">
                    {isTrash && (
                        <div className="tooltip-container">
                            <span className="tooltip-icon">?</span>
                            <div className="tooltip-text">
                                휴지통에 있는 메모는<br />30일 후 자동 삭제됩니다.
                            </div>
                        </div>
                    )}

                    {!isTrash && (
                        <>
                            <div className="mic-wrapper">
                                {isRecording && (
                                    <div className="recording-indicator-timer">
                                        {formatTime(elapsedTime)}
                                    </div>
                                )}
                                <img
                                    src={isRecording ? (showOnIcon ? micOn : micOff) : micOff}
                                    alt="mic"
                                    className={`mic-icon ${isRecording ? 'recording' : ''}`}
                                    onClick={handleMicClick}
                                />
                            </div>

                            <button className="add-memo-button" onClick={onAdd}>+ 새 메모</button>
                        </>
                    )}
                </div>


            </div>

            <div className="memo-list">
                {displayedMemos.length === 0 && (
                    <div className="memo-empty-state">
                        {!isTrash ? (
                            <>
                                <CgNotes className="memo-empty-icon" />
                                <div className="memo-empty-text">저장된 메모가 여기에 표시됩니다</div>
                                <div className="memo-empty-subtext">
                                    중요한 생각을 메모로 남기고<br />드래그해서 소스로 추가하면 그래프에 반영됩니다.
                                </div>
                            </>
                        ) : (
                            <>
                                <LuTrash className="memo-empty-icon" />
                                <div className="memo-empty-text">휴지통이 비어 있어요</div>
                                <div className="memo-empty-subtext">
                                    삭제된 메모가 이곳에 표시됩니다.<br />
                                    메모는 30일 후 자동으로 완전히 삭제돼요.
                                </div>
                            </>
                        )}
                    </div>
                )}


                {displayedMemos.map((memo) => {
                    const filename = `${memo.title || '메모'}.txt`;
                    const content = memo.content || '';

                    return (
                        <div
                            key={memo.id}
                            className={`memo-item ${isTrash ? 'trash' : ''} ${selectedId === memo.id ? 'active' : ''} ${highlightedId === memo.id ? 'highlighted' : ''}`}
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
                                    <IoTrashBinOutline size={18} />
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

                <div className="memo-list-header-toggle" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
                    <div className="memo-header-icons">
                        {!showTrash ? (
                            <BsTrash
                                className="header-icon"
                                onClick={() => setShowTrash(true)}
                                title="휴지통 보기"
                            />
                        ) : (
                            <CiMemoPad
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
