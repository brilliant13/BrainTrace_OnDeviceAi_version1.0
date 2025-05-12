// src/components/panels/FileView.jsx
<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
import './styles/Common.css'
import './styles/SourcePanel.css'
import './styles/Scrollbar.css'
import './styles/FileView.css'

import FolderView from './FolderView'
import FileIcon from './FileIcon'
import { TiUpload } from 'react-icons/ti'

import {
  listBrainFolders,
  getPdfsByBrain,
  getTextfilesByBrain,
  getVoicesByBrain,
  createPdf,
  createTextFile,
  createVoice,
  movePdfToFolder,
  removePdfFromFolder,
  moveTextfileToFolder,
  removeTextFileFromFolder,
  moveVoiceToFolder,
  removeVoiceFromFolder,
} from '../../../../backend/services/backend'

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
=======
import React, { useState, useEffect } from 'react';
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/Scrollbar.css';
import './styles/FileView.css';
import FileIcon from './FileIcon'
import { TiUpload } from "react-icons/ti";
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e

export default function FileView({
  brainId,
  files = [],
  setFiles = () => { },
  onOpenPDF,
  fileMap = {},
  setFileMap = () => { },
  refreshTrigger
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isRootDrag, setIsRootDrag] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [rootFiles, setRootFiles] = useState([])

  useEffect(() => {
    refresh()
  }, [brainId, refreshTrigger])

  const refresh = async () => {
    if (!brainId) return
    try {
      // 1) 폴더 트리
      const api = await listBrainFolders(brainId)
      setFiles(normalizeApiTree(api))

      // 2) brainId 기준 전체 파일 가져오기 → folder_id null 만 루트로
      const [pdfs, txts, voices] = await Promise.all([
        getPdfsByBrain(brainId),
        getTextfilesByBrain(brainId),
        getVoicesByBrain(brainId),
      ])

      setRootFiles([
        ...pdfs
          .filter(p => p.folder_id == null)
          .map(p => ({ filetype: 'pdf', id: p.pdf_id, name: p.pdf_title })),
        ...txts
          .filter(t => t.folder_id == null)
          .map(t => ({ filetype: 'txt', id: t.txt_id, name: t.txt_title })),
        ...voices
          .filter(v => v.folder_id == null)
          .map(v => ({ filetype: 'voice', id: v.voice_id, name: v.voice_title })),
      ])

      setRootFiles(roots)
      setRefreshKey(k => k + 1)
    } catch (err) {
      console.error('전체 로드 실패', err)
    }
  }

  const createFileByType = async (f, folderId = null) => {
    const ext = f.name.split('.').pop().toLowerCase()
    const common = { folder_id: folderId, type: ext, brain_id: brainId }

    if (ext === 'pdf') {
      await createPdf({ ...common, pdf_title: f.name, pdf_path: f.name })
    } else if (ext === 'txt') {
      await createTextFile({ ...common, txt_title: f.name, txt_path: f.name })
    } else if (['mp3', 'wav', 'm4a'].includes(ext)) {
      await createVoice({ ...common, voice_title: f.name, voice_path: f.name })
    } else {
      await createTextFile({ ...common, txt_title: f.name, txt_path: f.name })
    }
  }

  const handleRootDrop = async e => {
    e.preventDefault()
    e.stopPropagation()
    setIsRootDrag(false)

    const moved = e.dataTransfer.getData('application/json')
    if (moved) {
      const { id, filetype } = JSON.parse(moved)
      await moveItem({ id, filetype }, null)
      return
    }

    const dropped = Array.from(e.dataTransfer.files)
    try {
      await Promise.all(dropped.map(f => createFileByType(f, null)))
      const frag = Object.fromEntries(dropped.map(f => [f.name, f]))
      setFileMap(prev => ({ ...prev, ...frag }))
      await refresh()
    } catch (err) {
      console.error('루트 파일 생성 실패', err)
    }
  }

  const handleDropToFolder = async (folderId, dropped) => {
    if (!Array.isArray(dropped)) return
    try {
      await Promise.all(dropped.map(f => createFileByType(f, folderId)))
      const frag = Object.fromEntries(dropped.map(f => [f.name, f]))
      setFileMap(prev => ({ ...prev, ...frag }))
      await refresh()
    } catch (err) {
      console.error('폴더 파일 생성 실패', err)
    }
  }

  const moveItem = async ({ id, filetype }, targetFolderId) => {
    const toRoot = targetFolderId == null
    try {
      if (filetype === 'pdf') {
        if (toRoot) await removePdfFromFolder(id)
        else await movePdfToFolder(targetFolderId, id)
      } else if (filetype === 'txt') {
        if (toRoot) await removeTextFileFromFolder(id)
        else await moveTextfileToFolder(targetFolderId, id)
      } else if (filetype === 'voice') {
        if (toRoot) await removeVoiceFromFolder(id)
        else await moveVoiceToFolder(targetFolderId, id)
      }
      await refresh()
    } catch (e) {
      console.error('파일 이동 오류', e)
    }
  }

  return (
    <div
      className={`file-explorer modern-explorer${isRootDrag ? ' root-drag-over' : ''}`}
      onDragEnter={e => {
        e.preventDefault()
        setIsRootDrag(true)
      }}
      onDragLeave={e => {
        e.preventDefault()
        setIsRootDrag(false)
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={handleRootDrop}
    >
<<<<<<< HEAD
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
          />
        ) : null
      )}

      {/* ── 루트 레벨 파일들 ── */}
      {rootFiles.map(f => (
        <div
          key={`${f.filetype}-${f.id}`}
          className={`file-item ${selectedFile === f.name ? 'selected' : ''}`}
          draggable
          onDragStart={e =>
            e.dataTransfer.setData(
              'application/json',
              JSON.stringify({ id: f.id, filetype: f.filetype })
=======
      {isDragOver && <div className="drop-overlay"><div className="drop-icon"><TiUpload /></div></div>}
      <div
        className={`file-item folder-item ${isDragOver ? 'drag-over' : ''}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={toggleFolder}
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', item.name)}
      >
        <span className="tree-toggle">{isOpen ? '▼' : '▶ '}</span>
        <span className="file-name folder-name">{item.name}</span>
      </div>

      {isOpen && (
        <div className="tree-children">
          {item.children?.map((child, index) =>
            child.type === 'folder' ? (
              <FolderView
                key={index}
                item={child}
                depth={depth + 1}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                onDropFileToFolder={onDropFileToFolder}
                onOpenPDF={onOpenPDF}
                fileMap={fileMap}
                moveItem={moveItem}
              />
            ) : (
              <div
                key={index}
                className={`file-item ${selectedFile === `${item.name}/${child.name}` ? 'selected' : ''}`}
                style={{ paddingLeft: `${(depth + 1) * 16}px` }}
                onClick={() => {
                  const path = `${item.name}/${child.name}`;
                  onSelectFile(path);
                  if (child.name.endsWith('.pdf') && fileMap?.[child.name]) {
                    onOpenPDF(fileMap[child.name]);
                  }
                }}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', child.name)}
              >
                <FileIcon fileName={child.name} />
                <span className="file-name">{child.name}</span>
              </div>
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
            )
          }
          onClick={() => {
            setSelectedFile(f.name)
            if (f.filetype === 'pdf' && fileMap[f.name]) {
              onOpenPDF(fileMap[f.name])
            }
          }}
        >
          <FileIcon fileName={f.name} />
          <span className="file-name">{f.name}</span>
        </div>
      ))}

      {/* 비어 있을 때 */}
      {files.length === 0 && rootFiles.length === 0 && (
        <div className="empty-state">
          <p>파일이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
<<<<<<< HEAD
=======

function FileView({ activeProject, files, setFiles, onOpenPDF, fileMap, setFileMap }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDraggingOverRoot, setIsDraggingOverRoot] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`brainTrace-files-${activeProject?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFiles(parsed);
      } catch (err) {
        console.error('파일 로딩 오류:', err);
        setFiles(activeProject?.files || []);
      }
    } else {
      setFiles(activeProject?.files || []);
    }
  }, [activeProject]);

  const moveItem = (name, targetFolder) => {
    let movedItem = null;
    const newFiles = [];

    files.forEach(item => {
      if (item.name === name) {
        movedItem = item;
      } else if (item.type === 'folder') {
        const filteredChildren = item.children?.filter(child => {
          if (child.name === name) {
            movedItem = child;
            return false;
          }
          return true;
        });
        item.children = filteredChildren;
      }
    });

    if (!movedItem) return;

    const updated = files.map(item => {
      if (item.name === targetFolder) {
        return {
          ...item,
          children: [...(item.children || []), movedItem],
        };
      }
      return item;
    }).filter(item => item.name !== name);

    if (!targetFolder) {
      updated.push(movedItem);
    }

    setFiles(updated);
  };

  const handleDropFileToFolder = (folderName, droppedFiles) => {
    const updated = files.map((folder) => {
      if (folder.name === folderName) {
        return {
          ...folder,
          children: [
            ...(folder.children || []),
            ...droppedFiles.map((file) => ({ name: file.name, type: 'file' })),
          ],
        };
      }
      return folder;
    });
    const newMap = {};
    droppedFiles.forEach(file => {
      newMap[file.name] = file;
    });
    setFileMap(prev => ({ ...prev, ...newMap }));
    setFiles(updated);
    localStorage.setItem(`brainTrace-files-${activeProject?.id}`, JSON.stringify(updated));
  };

  const handleRootDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverRoot(false);

    const draggedName = e.dataTransfer.getData('text/plain');
    if (draggedName) {
      moveItem(draggedName, null);
      return;
    }

    // ✅ 메모가 드롭된 경우 처리
    const memoJson = e.dataTransfer.getData('application/json');
    if (memoJson) {
      try {
        const memo = JSON.parse(memoJson);
        if (memo?.type === 'memo') {
          const file = new File([memo.content], memo.name, { type: 'text/plain' });
          const newEntry = { name: memo.name, type: 'file' };
          setFileMap(prev => ({ ...prev, [memo.name]: file }));
          setFiles(prev => {
            const updated = [...prev, newEntry];
            localStorage.setItem(`brainTrace-files-${activeProject?.id}`, JSON.stringify(updated));
            return updated;
          });
          return;
        }
      } catch (err) {
        console.error('루트로 드롭된 메모 처리 중 오류:', err);
      }
    }
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newEntries = droppedFiles.map(file => ({ name: file.name, type: 'file' }));
    const newMap = {};
    droppedFiles.forEach(file => {
      newMap[file.name] = file;
    });
    setFileMap(prev => ({ ...prev, ...newMap }));
    setFiles(prev => {
      const updated = [...prev, ...newEntries];
      localStorage.setItem(`brainTrace-files-${activeProject?.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div
      className={`file-explorer modern-explorer ${isDraggingOverRoot ? 'root-drag-over' : ''}`}
      onDragEnter={(e) => { e.preventDefault(); setIsDraggingOverRoot(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDraggingOverRoot(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleRootDrop}
    >
      {isDraggingOverRoot && <div className="drop-overlay"><div className="drop-icon"><TiUpload /></div></div>}
      {files.length > 0 ? (
        files.map((item, index) =>
          item.type === 'folder' ? (
            <FolderView
              key={index}
              item={item}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
              onDropFileToFolder={handleDropFileToFolder}
              onOpenPDF={onOpenPDF}
              fileMap={fileMap}
              moveItem={moveItem}
            />
          ) : (
            <div
              key={index}
              className={`file-item ${selectedFile === item.name ? 'selected' : ''}`}
              style={{ paddingLeft: `8px` }}
              onClick={() => {
                setSelectedFile(item.name);
                if (item.name.endsWith('.pdf') && fileMap?.[item.name]) {
                  onOpenPDF(fileMap[item.name]);
                }
              }}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', item.name)}
            >
              <FileIcon fileName={item.name} />
              <span className="file-name">{item.name}</span>
            </div>
          )
        )
      ) : (
        <div className="empty-state"><p>파일이 없습니다.</p></div>
      )}
    </div>
  );
}

export default FileView;
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
