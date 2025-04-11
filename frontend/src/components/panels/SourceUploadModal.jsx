import React, { useState } from 'react';
import './styles/SourceUploadModal.css';

function SourceUploadModal({ visible, onClose, onUpload }) {
  const [dragOver, setDragOver] = useState(false);

  if (!visible) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setDragOver(false);
    onUpload(files);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="upload-modal"
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <h2>소스 추가</h2>
        <p className="description">소스를 추가하면 중요한 정보에 따라 응답을 제공합니다.</p>

        <div className={`drop-zone ${dragOver ? 'drag-over' : ''}`}>
          <div className="upload-icon">⬆️</div>
          <p>업로드할 <span className="highlight">파일을 선택</span>하거나 드래그 앤 드롭하세요.</p>
          <p className="file-types">지원 형식: PDF, TXT, Markdown, 오디오(mp3)</p>
        </div>

        <div className="source-options">
          <button className="source-button">Google Docs</button>
          <button className="source-button">Google Slides</button>
          <button className="source-button">웹사이트</button>
          <button className="source-button">YouTube</button>
          <button className="source-button">복사된 텍스트</button>
        </div>

        <div className="footer">
          <div className="limit-bar">
            <div className="filled" style={{ width: '10%' }} />
          </div>
          <span className="limit-label">3/50</span>
        </div>
      </div>
    </div>
  );
}

export default SourceUploadModal;
