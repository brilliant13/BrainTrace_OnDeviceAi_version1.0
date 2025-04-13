// src/components/panels/MemoPanel.jsx
import React, { memo, useState } from 'react'; // useState 추가
// import './Panels.css';
import './styles/Common.css';
import './styles/MemoPanel.css';
import './styles/PanelToggle.css';
import './styles/Scrollbar.css';


import projectData from '../../data/projectData';

import toggleIcon from '../../assets/icons/toggle-view.png';
import graphOnIcon from '../../assets/icons/graph-on.png';
import graphOffIcon from '../../assets/icons/graph-off.png';
import memoOnIcon from '../../assets/icons/memo-on.png';
import memoOffIcon from '../../assets/icons/memo-off.png';

function MemoPanel({ activeProject, collapsed, setCollapsed }) {
  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const { title, content } = project.memo || { title: '', content: '' };
  const nodes = project.nodes || [];

  // 그래프 표시 여부를 제어하는 상태 추가
  const [showGraph, setShowGraph] = useState(true);
  // 그래프 토글 함수
  const toggleGraph = () => {
    setShowGraph(!showGraph);
  };

  // 메모 표시 여부를 제어하는 상태 추가
  const [showMemo, setShowMemo] = useState(true);
  // 메모 토글 함수
  const toggleMemo = () => {
    setShowMemo(!showMemo);
  };



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
    <div className={`panel-container ${collapsed ? 'collapsed' : ''}`}>
      {/* 헤더 영역 */}
      <div
        className="header-bar"
        style={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'space-between',
          alignItems: 'center',
          height: '45px',
          // padding: '12px 16px',
          padding: '10px 16px',
          // border-bottom: 1px solid #eaeaea;
          borderBottom: '1px solid #eaeaea',

        }}
      >
        {/* Memo 제목 + Graph 아이콘 (접힘 상태일 땐 숨김) */}
        {!collapsed && (
          <div
            className="header-actions2"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              className="header-title"
              style={{
                fontSize: '16px',
                // fontWeight: '600',
                // color: '#333',
              }}
            >
              Memo
            </span>
            <img
              src={showGraph ? graphOnIcon : graphOffIcon}
              alt="Graph View"
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
              }}
              onClick={toggleGraph} // 토글 함수 연결
            />
             <img
              src={showMemo? memoOnIcon : memoOffIcon}
              alt="Memo View"
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
              }}
              onClick={toggleMemo} // 토글 함수 연결
            />
          </div>
        )}

        {/* 토글 아이콘은 항상 표시 */}
        <div className="header-actions">
          <img
            src={toggleIcon}
            alt="Toggle View"
            style={{
              width: '20px',
              height: '20px',
              cursor: 'pointer',
            }}
            onClick={() => setCollapsed(prev => !prev)}
          />
        </div>
      </div>

      {/* 접힘 상태일 때 내용 숨김 */}
      {!collapsed && (
        <div className="panel-content">

          <div className="memo-container">
            {/* 그래프 영역 */}
 
            {/* 그래프 영역 - 조건부 렌더링 */}
            {showGraph && (
              <div className="graph-area">
                <div className="graph-visualization">
                  {nodes.map(node => {
                    let nodeClassName = "node";
                    let style = { left: `${node.x}%`, top: `${node.y}%` };

                    if (node.type === 'main') nodeClassName += " main-node";
                    else if (node.type === 'sub') nodeClassName += " sub-node";
                    else if (node.type === 'small') nodeClassName += " small-node";

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
            )}
              {/* 메모 영역 - 조건부 렌더링 */}
              {showMemo && (
              <div className="memo-area">
                {/* 툴바 */}
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

                {/* 메모 본문 */}
                <div className="memo-content">
                  {renderContent()}
                </div>

                {/* 하단 */}
                <div className="memo-footer">
                  <span className="word-count">
                    {content ? content.split(/\s+/).length : 0} words
                  </span>
                  <button className="save-button">Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoPanel;