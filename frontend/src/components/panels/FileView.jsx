// src/components/panels/FileView.jsx
import React, { useState, useEffect } from 'react'
import { pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url';
import './styles/Common.css'
import './styles/SourcePanel.css'
import './styles/Scrollbar.css'
import './styles/FileView.css'
import FolderView from './FolderView'
import FileIcon from './FileIcon'
import { TiUpload } from 'react-icons/ti'
import { GoPencil } from 'react-icons/go';
import { RiDeleteBinLine } from 'react-icons/ri';
import { processText, deleteDB } from '../../api/graphApi';
import { fetchGraphData } from '../../api/graphApi';
import ConfirmDialog from '../ConfirmDialog'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { AiOutlineNodeIndex } from "react-icons/ai";
import {
  listBrainFolders,
  getPdfsByBrain,
  getTextfilesByBrain,
  getVoicesByBrain,
  uploadPdfs,
  createPdf,
  createTextFile,
  createVoice,
  movePdfToFolder,
  removePdfFromFolder,
  moveTextfileToFolder,
  removeTextFileFromFolder,
  moveVoiceToFolder,
  removeVoiceFromFolder,
  deletePdf,
  deleteTextFile,
  deleteVoice,
  updatePdf,
  updateTextFile,
  updateVoice,
  createTextToGraph,
  uploadTextfiles,
  getNodesBySourceId
} from '../../../../backend/services/backend'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

// ✅ 메모 텍스트를 그래프 지식으로 변환하는 함수
async function processMemoTextAsGraph(content, sourceId, brainId) {
  try {
    const response = await processText(content, String(sourceId), String(brainId));
    console.log("✅ 그래프 생성 완료:", response);
  } catch (error) {
    console.error("❌ 그래프 생성 실패:", error);
  }
}

// API 에서 넘어온 폴더/파일들을 트리 형태로 변환
function normalizeApiTree(apiFolders = []) {
  return apiFolders.map(folder => ({
    type: 'folder',
    folder_id: folder.folder_id,
    name: folder.folder_name,
    children: [
      ...(folder.pdfs || []).map(pdf => ({
        type: 'file',
        filetype: 'pdf',
        id: pdf.pdf_id,
        name: pdf.pdf_title,
      })),
      ...(folder.textfiles || []).map(txt => ({
        type: 'file',
        filetype: 'txt',
        id: txt.txt_id,
        name: txt.txt_title,
      })),
      ...(folder.voices || []).map(voice => ({
        type: 'file',
        filetype: 'voice',
        id: voice.voice_id,
        name: voice.voice_title,
      })),
    ],
  }))
}

export default function FileView({
  brainId,
  files = [],
  setFiles = () => { },
  onOpenPDF,
  onOpenTXT,
  fileMap = {},
  setFileMap = () => { },
  refreshTrigger,
  onGraphRefresh,
  onFocusNodeNamesUpdate
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isRootDrag, setIsRootDrag] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [rootFiles, setRootFiles] = useState([])
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [fileToDelete, setFileToDelete] = useState(null);
  // 드롭 즉시 표시할 업로드 큐
  const [uploadQueue, setUploadQueue] = useState([])

  useEffect(() => {
    refresh()
  }, [brainId, refreshTrigger])

  useEffect(() => {
    const closeMenu = () => setMenuOpenId(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const refresh = async () => {
    if (!brainId) return
    try {
      // 1) 폴더 트리
      const api = await listBrainFolders(brainId)
      setFiles(normalizeApiTree(api))

      // 2) 브레인 기준 전체 파일 조회
      const [pdfs, txts, voices] = await Promise.all([
        getPdfsByBrain(brainId),
        getTextfilesByBrain(brainId),
        getVoicesByBrain(brainId),
      ])

      // 2.1) fileMap 갱신
      setFileMap(prev => {
        const m = { ...prev };
        pdfs.forEach(p => { m[p.pdf_id] = p; });
        txts.forEach(t => { m[t.txt_id] = t; });
        voices.forEach(v => { m[v.voice_id] = v; });
        return m;
      });

      // 3) folder_id === null 인 것만 골라 루트 파일로
      const roots = [
        ...pdfs
          .filter(p => p.folder_id == null)
          .map(p => ({ filetype: 'pdf', id: p.pdf_id, name: p.pdf_title })),
        ...txts
          .filter(t => t.folder_id == null)
          .map(t => ({ filetype: 'txt', id: t.txt_id, name: t.txt_title })),
        ...voices
          .filter(v => v.folder_id == null)
          .map(v => ({ filetype: 'voice', id: v.voice_id, name: v.voice_title })),
      ]
      setRootFiles(roots)

      setRefreshKey(k => k + 1)
    } catch (err) {
      console.error('전체 로드 실패', err)
    }
  }

  const createFileByType = async (f, folderId = null) => {
    const ext = f.name.split('.').pop().toLowerCase()
    const common = { folder_id: folderId, type: ext, brain_id: brainId }

    // --- PDF ---
    if (ext === 'pdf') {
      // 1-1) 바이너리 + 메타 업로드
      const [meta] = await uploadPdfs([f], folderId, brainId);

      // 1-2) 텍스트 추출
      const arrayBuffer = await f.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let content = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        content += textContent.items.map(item => item.str).join(' ') + '\n\n';
      }

      // 1-3) 그래프 생성
      await createTextToGraph({
        text: content,
        brain_id: String(brainId),
        source_id: String(meta.pdf_id),
      });

      return { id: meta.pdf_id, filetype: 'pdf', meta };
    }
    // --- TXT ---
    else if (ext === 'txt') {
      // 1) 업로드 (pdf와 동일한 방식)
      const [meta] = await uploadTextfiles([f], folderId, brainId);

      // 2) 파일 내용 추출 후 그래프 생성
      const content = await f.text();

      await createTextToGraph({
        text: content,
        brain_id: String(brainId),
        source_id: String(meta.txt_id),
      });

      return { id: meta.txt_id, filetype: 'txt', meta };

    }
    // --- Voice ---
    else if (['mp3', 'wav', 'm4a'].includes(ext)) {
      const res = await createVoice({
        ...common,
        voice_title: f.name,
        voice_path: f.name,
      });
      return { id: res.voice_id, filetype: 'voice', meta: res };
    }
    else {
      await createTextFile({ ...common, txt_title: f.name, txt_path: f.name })
    }

    await refresh();
    if (onGraphRefresh) onGraphRefresh();
  }

  const handleDelete = async f => {
    try {
      console.log('삭제할 파일 정보:', {
        brainId,
        fileId: f.id,
        fileType: f.filetype,
        fileName: f.name
      });

      // 1. 벡터 DB에서 먼저 삭제
      try {
        await deleteDB(brainId, f.id);
        console.log('벡터 DB,그래프 DB 삭제 성공');
      } catch (dbError) {
        console.error('벡터 DB,그래프 DB 삭제 실패:', dbError);
        // 벡터 DB 삭제 실패는 무시하고 계속 진행
      }

      // 2. 파일 시스템에서 삭제
      let deleted = false;
      if (f.filetype === 'pdf') {
        deleted = await deletePdf(f.id);
      } else if (f.filetype === 'txt') {
        deleted = await deleteTextFile(f.id);
      } else if (f.filetype === 'voice') {
        deleted = await deleteVoice(f.id);
      }

      if (!deleted) {
        throw new Error(`${f.filetype} 파일 삭제 실패`);
      }

      // 그래프 새로고침 트리거
      if (onGraphRefresh) {
        onGraphRefresh();
      }


      await refresh()

    } catch (e) {
      console.error('삭제 실패:', e);
      alert('삭제 실패');
    }
  };

  const handleNameChange = async (f) => {
    const newName = tempName.trim();
    if (!newName || newName === f.name) {
      setEditingId(null);
      return;
    }

    try {
      if (f.filetype === 'pdf') {
        await updatePdf(f.id, { pdf_title: newName, brain_id: brainId });
      } else if (f.filetype === 'txt') {
        await updateTextFile(f.id, { txt_title: newName, brain_id: brainId });
      } else if (f.filetype === 'voice') {
        await updateVoice(f.id, { voice_title: newName, brain_id: brainId });
      }
      await refresh();
    } catch (e) {
      alert('이름 변경 실패');
    } finally {
      setEditingId(null);
    }
  };

  const openDeleteConfirm = (f) => {
    setFileToDelete(f); // 삭제할 파일 지정
    setMenuOpenId(null); // 점점점 메뉴 닫기
  };

  const handleRootDrop = async e => {
    e.preventDefault()
    e.stopPropagation()
    setIsRootDrag(false)

    // 1) 내부 파일 이동
    const moved = e.dataTransfer.getData('application/json')
    if (moved) {
      const { id, filetype } = JSON.parse(moved)
      await moveItem({ id, filetype }, null)
      return
    }

    // 2) 메모 드래그 (application/json-memo)
    const memoData = e.dataTransfer.getData('application/json-memo')
    console.log('메모 데이터:', memoData);
    if (memoData) {
      const { name, content } = JSON.parse(memoData)
      const key = `${name}-${Date.now()}`
      // 1) 로딩 큐에 추가
      setUploadQueue(q => [...q, { key, name, filetype: 'txt', status: 'processing' }])

      try {
        // 2) Blob으로 변환 후 File 객체 생성 (업로드 통일 처리용)
        const blob = new Blob([content], { type: 'text/plain' })
        const file = new File([blob], name, { type: 'text/plain' })

        // 3) uploadTextfiles 함수 호출 (pdf처럼 업로드 통일)
        const [meta] = await uploadTextfiles([file], null, brainId)

        // 4) 그래프 생성
        await processMemoTextAsGraph(content, meta.txt_id, brainId)

        // 5) 완료 처리
        setUploadQueue(q => q.filter(item => item.key !== key))
        if (onGraphRefresh) onGraphRefresh()
        await refresh()
      } catch (err) {
        console.error('메모 파일 생성 실패', err)
        // 에러 시에도 큐에서 제거
        setUploadQueue(q => q.filter(item => item.key !== key))
      }
      return
    }

    // 3) OS 파일 드롭
    const dropped = Array.from(e.dataTransfer.files);
    if (!dropped.length) return;

    // ── 즉시 보이도록 큐에 넣고, 비동기로 업로드/그래프 생성 ──
    dropped.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      const key = `${file.name}-${Date.now()}`;

      // 1) UI에 processing 상태로 바로 추가
      setUploadQueue(q => [...q, { key, name: file.name, filetype: ext, status: 'processing' }]);

      // 2) 실제 업로드 & 그래프 생성
      createFileByType(file, null)
        .then(r => {
          // 1) 가짜(큐) 항목 제거
          setUploadQueue(q => q.filter(item => item.key !== key));

          // 2) fileMap 갱신 & 뷰 리프레시
          setFileMap(prev => ({ ...prev, [r.id]: r.meta }));
          // 그래프 뷰 갱신
          if (onGraphRefresh) onGraphRefresh();
          // 최종 목록 동기화
          refresh();
        })
        .catch(err => {
          console.error('파일 업로드 실패', err);
          // 에러 시에도 큐에서 제거
          setUploadQueue(q => q.filter(item => item.key !== key));
        });
    });
  }

  const handleDropToFolder = async (folderId, dropped) => {
    if (!Array.isArray(dropped)) return;
    try {
      // 1) createFileByType 으로 처리 → { id, filetype, meta } 받기
      const results = await Promise.all(
        dropped.map(f => createFileByType(f, folderId))
      );
      // 2) fileMap 에 id → meta 로 저장
      setFileMap(prev => {
        const m = { ...prev };
        results.forEach(r => {
          m[r.id] = r.meta;
        });
        return m;
      });
      // 3) 트리/리스트 갱신
      await refresh();
      if (onGraphRefresh) onGraphRefresh();
    } catch (err) {
      console.error('폴더 파일 생성 실패', err);

    }
  }

  const moveItem = async ({ id, filetype }, targetFolderId) => {
    const toRoot = targetFolderId == null
    try {
      if (filetype === 'pdf') {
        if (toRoot) {
          await removePdfFromFolder(brainId, id)
        } else {
          await movePdfToFolder(brainId, targetFolderId, id)
        }
      } else if (filetype === 'txt') {
        if (toRoot) {
          await removeTextFileFromFolder(brainId, id)
        } else {
          await moveTextfileToFolder(brainId, targetFolderId, id)
        }
      } else if (filetype === 'voice') {
        if (toRoot) {
          await removeVoiceFromFolder(brainId, id)
        } else {
          await moveVoiceToFolder(brainId, targetFolderId, id)
        }
      }
      await refresh()
    } catch (e) {
      console.error('파일 이동 오류', e)
    }
  }

  return (
    <div
      className={`file-explorer modern-explorer${isRootDrag ? ' root-drag-over' : ''}`}
      onDragEnter={e => { e.preventDefault(); setIsRootDrag(true) }}
      onDragLeave={e => { e.preventDefault(); setIsRootDrag(false) }}
      onDragOver={e => e.preventDefault()}
      onDrop={handleRootDrop}
    >
      {isRootDrag && (
        <div className="drop-overlay">
          <div className="drop-icon">
            <TiUpload />
          </div>
        </div>
      )}

      {/* ── 폴더 트리 ── */}
      {files.map(node =>
        node.type === 'folder' ? (
          <FolderView
            key={node.folder_id}
            item={node}
            refreshKey={refreshKey}
            depth={0}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            onDropFileToFolder={handleDropToFolder}
            onOpenPDF={onOpenPDF}
            fileMap={fileMap}
            moveItem={moveItem}
            refreshParent={refresh}
            brainId={brainId}
            onGraphRefresh={onGraphRefresh}
          />
        ) : null
      )}

      {/* ── 업로드 진행중/완료 표시 ── */}
      {uploadQueue.map(item => (
        <div key={item.key} className="file-item uploading">
          <FileIcon fileName={item.name} />
          <span className="file-name">{item.name}</span>
          {item.status === 'processing' && (
            <span className="upload-status" style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <span style={{ marginLeft: 4 }}>그래프 변환 중</span>
              <AiOutlineLoading3Quarters className="loading-spinner" />

            </span>
          )}
        </div>
      ))}

      {/* ── 루트 레벨 파일들 ── */}
      {rootFiles.map(f => {
        return (
          <div
            key={`${f.filetype}-${f.id}`}
            className={`file-item ${selectedFile === f.id ? 'selected' : ''}`}
            draggable
            onDragStart={e =>
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({ id: f.id, filetype: f.filetype })
              )
            }
            onClick={() => {
              setSelectedFile(f.id);
              if (f.filetype === 'pdf' && fileMap[f.id]) {
                onOpenPDF(fileMap[f.id]);
              } else if (f.filetype === 'txt' && fileMap[f.id]) {
                onOpenTXT(fileMap[f.id]);
              }
            }}
          >
            <FileIcon fileName={f.name} />
            {editingId === f.id ? (
              <input
                autoFocus
                className="rename-input"
                defaultValue={f.name}
                onChange={e => setTempName(e.target.value)}
                onBlur={() => handleNameChange(f)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleNameChange(f);
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <span className="file-name">{f.name}</span>
            )}

            <div
              className="file-menu-button"
              onClick={e => {
                e.stopPropagation();
                setMenuOpenId(prev => (prev === f.id ? null : f.id));
              }}
            >
              ⋮
              {menuOpenId === f.id && (
                <div className="file-menu-popup" onClick={e => e.stopPropagation()}>
                  <div
                    className="popup-item"
                    onClick={() => {
                      setEditingId(f.id);
                      setTempName(f.name);
                      setMenuOpenId(null);
                    }}
                  >
                    <GoPencil size={14} style={{ marginRight: 4 }} /> 소스 이름 바꾸기
                  </div>
                  <div className="popup-item" onClick={() => openDeleteConfirm(f)}>
                    <RiDeleteBinLine size={14} style={{ marginRight: 4 }} /> 소스 삭제
                  </div>
                  <div
                    className="popup-item"
                    onClick={async () => {
                      try {
                        const names = await getNodesBySourceId(f.id, brainId);
                        if (onFocusNodeNamesUpdate) {
                          onFocusNodeNamesUpdate(names); // ✅ 이름 수정
                        }
                      } catch (err) {
                        console.error('노드 조회 실패:', err);
                        alert('해당 소스에서 생성된 노드를 가져오지 못했습니다.');
                      }
                      setMenuOpenId(null);
                    }}
                  >
                    <AiOutlineNodeIndex size={18} style={{ marginRight: 4 }} />
                    노드 보기
                  </div>

                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* 비어 있을 때 */}
      {files.length === 0 && rootFiles.length === 0 && (
        <div className="empty-state">
          <p className="empty-sub">이 영역에 파일을 <strong>드래그해서 추가</strong>해보세요!</p>
        </div>
      )}
      {fileToDelete && (
        <ConfirmDialog
          message={`"${fileToDelete.name}" 소스를 삭제하시겠습니까?`}
          onCancel={() => setFileToDelete(null)}
          onOk={async () => {
            await handleDelete(fileToDelete); // 실제 삭제
            setFileToDelete(null);
          }}
        />
      )}
    </div>
  )
}
