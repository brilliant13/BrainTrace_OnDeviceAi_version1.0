// src/components/panels/MemoEditor.jsx
import React from 'react';

function MemoEditor({ content }) {
  const renderContent = () => {
    if (!content) return null;
    const parts = content.split('\n\n');
    return parts.map((part, index) => {
      if (part.startsWith('# ')) return <h3 key={index}>{part.substring(2)}</h3>;
      else if (part.startsWith('## ')) return <h4 key={index}>{part.substring(3)}</h4>;
      else if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.substring(part.indexOf('\n') + 1, part.lastIndexOf('```'));
        return <div key={index} className="code-block"><pre>{code}</pre></div>;
      }
      return <p key={index}>{part}</p>;
    });
  };

  return (
    <div className="memo-area">
      <div className="memo-toolbar">
        <div className="format-tools">
          <span className="format-item">Normal text</span>
          <span className="format-separator">|</span>
          <button className="toolbar-button">B</button>
          <button className="toolbar-button">I</button>
          <button className="toolbar-button">U</button>
          <button className="toolbar-button">S</button>
          <button className="toolbar-button">🔗</button>
          <button className="toolbar-button">📌</button>
        </div>
      </div>
      <div className="memo-content">{renderContent()}</div>
      <div className="memo-footer">
        <span className="word-count">{content ? content.split(/\s+/).length : 0} words</span>
        <button className="save-button">Save</button>
      </div>
    </div>
  );
}

export default MemoEditor;
