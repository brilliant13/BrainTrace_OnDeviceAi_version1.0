// src/components/panels/MemoListPanel.jsx
import React from 'react';
import './styles/MemoList.css';
import { CiMemoPad } from 'react-icons/ci';

function MemoListPanel({ memos, selectedId, highlightedId, onSelect, onAdd, onDelete }) {
    return (
        <div className="memo-list-wrapper notebook-style">
            <div className="memo-list-header">
                <div className="memo-list-header-left">
                    <p className="memo-list-title">
                        <CiMemoPad className="memo-title-icon" />
                        <span className="memo-title-text">note</span>
                    </p>
                    <span className="memo-count">총 {memos.length}개</span>
                </div>
                <button className="add-memo-button" onClick={onAdd}>+ 새 메모</button>
            </div>

            <div className="memo-list">
                {memos.map((memo) => {
                    const filename = `${memo.title || '메모'}.txt`;
                    const content = memo.content || '';

                    return (
                        <div
                            key={memo.id}
                            className={`memo-item
                ${selectedId === memo.id ? 'active' : ''}
                ${highlightedId === memo.id ? 'highlighted' : ''}`}
                            draggable
                            onDragStart={e => {
                                // 메모를 텍스트 파일로 변환해서 넘겨줄 때
                                const dragData = {
                                    name: filename,
                                    content
                                };
                                e.dataTransfer.setData(
                                    'application/json-memo',
                                    JSON.stringify(dragData)
                                );
                                // 옵션: 복사만 허용
                                e.dataTransfer.effectAllowed = 'copy';
                                e.currentTarget.classList.add('dragging');
                            }}
                            onDragEnd={e => {
                                e.currentTarget.classList.remove('dragging');
                            }}
                        >
                            <div className="memo-item-content" onClick={() => onSelect(memo.id)}>
                                <div className="memo-title">{memo.title || '제목 없음'}</div>
                                <div className="memo-preview">
                                    {(content.length > 0
                                        ? content.slice(0, 40).replace(/\n/g, ' ')
                                        : '내용 없음'
                                    )}...
                                </div>
                                <div className="memo-date">
                                    {new Date(memo.id).toLocaleDateString()}
                                </div>
                            </div>
                            <button
                                className="delete-button"
                                onClick={e => { e.stopPropagation(); onDelete(memo.id); }}
                            >
                                🗑
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MemoListPanel;
