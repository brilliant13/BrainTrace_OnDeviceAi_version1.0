// src/components/panels/FileView.jsx
import React, { useState, useEffect } from 'react'
import './styles/Common.css'
import './styles/SourcePanel.css'
import './styles/Scrollbar.css'
import './styles/FileView.css'

import FolderView from './FolderView'
import FileIcon from './FileIcon'
import { TiUpload } from 'react-icons/ti'

import { processText } from '../../api/graphApi'; // graphApi.js에서 processText API 가져오기
import { fetchGraphData } from '../../api/graphApi'; // 그래프 데이터 API 불러오기


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
  fileMap = {},
  setFileMap = () => { },
  refreshTrigger,
  onGraphRefresh, // GraphView 새로고침 함수 추가
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

      // 2) 브레인 기준 전체 파일 조회
      const [pdfs, txts, voices] = await Promise.all([
        getPdfsByBrain(brainId),
        getTextfilesByBrain(brainId),
        getVoicesByBrain(brainId),
      ])

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

    // 1) 내부 파일 이동
    const moved = e.dataTransfer.getData('application/json')
    if (moved) {
      const { id, filetype } = JSON.parse(moved)
      await moveItem({ id, filetype }, null)
      return
    }

    // 2) 메모 드래그 (application/json-memo)
    const memoData = e.dataTransfer.getData('application/json-memo')
    if (memoData) {
      const { name, content } = JSON.parse(memoData)
      // 텍스트 파일로 생성
      await createTextFile({
        folder_id: null,
        brain_id: brainId,
        type: 'txt',
        txt_title: name,
        txt_path: name,
        content,        // 만약 API가 content 필드를 지원하면
      })
      // 텍스트를 지식 그래프로 처리
      await processMemoTextAsGraph(content, name, brainId);
      // 그래프 새로고침 트리거
      if (onGraphRefresh) {
        onGraphRefresh();
      }

      await refresh()
      return
    }

    // 3) OS 파일 드롭
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
          <p className="empty-sub">이 영역에 파일을 <strong>드래그해서 추가</strong>해보세요!</p>
        </div>
      )}

    </div>
  )
}
