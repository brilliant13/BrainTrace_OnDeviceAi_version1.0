// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import './MainLayout.css';

// 패널 컴포넌트 가져오기
import ProjectPanel from '../panels/ProjectPanel';
import SourcePanel from '../panels/SourcePanel';
import ChatPanel from '../panels/ChatPanel';
import MemoPanel from '../panels/MemoPanel';

function MainLayout() {
  // 활성화된 프로젝트 ID 상태 관리
  const [activeProject, setActiveProject] = useState(1);

  // 소스 패널의 collapse 상태 관리
  const [sourceCollapsed, setSourceCollapsed] = useState(false); // ← 추가
  // 메모 패널의 collapse 상태 관리
  const [memoCollapsed, setMemoCollapsed] = useState(false); // ← 추가


  // 프로젝트 변경 핸들러
  const handleProjectChange = (projectId) => {
    setActiveProject(projectId);
  };

  return (
    <div className="main-container">
      <div className="layout project-layout">
        <ProjectPanel
          activeProject={activeProject}
          onProjectChange={handleProjectChange}
        />
      </div>

      {/* collapsed 상태에 따라 클래스 변경 */}
      {/* <div className="layout source-layout"> */}
      <div className={`layout source-layout ${sourceCollapsed ? 'collapsed' : ''}`}>
        {/* <SourcePanel activeProject={activeProject} /> */}
        <SourcePanel
          activeProject={activeProject}
          collapsed={sourceCollapsed}
          setCollapsed={setSourceCollapsed} // ← props로 제어권 넘김
        />
      </div>
     
      <div className="layout chat-layout">
        <ChatPanel activeProject={activeProject} />
      </div>
      {/* <div className="layout memo-layout"> */}
      
      <div className={`layout memo-layout ${memoCollapsed ? 'collapsed' : ''}`}>
        {/* <MemoPanel activeProject={activeProject} /> */}
        <MemoPanel
          activeProject={activeProject}
          collapsed={memoCollapsed}
          setCollapsed={setMemoCollapsed} // ← props로 제어권 넘김
        // <MemoPanel activeProject={activeProject} 
        />
      </div>
    </div>
  );
}

export default MainLayout;