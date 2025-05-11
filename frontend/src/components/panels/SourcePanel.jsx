// src/components/layout/SourcePanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  listBrainFolders,
  createFolder,
  createMemo
} from '../../../../backend/services/backend';
import FileView from '../panels/FileView';
import PDFViewer from '../panels/PDFViewer';
import SourceUploadModal from '../panels/SourceUploadModal';
import SourceQuotaBar from '../panels/SourceQuotaBar';
import toggleIcon from '../../assets/icons/toggle-view.png';
import addFolderIcon from '../../assets/icons/add-folder.png';
import newFileIcon from '../../assets/icons/new-file.png';
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/PanelToggle.css';
import './styles/Scrollbar.css';

// apiFolders가 undefined여도 빈 배열로 취급
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

  // 패널 너비 관찰
  useEffect(() => {
    if (!panelRef.current) return;
    const ro = new ResizeObserver(() => {
      setPanelWidth(panelRef.current.offsetWidth);
    });
    ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, []);

  // 서버에서 폴더/메모 트리 불러오기
  const refresh = async () => {
    if (!activeProject) return;
    try {
      const api = await listBrainFolders(activeProject);
      // 배열이 아닐 경우 빈 배열로
      const arr = Array.isArray(api) ? api : [];
      setFolderTree(normalizeApiTree(arr));
    } catch (e) {
      console.error('폴더/메모 로드 실패', e);
      setFolderTree([]);  // 에러 시에도 빈 배열 유지
    }
  };

  // 마운트 & activeProject 변경 시
  useEffect(() => {
    // activeProject가 바뀔 때마다 폴더/메모 트리를 다시 로드
    refresh();
    // cleanup 함수 없음
  }, [activeProject]);

  // 새 폴더 생성
  const handleAddFolder = async e => {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await createFolder(name, activeProject);
      setNewFolderName('');
      setShowAddFolderInput(false);
      await refresh();
    } catch {
      alert('폴더 생성 실패');
    }
  };

  // PDF 닫기
  const closePDF = () => {
    setOpenedPDF(null);
    setIsPDFOpen(false);
    onBackFromPDF?.();
  };

  return (
    <div
      ref={panelRef}
      className={`panel-container modern-panel ${collapsed ? 'collapsed' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* 헤더 */}
      <div className="panel-header" style={{ justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && <span className="header-title">Source</span>}
        <img
          src={toggleIcon}
          alt="Toggle"
          style={{ width: 23, height: 23, cursor: 'pointer' }}
          onClick={() => setCollapsed(c => !c)}
        />
      </div>

      {!collapsed && (
        <>
          {/* 액션 버튼 */}
          {!openedPDF && (
            <div className="action-buttons">
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
            </div>
          )}

          {/* 폴더 생성 입력폼 */}
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
                <button type="button" className="secondary" onClick={() => setShowAddFolderInput(false)}>취소</button>
              </div>
            </form>
          )}

          {/* 메인 콘텐츠 */}
          <div className="panel-content" style={{ flexGrow: 1, overflow: 'auto' }}>
            {openedPDF
              ? (
                <div className="pdf-viewer-wrapper" style={{ height: '100%' }}>
                  <button className="pdf-back-button" onClick={closePDF}>← 뒤로가기</button>
                  <PDFViewer file={openedPDF} containerWidth={panelWidth} />
                </div>
              )
              : (
                <FileView
                  brainId={activeProject}
                  files={folderTree}
                  setFiles={setFolderTree}
                  onOpenPDF={file => {
                    setOpenedPDF(file);
                    setIsPDFOpen(true);
                  }}
                  fileMap={fileMap}
                  setFileMap={setFileMap}
                />
              )
            }
          </div>
        </>
      )}

      {/* 업로드 모달 */}
      <SourceUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={async uploadedFiles => {
          try {
            const folderId = folderTree[0]?.folder_id ?? null;
            await Promise.all(uploadedFiles.map(f =>
              createMemo({
                memo_title: f.name,
                memo_text: '',
                folder_id: folderId,
                is_source: false,
                brain_id: activeProject
              })
            ));
            await refresh();
            const mapFrag = Object.fromEntries(uploadedFiles.map(f => [f.name, f]));
            setFileMap(prev => ({ ...prev, ...mapFrag }));
          } catch {
            alert('파일 업로드 실패');
          }
        }}
      />

      {!collapsed && <SourceQuotaBar current={10} max={50} />}
    </div>
  );
}
