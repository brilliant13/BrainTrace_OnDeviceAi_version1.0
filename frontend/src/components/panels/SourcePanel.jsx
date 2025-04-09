// src/components/panels/SourcePanel.jsx
// import React from 'react';
// import './Panels.css';
// import projectData from '../../data/projectData';

// function FileItem({ item, level = 0 }) {
//   const getIcon = () => {
//     if (item.type === 'folder') return '📁';
//     if (item.name.endsWith('.pdf')) return '📕';
//     if (item.name.endsWith('.png') || item.name.endsWith('.jpg')) return '🖼️';
//     if (item.name.endsWith('.md')) return '📝';
//     if (item.name.endsWith('.js') || item.name.endsWith('.jsx')) return '📜';
//     if (item.name.endsWith('.py')) return '🐍';
//     if (item.name.endsWith('.json')) return '📋';
//     if (item.name.endsWith('.css')) return '🎨';
//     return '📄';
//   };

//   const className = `file-item ${level === 1 ? 'sub-entry' : level === 2 ? 'sub-sub-entry' : ''}`;

//   return (
//     <>
//       <div className={className}>
//         <span className="file-icon">{getIcon()}</span>
//         <span className="file-name">{item.name}</span>
//       </div>
//       {item.type === 'folder' && item.children && item.children.map((child, index) => (
//         <FileItem key={index} item={child} level={level + 1} />
//       ))}
//     </>
//   );
// }

// function SourcePanel({ activeProject }) {
//   const project = projectData.find(p => p.id === activeProject) || projectData[0];
//   const files = project.files || [];

//   return (
//     <div className="panel-container">
//       <h2>Source</h2>
//       <div className="panel-content">
//         <div className="file-explorer">
//           {files.map((file, index) => (
//             <FileItem key={index} item={file} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SourcePanel;

// src/components/panels/SourcePanel.jsx
import React, { useState } from 'react';
import './Panels.css';
import projectData from '../../data/projectData';
import FileView from './FileView';

import toggleIcon from '../../assets/icons/toggle-view.png';

function SourcePanel({ activeProject }) {
  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const files = project.files || [];

  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [showAddFileInput, setShowAddFileInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");

  const handleAddFolder = (e) => {
    e.preventDefault();
    // 실제 구현에서는 폴더 추가 로직
    setShowAddFolderInput(false);
    setNewFolderName("");
  };

  const handleAddFile = (e) => {
    e.preventDefault();
    // 실제 구현에서는 파일 추가 로직
    setShowAddFileInput(false);
    setNewFileName("");
  };

  return (
    <div className="panel-container modern-panel">
      <div className="panel-header">
        <h2>Source</h2>
      </div>

      <div className="action-buttons">
        <button className="add-button" onClick={() => setShowAddFolderInput(true)}>
          <span className="add-icon">+</span> 폴더 추가
        </button>
        <button className="add-button" onClick={() => setShowAddFileInput(true)}>
          <span className="add-icon">+</span> 소스 추가
        </button>
      </div>

      {showAddFolderInput && (
        <form className="add-form" onSubmit={handleAddFolder}>
          <input
            type="text"
            placeholder="폴더 이름"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <button type="submit">추가</button>
          <button type="button" onClick={() => setShowAddFolderInput(false)}>취소</button>
        </form>
      )}

      {showAddFileInput && (
        <form className="add-form" onSubmit={handleAddFile}>
          <input
            type="text"
            placeholder="파일 이름"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            autoFocus
          />
          <button type="submit">추가</button>
          <button type="button" onClick={() => setShowAddFileInput(false)}>취소</button>
        </form>
      )}

      <div className="panel-content">
        <FileView files={files} />
      </div>
    </div>
  );
}

export default SourcePanel;