<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import {
  listBrainFolders,
  createFolder,
  createMemo,
  createPdf,
  createTextFile,
  createVoice
} from '../../../../backend/services/backend';
import FileView from '../panels/FileView';
import PDFViewer from '../panels/PDFViewer';
import SourceUploadModal from '../panels/SourceUploadModal';
import SourceQuotaBar from '../panels/SourceQuotaBar';
import toggleIcon from '../../assets/icons/toggle-view.png';
import addFolderIcon from '../../assets/icons/add-folder.png';
import newFileIcon from '../../assets/icons/new-file.png';
import './styles/Common.css';
=======
import React, { useState, useRef, useEffect } from 'react';
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
import './styles/SourcePanel.css';
import './styles/PanelToggle.css';
import './styles/Scrollbar.css';

<<<<<<< HEAD
function normalizeApiTree(apiFolders = []) {
  return apiFolders.map(folder => ({
    type: 'folder',
    folder_id: folder.folder_id,
    name: folder.folder_name,
    children: (folder.memos || []).map(memo => ({
      type: 'file',
      memo_id: memo.memo_id,
      name: memo.memo_title
    }))
  }));
}
=======
import toggleIcon from '../../assets/icons/toggle-view.png';
import addFolderIcon from '../../assets/icons/add-folder.png';
import newFileIcon from '../../assets/icons/new-file.png';
import SourceQuotaBar from './SourceQuotaBar';
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e

export default function SourcePanel({
  activeProject,
  collapsed,
  setCollapsed,
  setIsPDFOpen,
  onBackFromPDF
}) {
  const panelRef = useRef();
  const [panelWidth, setPanelWidth] = useState(0);
  const [folderTree, setFolderTree] = useState([]);
  const [fileMap, setFileMap] = useState({});
  const [openedPDF, setOpenedPDF] = useState(null);
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

<<<<<<< HEAD
  // 업로드 트리거 (바뀔 때마다 FileView가 다시 로드)
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    if (!panelRef.current) return;
    const ro = new ResizeObserver(() => {
      setPanelWidth(panelRef.current.offsetWidth);
    });
    ro.observe(panelRef.current);
    return () => ro.disconnect();
=======
  const panelRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

  const [panelWidth, setPanelWidth] = useState(0);
  const isIconMode = panelWidth > 0 && panelWidth < 193;

  useEffect(() => {
    if (!panelRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      const width = panelRef.current.offsetWidth;
      setContainerWidth(width);
      setPanelWidth(width);
    });
    resizeObserver.observe(panelRef.current);
    return () => resizeObserver.disconnect();
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
  }, []);

  const refresh = async () => {
    if (!activeProject) return;
    try {
      const api = await listBrainFolders(activeProject);
      setFolderTree(normalizeApiTree(Array.isArray(api) ? api : []));
    } catch (e) {
      console.error('폴더/메모 로드 실패', e);
      setFolderTree([]);
    }
  };

  useEffect(() => {
    refresh();
  }, [activeProject]);

  const handleAddFolder = async e => {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await createFolder(name, activeProject);
      setNewFolderName('');
      setShowAddFolderInput(false);
      await refresh();
      setUploadKey(k => k + 1);
    } catch {
      alert('폴더 생성 실패');
    }
  };

  const closePDF = () => {
    setOpenedPDF(null);
    setIsPDFOpen(false);
    onBackFromPDF?.();
  };

  // 확장자별 루트 저장 헬퍼
  const createAtRoot = f => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      return createPdf({ pdf_title: f.name, pdf_path: f.name, folder_id: null, type: ext });
    }
    if (ext === 'txt') {
      return createTextFile({ txt_title: f.name, txt_path: f.name, folder_id: null, type: ext });
    }
    if (['mp3', 'wav', 'm4a'].includes(ext)) {
      return createVoice({ voice_title: f.name, voice_path: f.name, folder_id: null, type: ext });
    }
    return createMemo({
      memo_title: f.name,
      memo_text: '',
      folder_id: null,
      is_source: false,
      brain_id: activeProject,
      type: ext
    });
  };

  return (
    <div
      ref={panelRef}
      className={`panel-container modern-panel ${collapsed ? 'collapsed' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* 헤더 */}
      <div
        className="panel-header"
        style={{ justifyContent: collapsed ? 'center' : 'space-between' }}
      >
        {!collapsed && <span className="header-title">Source</span>}
        <img
          src={toggleIcon}
          alt="Toggle"
<<<<<<< HEAD
          style={{ width: 23, height: 23, cursor: 'pointer' }}
          onClick={() => setCollapsed(c => !c)}
=======
          style={{ width: '23px', height: '23px', cursor: 'pointer' }}
          onClick={() => setCollapsed(prev => !prev)}
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
        />
      </div>

      {!collapsed && (
        <>
          <div className="action-buttons">
            {!openedPDF && (
              <>
                <button
                  className={`pill-button ${panelWidth < 193 ? 'icon-only' : ''}`}
                  onClick={() => setShowAddFolderInput(true)}
                >
                  {panelWidth < 193
                    ? <img src={addFolderIcon} alt="폴더 추가" className="button-icon" />
                    : <>＋ 폴더</>}
                </button>
                <button
                  className={`pill-button ${panelWidth < 193 ? 'icon-only' : ''}`}
                  onClick={() => setShowUploadModal(true)}
                >
                  {panelWidth < 193
                    ? <img src={newFileIcon} alt="소스 추가" className="button-icon" />
                    : <>＋ 소스</>}
                </button>
              </>
            )}
          </div>

          {showAddFolderInput && (
            <form className="add-form fancy-form" onSubmit={handleAddFolder}>
              <input
                autoFocus
                placeholder="새 폴더 이름"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
              />
              <div className="form-buttons">
                <button type="submit" className="primary">추가</button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setShowAddFolderInput(false)}
                >
                  취소
                </button>
              </div>
            </form>
          )}

          <div className="panel-content" style={{ flexGrow: 1, overflow: 'auto' }}>
            {openedPDF ? (
              <div className="pdf-viewer-wrapper" style={{ height: '100%' }}>
<<<<<<< HEAD
                <button className="pdf-back-button" onClick={closePDF}>← 뒤로가기</button>
                <PDFViewer file={openedPDF} containerWidth={panelWidth} />
              </div>
            ) : (
              <FileView
                brainId={activeProject}
                files={folderTree}
                setFiles={setFolderTree}
                onOpenPDF={file => {
=======
                <button
                  onClick={() => {
                    setOpenedPDF(null);
                    setIsPDFOpen(false);
                    if (onBackFromPDF) onBackFromPDF();
                  }}
                  className="pdf-back-button"
                >
                  ← 뒤로가기
                </button>
                <div className="panel-container">
                  <PDFViewer file={openedPDF} containerWidth={containerWidth} />
                </div>
              </div>
            ) : (
              <FileView
                activeProject={project}
                files={files}
                setFiles={setFiles}
                onOpenPDF={(file) => {
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
                  setOpenedPDF(file);
                  setIsPDFOpen(true);
                }}
                fileMap={fileMap}
                setFileMap={setFileMap}
                refreshTrigger={uploadKey}
              />
            )}
          </div>
        </>
      )}

      <SourceUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={async uploadedFiles => {
          try {
            await Promise.all(uploadedFiles.map(f => createAtRoot(f)));
            await refresh();
            setUploadKey(k => k + 1);         // ← 업로드 후 키++
            const frag = Object.fromEntries(uploadedFiles.map(f => [f.name, f]));
            setFileMap(prev => ({ ...prev, ...frag }));
            setShowUploadModal(false);
          } catch (e) {
            console.error(e);
            alert('파일 업로드 실패');
          }
        }}
      />
<<<<<<< HEAD

=======
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
      {!collapsed && <SourceQuotaBar current={10} max={50} />}
    </div>
  );
}
