import React, { useState, useEffect, useRef } from 'react';
import './styles/ChatPanel.css';
import './styles/Scrollbar.css';
import { requestAnswer } from '../../api/tmpAPI';
//import projectData from '../../data/projectData';
import copyIcon from '../../assets/icons/copy.png';
import graphIcon from '../../assets/icons/graph-off.png';
import { TbPencil } from "react-icons/tb";
import { MdOutlineFormatListBulleted } from "react-icons/md";
import { FaProjectDiagram } from 'react-icons/fa'; // 아이콘 추가
import { HiOutlineBars4 } from "react-icons/hi2";

import { getReferencedNodes } from '../../../../backend/services/backend';

function ChatPanel({
  activeProject,
  onReferencedNodesUpdate,
  sessions,
  setSessions,
  currentSessionId,
  setCurrentSessionId,
  showChatPanel,
  setShowChatPanel,
  allNodeNames = []
}) {

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const titleInputRef = useRef(null);

  const messagesEndRef = useRef(null);

  //const project = projectData.find(p => p.id === activeProject) || projectData[0];
  //const { title } = project.chat || { title: '' };
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  // 🔁 상태값 추가
  const [hoveredChatId, setHoveredChatId] = useState(null); // 현재 hover 중인 메시지의 chatId


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [sessions, currentSessionId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isEditingTitle &&
        titleInputRef.current &&
        !titleInputRef.current.contains(e.target)
      ) {
        handleTitleSave(); // 외부 클릭 시 저장
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingTitle, editingTitle]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      const input = titleInputRef.current;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length); // 커서 끝으로
    }
  }, [isEditingTitle]);

  const createNewSession = (firstMessageText) => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: firstMessageText ? firstMessageText.slice(0, 20) : '새 대화',
      messages: firstMessageText ? [{ text: firstMessageText, isUser: true }] : [],
    };
    const updated = [...sessions, newSession];
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newId);
    localStorage.setItem(`sessions-${activeProject}`, JSON.stringify(updated));
    return newSession;
  };

  const getCurrentMessages = () => {
    const session = sessions.find(s => s.id === currentSessionId);
    return session ? session.messages : [];
  };

  const updateSessionMessages = (messages) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === currentSessionId ? { ...s, messages } : s
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { text: inputText, isUser: true };

    let newSession = null;
    if (!currentSessionId) {
      newSession = createNewSession(inputText);
    }

    const sessionId = newSession?.id || currentSessionId;
    setCurrentSessionId(sessionId);

    const targetSession = sessions.find(s => s.id === sessionId);
    const newMessages = [...(targetSession?.messages || []), userMessage];
    updateSessionMessages(newMessages);
    setInputText('');

    try {
      const response = await requestAnswer(inputText, activeProject.toString());
      const { answer = '', referenced_nodes = [] } = response;

      if (referenced_nodes && onReferencedNodesUpdate) {
        onReferencedNodesUpdate(referenced_nodes);
      }

      const botMessage = {
        text: answer,
        isUser: false,
        referencedNodes: referenced_nodes,
        chatId: response.chat_id  // FastAPI 응답에서 chat_id를 반드시 포함시켜야 함
      };
      console.log("📦 botMessage:", botMessage);  // ✅ 디버깅
      updateSessionMessages([...newMessages, botMessage]);
    } catch (err) {
      console.error(err);
      updateSessionMessages([...newMessages, { text: '죄송합니다. 응답 생성 중 오류가 발생했어요.', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const handleTitleEdit = () => {
    const currentTitle = sessions.find(s => s.id === currentSessionId)?.title || '';
    setEditingTitle(currentTitle);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (editingTitle.trim()) {
      setSessions(prev =>
        prev.map(s =>
          s.id === currentSessionId ? { ...s, title: editingTitle.trim() } : s
        )
      );
    }
    setIsEditingTitle(false);
  };

  const handleDeleteSession = (sessionId) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem(`sessions-${activeProject}`, JSON.stringify(updated));

    // 선택 중인 세션이 삭제되면 첫 번째 세션으로 이동
    if (sessionId === currentSessionId && updated.length > 0) {
      setCurrentSessionId(updated[0].id);
    } else if (updated.length === 0) {
      setCurrentSessionId(null);
    }
  };



  const messages = getCurrentMessages();
  const hasChatStarted = messages.some(msg => msg.text.trim() !== '');

  return (
    <div className="panel-container">
      <div className="panel-header">
        <span className="header-title">Chat</span>
        <button onClick={() => setShowChatPanel(false)} className="back-button">
          <HiOutlineBars4 />
        </button>
      </div>


      {hasChatStarted ? (
        <div className="panel-content chat-content">
          <div
            className="chat-title-container"
          >
            {isEditingTitle ? (
              <input

                ref={titleInputRef} // 추가
                className="chat-title-input"
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTitleSave();
                  }
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false); // ← 편집 취소
                  }
                }}
              />
            ) : (
              <div
                className="chat-title-display"
                onMouseEnter={() => setIsEditingTitle(false)} // 숨김 상태 초기화
              >
                <span className="header-title" style={{ fontSize: '20px', fontWeight: '600' }}>
                  {sessions.find(s => s.id === currentSessionId)?.title || 'Untitled'}
                </span>
                <button className="edit-icon-button" onClick={handleTitleEdit} title="수정">
                  <TbPencil color='black' />
                </button>
                {/* 👇 최근 세션 리스트 추가 */}
                <div className="inline-recent-session-bar">
                  {[...sessions]
                    .filter(s => s.id !== currentSessionId)
                    .sort((a, b) => Number(b.id) - Number(a.id))
                    .slice(0, 3)
                    .map(session => (
                      <span
                        key={session.id}
                        className="inline-recent-session-item"
                        onClick={() => setCurrentSessionId(session.id)}
                        title={session.title}
                      >
                        {/* 왼쪽 작은 바 */}
                        <span className="session-bar" />
                        {session.title.length > 10 ? session.title.slice(0, 10) + '...' : session.title}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => {
              if (!m.text.trim()) return null;

              return (
                <div
                  key={i}
                  className={`message-wrapper ${m.isUser ? 'user-message' : 'bot-message'}`}
                  onMouseEnter={async () => {
                    setHoveredMessageIndex(i);
                    if (!m.isUser && m.chatId) {

                      console.log("🟡 Hover한 메시지 chatId:", m.chatId); // ✅ 디버깅 출력
                      setHoveredChatId(m.chatId);  // ✅ 현재 hover된 메시지의 chatId 저장
                    }
                  }}
                  onMouseLeave={() => setHoveredMessageIndex(null)} >

                  <div className="message">
                    {/* 그래프 아이콘: bot 메시지이면서 참고된 노드가 있을 경우만 */}

                    <div className="message-body">
                      {m.text.split(' ').map((word, i) =>
                        allNodeNames.includes(word) ? (
                          <span
                            key={i}
                            className="referenced-node"
                            onClick={() => onReferencedNodesUpdate([word])}
                          >
                            {word}{' '}
                          </span>
                        ) : (
                          <span key={i}>{word} </span>
                        )
                      )}
                    </div>

                    <div className="message-actions">
                      <button className="copy-button" title="복사" onClick={() => copyToClipboard(m.text)}>
                        <img src={copyIcon} alt="복사" className="copy-icon" />
                      </button>

                      {!m.isUser && hoveredMessageIndex === i && (
                        <button
                          className="graph-button"
                          title="그래프 보기"
                          onClick={async () => {
                            if (!hoveredChatId) return;
                            try {
                              console.log("🟢 그래프 아이콘 클릭됨 - chatId:", hoveredChatId);
                              const res = await getReferencedNodes(hoveredChatId);
                              console.log("🧠 참고된 노드 리스트:", res.referenced_nodes);
                              if (res.referenced_nodes && res.referenced_nodes.length > 0) {
                                onReferencedNodesUpdate(res.referenced_nodes);
                              } else {
                                console.log("❗참고된 노드가 없습니다.");
                              }
                            } catch (err) {
                              console.error("❌ 참고 노드 불러오기 실패:", err);
                            }
                          }}
                        >
                          <img src={graphIcon} alt="그래프" className="graph-icon" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="message-wrapper bot-message">
                <div className="message">
                  <div className="thinking-indicator">
                    <span>생각하는 중</span>
                    <div className="thinking-dots">
                      <div className="thinking-dot" />
                      <div className="thinking-dot" />
                      <div className="thinking-dot" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-controls" onSubmit={handleSubmit}>
            <div className="input-with-button">
              <textarea
                className="chat-input"
                placeholder="무엇이든 물어보세요"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="submit-circle-button"
                aria-label="메시지 전송"
                disabled={!inputText.trim() || isLoading}
              >
                <span className="send-icon">➤</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="panel-content empty-chat-content">
          <div
            className="chat-title-container"
          >
            {isEditingTitle ? (
              <input
                ref={titleInputRef} // 추가
                className="chat-title-input"
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTitleSave();
                  }
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false); // ← 편집 취소
                  }
                }}
              />
            ) : (
              <div
                className="chat-title-display"
                onMouseEnter={() => setIsEditingTitle(false)} // 숨김 상태 초기화
              >
                <span className="header-title" style={{ fontSize: '20px', fontWeight: '600' }}>
                  {sessions.find(s => s.id === currentSessionId)?.title || 'Untitled'}
                </span>
                <button className="edit-icon-button" onClick={handleTitleEdit} title="수정">
                  <TbPencil size={18} color="#333333" />

                </button>
                <div className="inline-recent-session-bar">
                  {[...sessions]
                    .filter(s => s.id !== currentSessionId)
                    .sort((a, b) => Number(b.id) - Number(a.id))
                    .slice(0, 3)
                    .map(session => (
                      <span
                        key={session.id}
                        className="inline-recent-session-item"
                        onClick={() => setCurrentSessionId(session.id)}
                        title={session.title}
                      >
                        <span className="session-bar" />
                        {session.title.length > 10 ? session.title.slice(0, 10) + '...' : session.title}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="centered-input-container">
            <div className="hero-section">
              <h1 className="hero-title">당신의 세컨드 브레인을 추적해보세요.</h1>
            </div>
            <form className="input-wrapper" onSubmit={handleSubmit}>
              <div className="input-with-button rounded">
                <textarea
                  className="chat-input"
                  placeholder="무엇이든 물어보세요"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button type="submit" className="submit-circle-button" aria-label="메시지 전송">
                  <span className="send-icon">➤</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ⬇️ 안내 문구 추가 */}
      <p className="chat-disclaimer">
        BrainTrace는 학습된 정보 기반으로 응답하며, 실제와 다를 수 있습니다.
      </p>

    </div>
  );
}

export default ChatPanel;
