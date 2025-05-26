import React, { useState, useEffect, useRef } from 'react';
import './styles/ChatSidebar.css';
import { GoPencil } from 'react-icons/go';
import { RiDeleteBinLine } from 'react-icons/ri';
import { PiChatsCircle } from "react-icons/pi";

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
    const [isSessionsLoaded, setIsSessionsLoaded] = useState(false);

    const menuRef = useRef(null);

    const formatDate = timestamp => {
        const date = new Date(Number(timestamp));
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const toggleMenu = (sessionId) => {
        setOpenMenuId(openMenuId === sessionId ? null : sessionId);
    };

    const handleNewSession = () => {
        const firstMessageText = '';
        const newSession = onNewSession(firstMessageText);
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isSessionsLoaded && sessions.length >= 0) {
            setIsSessionsLoaded(true);
        }

        // 세션이 0개이고, 로딩이 끝났을 때만 새 세션 자동 생성
        if (isSessionsLoaded && sessions.length === 0) {
            const firstMessageText = '';
            const newSession = onNewSession(firstMessageText);
            setNewlyCreatedSessionId(newSession.id);
            setTimeout(() => {
                onSelectSession(newSession.id);
                setNewlyCreatedSessionId(null);
            }, 0);
        }
    }, [sessions, isSessionsLoaded, onNewSession, onSelectSession, setNewlyCreatedSessionId]);

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
                {[...sessions]  // ← 원본 배열 복사
                    .sort((a, b) => Number(b.id) - Number(a.id))  // 가장 최신 순으로 정렬
                    .map(session => (
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
                                <div className="session-text-block">
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <PiChatsCircle size={17} color="#999" style={{ marginRight: 7 }} />
                                        <span className="session-title">{session.title || 'Untitled'}</span>
                                    </div>
                                    <span className="session-date">{formatDate(session.id)}</span>
                                </div>
                            )}

                            <div className="session-menu-wrapper" ref={menuRef} onClick={(e) => e.stopPropagation()}>
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
            {/* ⬇️ 안내 문구 추가 */}
            <p className="chat-disclaimer">
                BrainTrace는 학습된 정보 기반으로 응답하며, 실제와 다를 수 있습니다.
            </p>
        </div>
    );
}

export default ChatSidebar;
