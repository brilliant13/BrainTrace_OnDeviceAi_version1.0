import React, { useState, useEffect, useRef } from 'react';
import './styles/MemoEditor.css';
import { IoArrowBack } from "react-icons/io5";
import { RiArrowGoBackFill } from "react-icons/ri";
import { MdKeyboardBackspace } from "react-icons/md";
function MemoEditor({ memo, onSaveAndClose }) {
  const [title, setTitle] = useState(memo?.title || '');
  const [body, setBody] = useState(memo?.content || '');
  const titleInputRef = useRef(null);

  const handleBack = () => {
    const finalTitle = title.trim() === '' ? 'Untitled' : title;
    const updated = { ...memo, title: finalTitle, content: body };
    onSaveAndClose(updated);
  };

  useEffect(() => {
    setTitle(memo?.title || '');
    setBody(memo?.content || '');
  }, [memo]);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);


  return (
    <div className="notion-editor">
      <button className="back-button small-top-left" onClick={handleBack}>
        <MdKeyboardBackspace size={28} />
      </button>

      <input
        ref={titleInputRef}
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

    </div>
  );
}

export default MemoEditor;
