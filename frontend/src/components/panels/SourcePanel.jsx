// src/components/panels/SourcePanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/PanelToggle.css';
import './styles/Scrollbar.css';
import projectData from '../../data/projectData';
import FileView from './FileView';

import toggleIcon from '../../assets/icons/toggle-view.png';
import addFolderIcon from '../../assets/icons/add-folder.png';
import newFileIcon from '../../assets/icons/new-file.png';

function SourcePanel({ activeProject, collapsed, setCollapsed }) {
  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const files = project.files || [];

  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [showAddFileInput, setShowAddFileInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");

  // 패널 너비 상태 추가
  const [panelWidth, setPanelWidth] = useState(0);
  const panelRef = useRef(null);

  // 아이콘 모드인지 확인 (패널이 340px 보다 작을 때)
  const isIconMode = panelWidth > 0 && panelWidth < 193;

  // 패널 너비 감지
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
    // 실제 구현에서는 폴더 추가 로직
    setShowAddFolderInput(false);
    setNewFolderName("");
  };

  const handleAddFile = (e) => {
    e.preventDefault();
    // 실제 구현에서는 파일 추가 로직
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
          {/* 버튼 */}
          {/* <div className="action-buttons">
            <button className="add-button" onClick={() => setShowAddFolderInput(true)}>
              {isIconMode ? (
                <img src={addFolderIcon} alt="폴더 추가" className="button-icon" />
              ) : (
                <>
                  <span className="add-icon">+</span> 폴더 추가
                </>
              )}
            </button>
            <button className="add-button" onClick={() => setShowAddFileInput(true)}>
              {isIconMode ? (
                <img src={newFileIcon} alt="소스 추가" className="button-icon" />
              ) : (
                <>
                  <span className="add-icon">+</span> 소스 추가
                </>
              )}
            </button>
          </div> */}
          <div className="action-buttons">
            <button
              className={`add-button ${isIconMode ? 'icon-only' : ''}`}
              onClick={() => setShowAddFolderInput(true)}
            >
              {isIconMode ? (
                <img src={addFolderIcon} alt="폴더 추가" className="button-icon" />
              ) : (
                <>
                  <span className="add-icon">+</span> 폴더 추가
                </>
              )}
            </button>
            <button
              className={`add-button ${isIconMode ? 'icon-only' : ''}`}
              onClick={() => setShowAddFileInput(true)}
            >
              {isIconMode ? (
                <img src={newFileIcon} alt="소스 추가" className="button-icon" />
              ) : (
                <>
                  <span className="add-icon">+</span> 소스 추가
                </>
              )}
            </button>
          </div>

          {/* 폴더 추가 폼 */}
          {showAddFolderInput && (
            <form className="add-form" onSubmit={handleAddFolder}>
              <input
                type="text"
                placeholder="폴더 이름"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
              <button type="submit">추가</button>
              <button type="button" onClick={() => setShowAddFolderInput(false)}>취소</button>
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
            <FileView files={files} />
          </div>
        </>
      )}
    </div>
  );
}

export default SourcePanel;