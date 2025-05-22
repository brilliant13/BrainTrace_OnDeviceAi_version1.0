import React, { useState, useEffect } from 'react';
import './styles/ChatSidebar.css';
import { GoPencil } from 'react-icons/go';
import { RiDeleteBinLine } from 'react-icons/ri';
import { HiOutlineBars4 } from "react-icons/hi2";

function ChatSidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewSession,
    onRenameSession,
    onDeleteSession,
    newlyCreatedSessionId,
    setNewlyCreatedSessionId
}) {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isEditingId, setIsEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');

    const toggleMenu = (sessionId) => {
        setOpenMenuId(openMenuId === sessionId ? null : sessionId);
    };

    const handleNewSession = () => {
        const firstMessageText = '';
        const newSession = onNewSession(firstMessageText); // ← 수정
        setNewlyCreatedSessionId(newSession.id);
        setTimeout(() => {
            onSelectSession(newSession.id);
            setNewlyCreatedSessionId(null);
        }, 1500);
    };


    const handleEditStart = (session) => {
        setIsEditingId(session.id);
        setEditingTitle(session.title);
        setOpenMenuId(null);
    };

    const handleEditFinish = () => {
        if (editingTitle.trim()) {
            onRenameSession(isEditingId, editingTitle.trim());
        }
        setIsEditingId(null);
        setEditingTitle('');
    };

    return (
        <div className="panel-container">
            <div className="panel-header">
                <span className="header-title">Chat</span>
            </div>

            <div className="sidebar-header">
                <h2>채팅 목록</h2>
                <button className="new-chat-button" onClick={handleNewSession}>
                    + 새 대화
                </button>
            </div>

            <ul className="session-list">
                {sessions.map(session => (
                    <li
                        key={session.id}
                        className={`session-item 
              ${session.id === currentSessionId ? 'active' : ''} 
              ${session.id === newlyCreatedSessionId ? 'blinking' : ''}`}
                        onClick={() => onSelectSession(session.id)}
                    >
                        {isEditingId === session.id ? (
                            <input
                                className="session-edit-input"
                                value={editingTitle}
                                autoFocus
                                onChange={e => setEditingTitle(e.target.value)}
                                onBlur={handleEditFinish}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleEditFinish();
                                }}
                            />
                        ) : (
                            <span className="session-title">{session.title || '무제'}</span>
                        )}

                        <div className="session-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                            <button className="menu-button" onClick={() => toggleMenu(session.id)}>⋯</button>
                            {openMenuId === session.id && (
                                <div className="dropdown-menu">
                                    <div className="popup-item" onClick={() => handleEditStart(session)}>
                                        <GoPencil size={15} style={{ marginRight: 6 }} />
                                        채팅 이름 바꾸기
                                    </div>
                                    <div className="popup-item" onClick={() => onDeleteSession(session.id)}>
                                        <RiDeleteBinLine size={15} style={{ marginRight: 6 }} />
                                        채팅 삭제
                                    </div>
                                </div>

                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ChatSidebar;
