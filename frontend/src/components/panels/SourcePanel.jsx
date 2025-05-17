import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  listBrainFolders,
  createFolder,
  createMemo,
  createPdf,
  createTextFile,
  createVoice,
  getPdfsByBrain,
  getTextfilesByBrain,
  getVoicesByBrain

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
  onGraphRefresh
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
  const [sourceCount, setSourceCount] = useState(0);
  const maxQuota = 50; // 예시로 최대 50개 제한

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

  // 소스(파일) 카운트 계산
  const refreshSourceCount = async () => {
    if (!activeProject) return;
    try {
      const [
        pdfRoot, pdfNested,
        txtRoot, txtNested,
        voiceRoot, voiceNested
      ] = await Promise.all([
        // PDF
        getPdfsByBrain(activeProject),        // folder_id IS NULL
        getPdfsByBrain(activeProject, 1),     // folder_id IS NOT NULL (1은 아무 숫자)
        // TXT
        getTextfilesByBrain(activeProject),   // folder_id IS NULL
        getTextfilesByBrain(activeProject, 1),// folder_id IS NOT NULL
        // Voice
        getVoicesByBrain(activeProject),      // folder_id IS NULL
        getVoicesByBrain(activeProject, 1)    // folder_id IS NOT NULL
      ]);

      const totalCount =
        pdfRoot.length + pdfNested.length +
        txtRoot.length + txtNested.length +
        voiceRoot.length + voiceNested.length;

      setSourceCount(totalCount);
    } catch (e) {
      console.error('소스 카운트 오류', e);
      setSourceCount(0);
    }
  };

  // 마운트 시와 uploadKey 변경 시 재계산
  useEffect(() => {
    refreshSourceCount();
  }, [activeProject, uploadKey]);

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
                <PDFViewer file={`http://localhost:8000/${openedPDF.pdf_path}`} containerWidth={panelWidth} />
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
                onGraphRefresh={() => {
                  onGraphRefresh?.();
                  // 소스 수 갱신
                  refreshSourceCount();
                }}
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
            // 서버에 저장된 PDF 메타데이터로 목록만 갱신
            await refresh();                    // getPdfsByBrain으로 새로고침
            setUploadKey(k => k + 1);

            // fileMap에 pdf_id → PdfResponse 매핑
            setFileMap(prev => {
              const m = { ...prev };
              uploadedFiles.forEach(pdf => {
                m[pdf.pdf_id] = pdf;
              });
              return m;
            });

            setShowUploadModal(false);
          } catch (e) {
            console.error(e);
            alert('파일 업로드 실패');
          }
        }}
        brainId={activeProject}
      />
      {!collapsed && <SourceQuotaBar current={sourceCount} max={50} />}
    </div >
  );
}
