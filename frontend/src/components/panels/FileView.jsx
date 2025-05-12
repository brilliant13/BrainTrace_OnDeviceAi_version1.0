// src/components/panels/FileView.jsx
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
          <p>파일이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
