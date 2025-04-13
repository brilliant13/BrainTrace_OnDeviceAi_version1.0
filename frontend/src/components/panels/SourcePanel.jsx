import React, { useState, useRef, useEffect } from 'react';
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/PanelToggle.css';
import './styles/Scrollbar.css';
import projectData from '../../data/projectData';
import FileView from './FileView';
import PDFViewer from './PDFViewer';
import SourceUploadModal from './SourceUploadModal';

import toggleIcon from '../../assets/icons/toggle-view.png';
import addFolderIcon from '../../assets/icons/add-folder.png';
import newFileIcon from '../../assets/icons/new-file.png';

function SourcePanel({ activeProject, collapsed, setCollapsed, setIsPDFOpen, onBackFromPDF }) {
  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState(project.files || []);
  const [openedPDF, setOpenedPDF] = useState(null);
  const [fileMap, setFileMap] = useState({});
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const panelRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(0);
  const isIconMode = panelWidth > 0 && panelWidth < 193;

  useEffect(() => {
    if (panelRef.current && !collapsed) {
      const observer = new ResizeObserver(([entry]) => {
        setPanelWidth(entry.contentRect.width);
      });
      observer.observe(panelRef.current);
      return () => observer.disconnect();
    }
  }, [collapsed]);

  const handleAddFolder = (e) => {
    e.preventDefault();
    const newFolder = { name: newFolderName, type: 'folder', children: [] };
    const updatedFiles = [...files, newFolder];
    setFiles(updatedFiles);
    project.files = updatedFiles;
    setShowAddFolderInput(false);
    setNewFolderName('');
  };

  return (
    <div
      className={`panel-container modern-panel ${collapsed ? 'collapsed' : ''}`}
      ref={panelRef}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div className="panel-header" style={{ justifyContent: collapsed ? 'center' : 'space-between' }}>
        <span className="header-title" style={{ display: collapsed ? 'none' : 'block' }}>Source</span>
        <img
          src={toggleIcon}
          alt="Toggle"
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          onClick={() => setCollapsed(prev => !prev)}
        />
      </div>

      {!collapsed && (
        <>
          {!openedPDF && (
            <>
              <div className="action-buttons">
                <button
                  className={`pill-button ${isIconMode ? 'icon-only' : ''}`}
                  onClick={() => setShowAddFolderInput(true)}
                >
                  {isIconMode
                    ? <img src={addFolderIcon} alt="폴더 추가" className="button-icon" />
                    : <><span className="plus-icon">＋</span> 폴더</>}
                </button>
                <button
                  className={`pill-button ${isIconMode ? 'icon-only' : ''}`}
                  onClick={() => setShowUploadModal(true)}
                >
                  {isIconMode
                    ? <img src={newFileIcon} alt="소스 추가" className="button-icon" />
                    : <><span className="plus-icon">＋</span> 소스</>}
                </button>
              </div>

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
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setShowAddFolderInput(false)}
                    >취소</button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="panel-content" style={{ flexGrow: 1, overflow: 'auto' }}>
            {openedPDF ? (
              <div className="pdf-viewer-wrapper" style={{ height: '100%' }}>
                <button onClick={() => {
                  setOpenedPDF(null);
                  setIsPDFOpen(false);
                  if (onBackFromPDF) onBackFromPDF(); // 패널 크기 초기화

                }} style={{ marginBottom: '8px' }}>
                  ← 뒤로가기
                </button>
                <PDFViewer file={openedPDF} containerWidth={panelWidth} />
              </div>
            ) : (
              <FileView
                files={files}
                setFiles={setFiles}
                onOpenPDF={(file) => {
                  setOpenedPDF(file);
                  setIsPDFOpen(true);
                }}
                fileMap={fileMap}
                setFileMap={setFileMap}
              />
            )}
          </div>
        </>
      )}


      <SourceUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(uploadedFiles) => {
          const newEntries = uploadedFiles.map(file => ({ name: file.name, type: 'file' }));
          const newMap = Object.fromEntries(uploadedFiles.map(file => [file.name, file]));
          setFileMap(prev => ({ ...prev, ...newMap }));
          setFiles(prev => [...prev, ...newEntries]);
        }}
      />
    </div>
  );
}

export default SourcePanel;
