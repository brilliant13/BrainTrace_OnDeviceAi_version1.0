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
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/PanelToggle.css';
import './styles/Scrollbar.css';

import { TbCylinderPlus } from "react-icons/tb";
import { TbFolderPlus } from "react-icons/tb";

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
  onBackFromPDF,
  onGraphRefresh // 그래프 새로고침 함수 추가
}) {
  const panelRef = useRef();
  const [panelWidth, setPanelWidth] = useState(0);
  const [folderTree, setFolderTree] = useState([]);
  const [fileMap, setFileMap] = useState({});
  const [openedPDF, setOpenedPDF] = useState(null);
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 업로드 트리거 (바뀔 때마다 FileView가 다시 로드)
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    if (!panelRef.current) return;
    const ro = new ResizeObserver(() => {
      setPanelWidth(panelRef.current.offsetWidth);
    });
    ro.observe(panelRef.current);
    return () => ro.disconnect();
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
      return createPdf({ pdf_title: f.name, pdf_path: f.pdf_path, folder_id: null, type: ext });
    }
    if (ext === 'txt') {
      return createTextFile({ txt_title: f.name, txt_path: f.txt_path, folder_id: null, type: ext });
    }
    if (['mp3', 'wav', 'm4a'].includes(ext)) {
      return createVoice({ voice_title: f.name, voice_path: f.voice_path, folder_id: null, type: ext });
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
          style={{ width: '23px', height: '23px', cursor: 'pointer' }}
          onClick={() => setCollapsed(prev => !prev)}
        />
      </div>

      {!collapsed && (
        <>
          <div className="source-actions-fixed">
            {!openedPDF && (
              <div className="action-buttons">
                <button
                  className={`pill-button ${panelWidth < 250 ? 'icon-only' : ''}`}
                  onClick={() => setShowAddFolderInput(true)}
                >
                  {panelWidth < 250
                    ? <TbFolderPlus size={25} />
                    : <>＋ 폴더</>}
                </button>
                <button
                  className={`pill-button ${panelWidth < 220 ? 'icon-only' : ''}`}
                  onClick={() => setShowUploadModal(true)}
                >
                  {panelWidth < 250
                    ? <TbCylinderPlus size={25} />
                    : <>＋ 소스</>}
                </button>
              </div>
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

                <button className="pdf-back-button" onClick={closePDF}>← 뒤로가기</button>
                <PDFViewer file={openedPDF} containerWidth={panelWidth} />
              </div >
            ) : (
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
                refreshTrigger={uploadKey}
                onGraphRefresh={onGraphRefresh} // 그래프 refesh 용도로 FileView에 전달
              />
            )
            }
          </div >
        </>
      )}

      <SourceUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={async uploadedFiles => {
          try {
            await Promise.all(uploadedFiles.map(f => createAtRoot(f)));
            await refresh();
            setUploadKey(k => k + 1);
            const frag = Object.fromEntries(uploadedFiles.map(f => [f.name, f]));
            setFileMap(prev => ({ ...prev, ...frag }));
            setShowUploadModal(false);
          } catch (e) {
            console.error(e);
            alert('파일 업로드 실패');
          }
        }}
        brainId={activeProject}
      />
      {!collapsed && <SourceQuotaBar current={10} max={50} />}
    </div >
  );
}
