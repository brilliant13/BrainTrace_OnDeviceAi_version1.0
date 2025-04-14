// src/components/panels/FileView.jsx
import React, { useState, useEffect } from 'react';
import './styles/Common.css';
import './styles/SourcePanel.css';
import './styles/Scrollbar.css';
import './styles/FileView.css';

function FileIcon({ fileName }) {
  const getFileIcon = () => {
    if (fileName.endsWith('.pdf')) return '📕';
    if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.svg')) return '🖼️';
    if (fileName.endsWith('.md')) return '📝';
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return '📜';
    if (fileName.endsWith('.py')) return '🐍';
    if (fileName.endsWith('.json')) return '📋';
    if (fileName.endsWith('.css')) return '🎨';
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return '📄';
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return '📊';
    if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) return '📊';
    if (fileName.endsWith('.txt')) return '📝';
    if (fileName.endsWith('.fig')) return '🖌️';
    return '📄';
  };
  return <span className="file-icon">{getFileIcon()}</span>;
}

function FolderView({ item, depth = 0, selectedFile, onSelectFile, onDropFileToFolder, onOpenPDF, fileMap }) {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragEnterCount, setDragEnterCount] = useState(0);

  const toggleFolder = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragEnterCount((count) => count + 1);
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragEnterCount((count) => {
      const newCount = count - 1;
      if (newCount <= 0) {
        setIsDragOver(false);
        return 0;
      }
      return newCount;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragEnterCount(0);

    const memoData = e.dataTransfer.getData('application/json');
    if (memoData) {
      try {
        const memo = JSON.parse(memoData);
        const newFile = new File([memo.content], memo.name, { type: 'text/plain' });
        onDropFileToFolder?.(item.name, [newFile]);
        return;
      } catch (err) {
        console.error('드래그된 메모 파싱 오류:', err);
      }
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onDropFileToFolder?.(item.name, droppedFiles);
    }
  };

  return (
    <div
      className={`folder-container ${isDragOver ? 'folder-drag-over' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="drop-overlay">
          <div className="drop-icon">📥</div>
        </div>
      )}
      <div
        className={`file-item folder-item ${isDragOver ? 'drag-over' : ''}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={toggleFolder}
      >
        <span className="file-icon">{isOpen ? '📂' : '📁'}</span>
        <span className="file-name">{item.name}</span>
      </div>

      {isOpen && (
        <div className="folder-contents">
          {item.children &&
            item.children.map((child, index) =>
              child.type === 'folder' ? (
                <FolderView
                  key={index}
                  item={child}
                  depth={depth + 1}
                  selectedFile={selectedFile}
                  onSelectFile={onSelectFile}
                  onDropFileToFolder={onDropFileToFolder}
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
                >
                  <FileIcon fileName={child.name} />
                  <span className="file-name">{child.name}</span>
                </div>
              )
            )}
        </div>
      )}
    </div>
  );
}

function FileView({ activeProject, files, setFiles, onOpenPDF, fileMap, setFileMap }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDraggingOverRoot, setIsDraggingOverRoot] = useState(false);

  useEffect(() => {
    const newFiles = activeProject?.files || [];
    setFiles(newFiles);
  }, [activeProject, setFiles]);

  const handleDropFileToFolder = (folderName, droppedFiles) => {
    const updated = files.map((folder) => {
      if (folder.name === folderName) {
        return {
          ...folder,
          children: [
            ...(folder.children || []),
            ...droppedFiles.map((file) => ({
              name: file.name,
              type: 'file',
            })),
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
  };

  const handleClickFile = (file) => {
    setSelectedFile(file.name);
    if (!file.name.endsWith('.pdf')) return;
    if (!onOpenPDF || !fileMap?.[file.name]) return;
    onOpenPDF(fileMap[file.name]);
  };

  const handleRootDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverRoot(true);
  };

  const handleRootDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverRoot(false);
  };

  const handleRootDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverRoot(false);

    const memoJson = e.dataTransfer.getData('application/json');
    if (memoJson) {
      try {
        const memoData = JSON.parse(memoJson);
        if (memoData?.type === 'memo') {
          const { name, content } = memoData;
          const file = new File([content], name, { type: 'text/plain' });
          setFiles(prev => [...prev, { name, type: 'file' }]);
          setFileMap(prev => ({ ...prev, [name]: file }));
          return;
        }
      } catch (err) {
        console.error('메모 드롭 처리 중 오류:', err);
      }
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    const newTopLevelFiles = droppedFiles.map((file) => ({
      name: file.name,
      type: 'file',
    }));
    const newMap = {};
    droppedFiles.forEach(file => {
      newMap[file.name] = file;
    });
    setFileMap(prev => ({ ...prev, ...newMap }));
    setFiles((prev) => [...prev, ...newTopLevelFiles]);
  };

  return (
    <div
      className={`file-explorer modern-explorer ${isDraggingOverRoot ? 'root-drag-over' : ''}`}
      onDragEnter={handleRootDragEnter}
      onDragLeave={handleRootDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleRootDrop}
    >
      {isDraggingOverRoot && (
        <div className="drop-overlay">
          <div className="drop-icon">📥</div>
        </div>
      )}
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
            />
          ) : (
            <div
              key={index}
              className={`file-item ${selectedFile === item.name ? 'selected' : ''}`}
              style={{ paddingLeft: `8px` }}
              onClick={() => handleClickFile(item)}
            >
              <FileIcon fileName={item.name} />
              <span className="file-name">{item.name}</span>
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

export default FileView;
