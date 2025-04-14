// src/components/panels/MemoListPanel.jsx
import React from 'react';
import './styles/MemoList.css';

function MemoListPanel({ memos, selectedId, highlightedId, onSelect, onAdd, onDelete }) {
    return (
        <div className="memo-list-wrapper notebook-style">
            <div className="memo-list-header">
                <div className="memo-list-header-left">
                    <p className="memo-list-title">📒 메모</p>
                    <span className="memo-count">총 {memos.length}개</span>
                </div>
                <button className="add-memo-button" onClick={onAdd}>+ 새 메모</button>
            </div>

            <div className="memo-list">
                {memos.map((memo) => (
                    <div
                        key={`${memo.id}-${highlightedId === memo.id ? 'highlight' : ''}`}
                        className={`memo-item ${selectedId === memo.id ? 'active' : ''} ${highlightedId === memo.id ? 'highlighted' : ''}`}
                        draggable // ✅ 드래그 가능하게 설정
                        onDragStart={(e) => {
                            const memoText = memo.content || '';
                            const filename = `${memo.title || '메모'}.txt`;
                            const dragData = {
                                type: 'memo',
                                name: filename,
                                content: memoText,
                            };
                            e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                        }}
                    >
                        <div className="memo-item-content" onClick={() => onSelect(memo.id)}>
                            <div className="memo-title">{memo.title || '제목 없음'}</div>
                            <div className="memo-preview">
                                {typeof memo.content === 'string'
                                    ? memo.content.slice(0, 40).replace(/\n/g, ' ')
                                    : '내용 없음'}
                                ...
                            </div>
                            <div className="memo-date">{new Date(memo.id).toLocaleDateString()}</div>
                        </div>
                        <button className="delete-button" onClick={() => onDelete(memo.id)}>🗑</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MemoListPanel;
