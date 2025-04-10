// src/components/panels/FileView.jsx
import React, { useState } from 'react';
// import './Panels.css';

import './styles/Common.css';
import './styles/SourcePanel.css'; // 파일 탐색기 관련 스타일이 여기 있음
import './styles/Scrollbar.css';

function FileIcon({ fileName }) {
  // 파일 타입에 따른 아이콘 결정
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

function FolderView({ item, depth = 0, selectedFile, onSelectFile }) {
  const [isOpen, setIsOpen] = useState(depth === 0); // 최상위 폴더는 기본으로 열기
  
  const toggleFolder = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="folder-container">
      <div 
        className="file-item" 
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={toggleFolder}
      >
        <span className="file-icon">{isOpen ? '📂' : '📁'}</span>
        <span className="file-name">{item.name}</span>
      </div>
      
      {isOpen && item.children && (
        <div className="folder-contents">
          {item.children.map((child, index) => (
            child.type === 'folder' ? (
              <FolderView 
                key={index} 
                item={child} 
                depth={depth + 1} 
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
              />
            ) : (
              <div 
                key={index}
                className={`file-item ${selectedFile === `${item.name}/${child.name}` ? 'selected' : ''}`}
                style={{ paddingLeft: `${(depth + 1) * 16}px` }}
                onClick={() => onSelectFile(`${item.name}/${child.name}`)}
              >
                <FileIcon fileName={child.name} />
                <span className="file-name">{child.name}</span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

function FileView({ files }) {
  const [selectedFile, setSelectedFile] = useState(null);
  
  return (
    <div className="file-explorer modern-explorer">
      {files.length > 0 ? (
        files.map((item, index) => (
          <FolderView 
            key={index} 
            item={item} 
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        ))
      ) : (
        <div className="empty-state">
          <p>파일이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default FileView;