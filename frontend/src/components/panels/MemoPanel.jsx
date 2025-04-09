// // src/components/panels/MemoPanel.jsx
// import React from 'react';
// import './Panels.css';

// function MemoPanel() {
//   return (
//     <div className="panel-container">
//       <div className="header-bar">
//         <span className="header-title">Memo</span>
//         <div className="header-actions">
//           <button className="header-button">🔗</button>
//         </div>
//       </div>
//       <div className="panel-content">
//         <div className="memo-container">
//           <div className="graph-area">
//             <div className="graph-visualization">
//               <div className="node main-node">L</div>
//               <div className="node sub-node" style={{left: '35%', top: '30%'}}>Devel...</div>
//               <div className="node sub-node" style={{right: '35%', top: '70%'}}>Appl...</div>
//               <div className="node small-node" style={{left: '45%', top: '40%'}}>B</div>
//               <div className="node small-node" style={{right: '45%', top: '60%'}}>B</div>
//             </div>
//           </div>
          
//           <div className="memo-toolbar">
//             <div className="format-tools">
//               <span className="format-item">Normal text</span>
//               <span className="format-separator">|</span>
//               <button className="toolbar-button">B</button>
//               <button className="toolbar-button">I</button>
//               <button className="toolbar-button">U</button>
//               <button className="toolbar-button">S</button>
//               <button className="toolbar-button">🔗</button>
//               <button className="toolbar-button">📌</button>
//             </div>
//           </div>
          
//           <div className="memo-content">
//             <h3>Heading1</h3>
//             <div className="code-block">
//               <pre>{`// 코드 예제 
// if (x > 3) {
//   console.log("x는 3보다 큽니다");
// }`}</pre>
//             </div>
//             <p>Nothing is impossible, the word itself says "I'm possible!"</p>
//           </div>
          
//           <div className="memo-footer">
//             <span className="word-count">0 words</span>
//             <button className="save-button">Save</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MemoPanel;

// src/components/panels/MemoPanel.jsx
import React from 'react';
import './Panels.css';
import projectData from '../../data/projectData';

function MemoPanel({ activeProject }) {
  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const { title, content } = project.memo || { title: '', content: '' };
  const nodes = project.nodes || [];
  
  // 마크다운 형식 콘텐츠를 간단히 변환
  const renderContent = () => {
    if (!content) return null;
    
    const parts = content.split('\n\n');
    
    return parts.map((part, index) => {
      // 제목 (# 으로 시작하는 줄)
      if (part.startsWith('# ')) {
        return <h3 key={index}>{part.substring(2)}</h3>;
      }
      // 부제목 (## 으로 시작하는 줄)
      else if (part.startsWith('## ')) {
        return <h4 key={index}>{part.substring(3)}</h4>;
      }
      // 코드 블록
      else if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.substring(part.indexOf('\n') + 1, part.lastIndexOf('```'));
        return (
          <div key={index} className="code-block">
            <pre>{code}</pre>
          </div>
        );
      }
      // 일반 텍스트
      return <p key={index}>{part}</p>;
    });
  };

  return (
    <div className="panel-container">
      <div className="header-bar">
        <span className="header-title">Memo</span>
        <div className="header-actions">
          <button className="header-button">🔗</button>
        </div>
      </div>
      <div className="panel-content">
        <div className="memo-container">
          <div className="graph-area">
            <div className="graph-visualization">
              {nodes.map(node => {
                let nodeClassName = "node";
                let style = { left: `${node.x}%`, top: `${node.y}%` };
                
                if (node.type === 'main') {
                  nodeClassName += " main-node";
                } else if (node.type === 'sub') {
                  nodeClassName += " sub-node";
                } else if (node.type === 'small') {
                  nodeClassName += " small-node";
                }
                
                return (
                  <div 
                    key={node.id} 
                    className={nodeClassName} 
                    style={style}
                  >
                    {node.label}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="memo-toolbar">
            <div className="format-tools">
              <span className="format-item">Normal text</span>
              <span className="format-separator">|</span>
              <button className="toolbar-button">B</button>
              <button className="toolbar-button">I</button>
              <button className="toolbar-button">U</button>
              <button className="toolbar-button">S</button>
              <button className="toolbar-button">🔗</button>
              <button className="toolbar-button">📌</button>
            </div>
          </div>
          
          <div className="memo-content">
            {renderContent()}
          </div>
          
          <div className="memo-footer">
            <span className="word-count">
              {content ? content.split(/\s+/).length : 0} words
            </span>
            <button className="save-button">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemoPanel;