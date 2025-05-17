// src/components/panels/SourceUploadModal.jsx
import React, { useState, useRef } from 'react';
import './styles/SourceUploadModal.css';
import { IoCloudUploadOutline } from "react-icons/io5";
import {
  uploadPdfs, createTextFile,
  createVoice,
  createTextToGraph
} from '../../../../backend/services/backend'
import { pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

function SourceUploadModal({ visible, onClose, onUpload, onGraphRefresh, folderId = null, brainId = null }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  if (!visible) return null;

  // FileView의 createFileByType 로직을 그대로 가져왔습니다
  const createFileByType = async (file, folderId) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const common = { folder_id: folderId, type: ext, brain_id: brainId };

    if (ext === 'pdf') {
      const [meta] = await uploadPdfs([file], folderId, brainId);
      // 텍스트 추출
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let content = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        content += textContent.items.map(item => item.str).join(' ') + '\n\n';
      }
      // 그래프 생성
      await createTextToGraph({
        text: content,
        brain_id: String(brainId),
        source_id: String(meta.pdf_id),
      });
      return { id: meta.pdf_id, filetype: 'pdf', meta };
    }
    else if (ext === 'txt') {
      const res = await createTextFile({
        ...common,
        txt_title: file.name,
        txt_path: file.name
      });
      const content = await file.text();
      await createTextToGraph({
        text: content,
        brain_id: String(brainId),
        source_id: String(res.txt_id),
      });
      return { id: res.txt_id, filetype: 'txt', meta: res };
    }
    else if (['mp3', 'wav', 'm4a'].includes(ext)) {
      const res = await createVoice({
        ...common,
        voice_title: file.name,
        voice_path: file.name
      });
      return { id: res.voice_id, filetype: 'voice', meta: res };
    }
    else {
      // 기타는 텍스트로...
      const res = await createTextFile({
        ...common,
        txt_title: file.name,
        txt_path: file.name
      });
      return { id: res.txt_id, filetype: 'txt', meta: res };
    }
  };

  const uploadFiles = async files => {
    try {
      // 1) 파일별 처리(createFileByType): upload → extract → graph
      const results = await Promise.all(
        files.map(f => createFileByType(f, folderId))
      );
      // 2) 부모에 '메타 목록'만 전달해서 UI 갱신
      onUpload(results.map(r => r.meta));
      // 3) 그래프 뷰도 갱신
      onGraphRefresh && onGraphRefresh();
      // 모달 닫기
      onClose();
    } catch (e) {
      console.error(e);
      alert('파일 업로드/처리 중 오류가 발생했습니다');
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
