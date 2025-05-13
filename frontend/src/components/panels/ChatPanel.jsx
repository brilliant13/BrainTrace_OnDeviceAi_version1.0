// ChatPanel.jsx – Claude-style 채팅(아바타 제거, 복사 버튼 포함)
import React, { useState, useRef, useEffect } from 'react';
import './styles/Common.css';
import './styles/ChatPanel.css';
import './styles/Scrollbar.css';
import { requestAnswer } from '../../tmpAPI';
import projectData from '../../data/projectData';
import copyIcon from '../../assets/icons/copy.png';   // 경로는 jsx 파일 → icons 폴더까지 상대경로

function ChatPanel({ activeProject }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const { title } = project.chat || { title: '' };

  /* ===== 공통 유틸 ===== */
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    // ① 사용자 메시지
    const userMessage = { text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // ② LLM 호출
      const { answer = '' } = await requestAnswer(inputText, '1');
      const botMessage = { text: answer, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: '죄송합니다. 응답 생성 중 오류가 발생했어요.', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
  };

  const copyToClipboard = async text => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: 토스트 등 복사 성공 알림
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /* ====== 뷰 ====== */
  const hasChatStarted = messages.length > 0;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <span className="header-title" style={{ fontSize: 16 }}>Chat</span>
      </div>

      {hasChatStarted ? (
        /* ───── 채팅 진행 중 ───── */
        <div className="panel-content chat-content">
          <div className="chat-header"><div className="message-title">{title}</div></div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message-wrapper ${m.isUser ? 'user-message' : 'bot-message'}`}>
                <div className="message">
                  <div className="message-body">{m.text}</div>

                  {/* 복사 버튼 – 말풍선 내부 */}
                  <div className="message-actions">
                    <button className="copy-button" title="복사" onClick={() => copyToClipboard(m.text)}>
                      <img src={copyIcon} alt="복사" className="copy-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* 로딩 인디케이터 */}
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

          {/* 입력창 */}
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
        /* ───── 빈 채팅 첫 화면 ───── */
        <div className="panel-content empty-chat-content">
          <div className="chat-header"><div className="message-title">{title}</div></div>

          <div className="centered-input-container">
            <div className="hero-section">
              <h1 className="hero-title">당신의 Second Brain을 추적하세요</h1>
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
    </div>
  );
}

export default ChatPanel;
