// src/components/panels/SourceUploadModal.jsx
import React, { useState, useRef } from 'react';
import './styles/SourceUploadModal.css';
import { IoCloudUploadOutline } from "react-icons/io5";
import { uploadPdfs } from '../../../../backend/services/backend'

function SourceUploadModal({ visible, onClose, onUpload, folderId = null, brainId = null }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  if (!visible) return null;
  console.log("brainId : ", brainId);
  // 실제 업로드 처리 함수: backend.js 의 uploadPdfs 사용
  const uploadFiles = async files => {
    try {
      // files: File[] → FormData 로 묶어 POST
      const uploaded = await uploadPdfs(files, folderId, brainId);
      // uploaded: PdfResponse[] 형태로 반환됨
      onUpload(uploaded);
      onClose();
    } catch (e) {
      console.error(e);
      alert('파일 업로드 실패');
    }
  };

  // 드래그해서 떨어뜨렸을 때
  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  // 파일 선택창에서 선택했을 때
  const handleSelect = e => {
    uploadFiles(Array.from(e.target.files));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="upload-modal"
        onClick={e => e.stopPropagation()}
      >
        <h2>소스 추가</h2>
        <p className="description">
          소스를 추가하면 중요한 정보에 따라 응답을 제공합니다.
        </p>

        {/* 숨겨진 파일 입력 */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleSelect}
        />

        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="upload-icon"><IoCloudUploadOutline /></div>
          <p>
            업로드할 <span className="highlight">파일을 선택</span>
            하거나 드래그 앤 드롭하세요.
          </p>
          <p className="file-types">
            지원 형식: PDF, TXT, Markdown, 오디오(mp3)
          </p>
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
