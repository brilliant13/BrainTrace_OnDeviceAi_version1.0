// src/components/panels/FileView.jsx
import React, { useState, useEffect } from 'react';
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/Scrollbar.css';
import './styles/FileView.css';

import FolderView from './FolderView';
import FileIcon from './FileIcon';
import { TiUpload } from 'react-icons/ti';

import {
  listBrainFolders,
  createMemo,
  createPdf,
  createTextFile,
  createVoice,
  moveMemoToFolder,
  removeMemoFromFolder,
  movePdfToFolder,
  removePdfFromFolder,
  moveTextfileToFolder,
  removeTextFileFromFolder,
  moveVoiceToFolder,
  removeVoiceFromFolder,
  deleteMemo
} from '../../../../backend/services/backend';

function normalizeApiTree(apiFolders = []) {
  return apiFolders.map(folder => ({
    type: 'folder',
    folder_id: folder.folder_id,
    name: folder.folder_name,
    children: [
      ...(folder.memos || []).map(memo => ({
        type: 'file',
        filetype: 'memo',
        memo_id: memo.memo_id,
        name: memo.memo_title
      })),
      ...(folder.pdfs || []).map(pdf => ({
        type: 'file',
        filetype: 'pdf',
        pdf_id: pdf.pdf_id,
        name: pdf.pdf_title
      })),
      ...(folder.textfiles || []).map(txt => ({
        type: 'file',
        filetype: 'txt',
        txt_id: txt.txt_id,
        name: txt.txt_title
      })),
      ...(folder.voices || []).map(voice => ({
        type: 'file',
        filetype: 'voice',
        voice_id: voice.voice_id,
        name: voice.voice_title
      }))
    ]
  }));
}

export default function FileView({
  brainId,
  files = [],
  setFiles = () => { },
  onOpenPDF,
  fileMap = {},
  setFileMap = () => { }
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRootDrag, setIsRootDrag] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    refresh();
  }, [brainId]);

  const refresh = async () => {
    if (!brainId) return;
    try {
      const api = await listBrainFolders(brainId);
      setFiles(normalizeApiTree(api));
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('폴더/메모 로드 실패', err);
    }
  };

  // ── 공통 분기 로직 ──
  const createFileByType = async (f, folderId = null) => {
    const ext = f.name.split('.').pop().toLowerCase();
    const type = ext;
    const common = { folder_id: folderId, type };

    if (ext === 'pdf') {
      await createPdf({ ...common, pdf_title: f.name, pdf_path: f.name });
    } else if (ext === 'txt') {
      await createTextFile({ ...common, txt_title: f.name, txt_path: f.name });
    } else if (['mp3', 'wav', 'm4a'].includes(ext)) {
      await createVoice({ ...common, voice_title: f.name, voice_path: f.name });
    } else {
      await createMemo({
        memo_title: f.name,
        memo_text: '',
        folder_id: folderId,
        is_source: false,
        brain_id: brainId,
        type
      });
    }
  };

  // ── 루트에 드롭 ──
  const handleRootDrop = async e => {
    e.preventDefault();
    e.stopPropagation();
    setIsRootDrag(false);

    const draggedName = e.dataTransfer.getData('text/plain');
    if (draggedName) {
      let moved;
      const prune = arr =>
        arr.filter(n => {
          if (n.type === 'file' && n.name === draggedName) {
            moved = n;
            return false;
          }
          if (n.type === 'folder') {
            n.children = prune(n.children || []);
          }
          return true;
        });
      prune(files);
      if (moved) {
        try {
          await removeMemoFromFolder(moved.memo_id);
          await refresh();
        } catch (err) {
          console.error('루트 이동 실패', err);
        }
      }
      return;
    }

    const dropped = Array.from(e.dataTransfer.files);
    try {
      await Promise.all(dropped.map(f => createFileByType(f)));
      const mapFrag = Object.fromEntries(dropped.map(f => [f.name, f]));
      setFileMap(prev => ({ ...prev, ...mapFrag }));
      await refresh();
    } catch (err) {
      console.error('루트 파일 생성 실패', err);
    }
  };

  // ── 폴더에 드롭 ──
  const handleDropToFolder = async (folderId, droppedFiles) => {
    if (!Array.isArray(droppedFiles)) {
      console.error('handleDropToFolder: droppedFiles is not an array', droppedFiles);
      return;
    }
    try {
      await Promise.all(droppedFiles.map(f => createFileByType(f, folderId)));
      const mapFrag = Object.fromEntries(droppedFiles.map(f => [f.name, f]));
      setFileMap(prev => ({ ...prev, ...mapFrag }));
      await refresh();
    } catch (err) {
      console.error('폴더 파일 생성 실패', err);
    }
  };

  // ── 내부 이동 (폴더 ↔ 폴더/루트) ──
  const moveItem = async ({ id, filetype }, targetFolderId) => {
    const toRoot = targetFolderId == null;
    try {
      switch (filetype) {
        case 'memo':
          if (toRoot) await removeMemoFromFolder(id);
          else await moveMemoToFolder(targetFolderId, id);
          break;
        case 'pdf':
          if (toRoot) await removePdfFromFolder(id);
          else await movePdfToFolder(targetFolderId, id);
          break;
        case 'txt':
          if (toRoot) await removeTextFileFromFolder(id);
          else await moveTextfileToFolder(targetFolderId, id);
          break;
        case 'voice':
          if (toRoot) await removeVoiceFromFolder(id);
          else await moveVoiceToFolder(targetFolderId, id);
          break;
        default:
          console.warn('지원되지 않는 파일 타입', filetype);
      }
      await refresh();
    } catch (e) {
      console.error('파일 이동 오류', e);
    }
  };


  // ── 삭제 (memo만) ──
  const handleDelete = async memo_id => {
    try {
      await deleteMemo(memo_id);
      await refresh();
    } catch (err) {
      console.error('삭제 실패', err);
    }
  };

  return (
    <div
      className={`file-explorer modern-explorer${isRootDrag ? ' root-drag-over' : ''}`}
      onDragEnter={e => {
        e.preventDefault();
        setIsRootDrag(true);
      }}
      onDragLeave={e => {
        e.preventDefault();
        setIsRootDrag(false);
      }}
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

      {files.length > 0 ? (
        files.map((node, i) =>
          node.type === 'folder' ? (
            <FolderView
              key={i}
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
            />
          ) : (
            <div
              key={i}
              className={`file-item ${selectedFile === node.name ? 'selected' : ''}`}
            >
              <FileIcon fileName={node.name} />
              <span
                className="file-name"
                draggable
                onClick={() => {
                  setSelectedFile(node.name);
                  if (node.name.endsWith('.pdf') && fileMap[node.name]) {
                    onOpenPDF(fileMap[node.name]);
                  }
                }}
                onDragStart={e =>
                  e.dataTransfer.setData('text/plain', node.name)
                }
              >
                {node.name}
              </span>
              <button
                className="delete-btn"
                onClick={() => handleDelete(node.memo_id)}
              >
                🗑
              </button>
            </div>
          )
        )
      ) : (
        <div className="empty-state">
          <p>파일이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
