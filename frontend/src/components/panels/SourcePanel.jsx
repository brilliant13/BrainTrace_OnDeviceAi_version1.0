// src/components/panels/SourcePanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/PanelToggle.css';
import './styles/Scrollbar.css';
import projectData from '../../data/projectData';
import FileView from './FileView';
import SourceUploadModal from './SourceUploadModal'; // ✅ 모달 컴포넌트 import

import toggleIcon from '../../assets/icons/toggle-view.png';
import addFolderIcon from '../../assets/icons/add-folder.png';
import newFileIcon from '../../assets/icons/new-file.png';

function SourcePanel({ activeProject, collapsed, setCollapsed }) {
  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState(project.files || []);

  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [showAddFileInput, setShowAddFileInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");

  const [panelWidth, setPanelWidth] = useState(0);
  const panelRef = useRef(null);

  const isIconMode = panelWidth > 0 && panelWidth < 193;

  useEffect(() => {
    if (panelRef.current && !collapsed) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setPanelWidth(entry.contentRect.width);
        }
      });
      resizeObserver.observe(panelRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [collapsed]);

  const handleAddFolder = (e) => {
    e.preventDefault();

    const newFolder = {
      name: newFolderName,
      type: 'folder',
      children: []
    };

    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles, newFolder];

      // projectData의 해당 프로젝트에도 동기화
      const projectIndex = projectData.findIndex(p => p.id === activeProject);
      if (projectIndex !== -1) {
        projectData[projectIndex].files = updatedFiles;
      }

      return updatedFiles;
    });

    setShowAddFolderInput(false);
    setNewFolderName("");
  };


  const handleAddFile = (e) => {
    e.preventDefault();

    const newFile = {
      name: newFileName,
      type: 'file'
    };

    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles, newFile];

      const projectIndex = projectData.findIndex(p => p.id === activeProject);
      if (projectIndex !== -1) {
        projectData[projectIndex].files = updatedFiles;
      }

      return updatedFiles;
    });

    setShowAddFileInput(false);
    setNewFileName("");
  };


  return (
    <div
      className={`panel-container modern-panel ${collapsed ? 'collapsed' : ''}`}
      ref={panelRef}
    >
      <div className="panel-header"
        style={{
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '10px 16px',
        }}>
        <span
          className="header-title"
          style={{
            display: collapsed ? 'none' : 'block',
            fontSize: '16px',
          }}
        >
          Source
        </span>

        <img
          src={toggleIcon}
          alt="Toggle View"
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          onClick={() => setCollapsed(prev => !prev)}
        />
      </div>

      {!collapsed && (
        <>
          <div className="action-buttons">
            <button
              className={`pill-button ${isIconMode ? 'icon-only' : ''}`}
              onClick={() => setShowAddFolderInput(true)}
            >
              {isIconMode ? (
                <img src={addFolderIcon} alt="폴더 추가" className="button-icon" />
              ) : (
                <>
                  <span className="plus-icon">＋</span> 폴더
                </>
              )}
            </button>

            <button
              className={`pill-button ${isIconMode ? 'icon-only' : ''}`}
              onClick={() => setShowUploadModal(true)}
            >
              {isIconMode ? (
                <img src={newFileIcon} alt="소스 추가" className="button-icon" />
              ) : (
                <>
                  <span className="plus-icon">＋</span> 소스
                </>
              )}
            </button>
          </div>



          {/* 폴더 추가 폼 */}
          {showAddFolderInput && (
            <form className="add-form fancy-form" onSubmit={handleAddFolder}>
              <input
                type="text"
                placeholder="새 폴더 이름"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
              <div className="form-buttons">
                <button type="submit" className="primary">추가</button>
                <button type="button" className="secondary" onClick={() => setShowAddFolderInput(false)}>취소</button>
              </div>
            </form>
          )}


          {/* 파일 추가 폼 */}
          {showAddFileInput && (
            <form className="add-form" onSubmit={handleAddFile}>
              <input
                type="text"
                placeholder="파일 이름"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                autoFocus
              />
              <button type="submit">추가</button>
              <button type="button" onClick={() => setShowAddFileInput(false)}>취소</button>
            </form>
          )}

          {/* 파일 트리 */}
          <div className="panel-content">
            <FileView files={files} setFiles={setFiles} />
          </div>
        </>
      )}

      {/* ✅ 업로드 모달 */}
      <SourceUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(uploadedFiles) => {
          const newFileEntries = uploadedFiles.map(file => ({
            name: file.name,
            type: 'file',
          }));
          setFiles(prev => [...prev, ...newFileEntries]);
        }}
      />
    </div>
  );
}

export default SourcePanel;
