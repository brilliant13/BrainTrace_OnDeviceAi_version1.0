// src/components/panels/ChatPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import './styles/Common.css';
import './styles/ChatPanel.css';
import './styles/Scrollbar.css';
import { requestAnswer } from '../../tmpAPI';
import projectData from '../../data/projectData';

function ChatPanel({ activeProject }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const { title } = project.chat || { title: '' };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await requestAnswer(inputText, '1');
      const botMessage = { text: response.answer || '', isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting LLM response:', error);
      const errorMessage = { text: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.', isUser: false };
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };
  // This determines whether to show the centered input or bottom input
  const hasChatStarted = messages.length > 0;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <span className="header-title" style={{ fontSize: '16px' }}>
          Chat
        </span>
      </div>

      <div className="panel-content chat-content">
        <div className="chat-header">
          <div className="message-title">{title}</div>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-wrapper ${message.isUser ? 'user-message' : 'bot-message'}`}
            >
              <div className="user-presence">
                <div className="user-avatar">{message.isUser ? '👤' : '🤖'}</div>
              </div>
              <div className="message">
                <div className="message-body">
                  {message.text.split('\n').map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-controls">
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                resize: 'none',
                minHeight: '40px',
                backgroundColor: '#ffffff',
                color: '#1a202c',
                fontSize: '14px',
                lineHeight: '1.5',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            />
            <button
              className="control-button submit-button"
              onClick={handleSubmit}
              style={{ flexShrink: 0 }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
