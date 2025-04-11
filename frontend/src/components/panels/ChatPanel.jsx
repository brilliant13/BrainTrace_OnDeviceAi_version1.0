// src/components/panels/ChatPanel.jsx
import React from 'react';
// import './Panels.css';
import './styles/Common.css';
import './styles/ChatPanel.css';
import './styles/Scrollbar.css';

import projectData from '../../data/projectData';

function ChatPanel({ activeProject }) {
  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const { title, content } = project.chat || { title: '', content: '' };

  return (
    <div className="panel-container">
      <div className="panel-header">
        {/* <h2 style={{  cdisplay: collapsed ? 'none' : 'block' }}>Source</h2> */}
        <span
          className="header-title"
          style={{
            fontSize: '16px',

          }}
        >
          Chat
        </span>
      </div>


      {/* <h2>Chat</h2> */}

      <div className="panel-content chat-content">
        <div className="chat-header">
          <div className="message-title">{title}</div>
        </div>
        <div className="chat-messages">
          <div className="user-presence">
            <div className="user-avatar">👤</div>
          </div>
          <div className="message">
            <div className="message-body">
              {content.split('\n\n').map((paragraph, index) => {
                // 숫자로 시작하는 문단은 목록 항목으로 처리
                if (/^\d+\./.test(paragraph)) {
                  return (
                    <div key={index} style={{ marginBottom: '10px' }}>
                      {paragraph}
                    </div>
                  );
                }
                return <p key={index}>{paragraph}</p>;
              })}
            </div>
          </div>
        </div>

        <div className="chat-input-container">
          <div className="chat-controls">
            <button className="control-button">Regenerate response</button>
            <button className="control-button submit-button">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;