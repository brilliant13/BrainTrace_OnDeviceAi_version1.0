import React, { useState, useEffect } from 'react';
import './styles/MemoEditor.css';

function MemoEditor({ memo, onSaveAndClose }) {
  const [title, setTitle] = useState(memo?.title || '');
  const [body, setBody] = useState(memo?.content || '');

  useEffect(() => {
    setTitle(memo?.title || '');
    setBody(memo?.content || '');
  }, [memo]);

  const handleBack = () => {
    const finalTitle = title.trim() === '' ? 'Untitled' : title;
    const updated = { ...memo, title: finalTitle, content: body };
    onSaveAndClose(updated);
  };

  return (
    <div className="notion-editor">
      <button className="back-button small-top-left" onClick={handleBack}>
        ← 뒤로가기
      </button>

      <input
        className="notion-title"
        placeholder="Untitled"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="notion-textarea"
        placeholder="내용을 작성하세요..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className="editor-footer">
        <span className="word-count">
          {body.trim() ? body.trim().split(/\s+/).length : 0} words
        </span>
      </div>
    </div>
  );
}

export default MemoEditor;
