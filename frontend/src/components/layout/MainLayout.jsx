// src/components/layout/MainLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from 'react-resizable-panels';
import './MainLayout.css';

// 패널 컴포넌트 가져오기
import ProjectPanel from '../panels/ProjectPanel';
import SourcePanel from '../panels/SourcePanel';
import ChatPanel from '../panels/ChatPanel';
import MemoPanel from '../panels/MemoPanel';

// 리사이즈 핸들 컴포넌트
function ResizeHandle() {
  return (
    <PanelResizeHandle className="resize-handle">
      <div className="handle-line"></div>
    </PanelResizeHandle>
  );
}

function MainLayout() {
  // 활성화된 프로젝트 ID 상태 관리
  const [activeProject, setActiveProject] = useState(1);
  
  // 소스 패널과 메모 패널의 접힘 상태 관리
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const [memoCollapsed, setMemoCollapsed] = useState(false);
  
  // 패널 크기 관리를 위한 ref
  const sourcePanelRef = useRef(null);
  const memoPanelRef = useRef(null);
  
  // 패널 크기 저장
  const [sourcePanelSize, setSourcePanelSize] = useState(20);
  const [memoPanelSize, setMemoPanelSize] = useState(25);
  
  // 프로젝트 변경 핸들러
  const handleProjectChange = (projectId) => {
    setActiveProject(projectId);
  };
  
  // 패널 크기 변경 핸들러
  const handleSourceResize = (size) => {
    if (!sourceCollapsed) {
      setSourcePanelSize(size);
    }
  };
  
  const handleMemoResize = (size) => {
    if (!memoCollapsed) {
      setMemoPanelSize(size);
    }
  };
  
  // 패널이 접히거나 펼쳐질 때 크기 조정
  useEffect(() => {
    if (sourcePanelRef.current) {
      if (sourceCollapsed) {
        sourcePanelRef.current.resize(5);
      } else {
        sourcePanelRef.current.resize(sourcePanelSize);
      }
    }
  }, [sourceCollapsed, sourcePanelSize]);
  
  useEffect(() => {
    if (memoPanelRef.current) {
      if (memoCollapsed) {
        memoPanelRef.current.resize(5);
      } else {
        memoPanelRef.current.resize(memoPanelSize);
      }
    }
  }, [memoCollapsed, memoPanelSize]);

  return (
    <div className="main-container">
      {/* 프로젝트 패널 (고정 크기) */}
      <div className="layout project-layout">
        <ProjectPanel
          activeProject={activeProject}
          onProjectChange={handleProjectChange}
        />
      </div>
      
      {/* 리사이즈 가능한 패널 그룹 */}
      <PanelGroup direction="horizontal" className="panels-container">
        {/* 소스 패널 */}
        <Panel 
          ref={sourcePanelRef}
          defaultSize={sourceCollapsed ? 5 : 20} 
          minSize={sourceCollapsed ? 5 : 15}
          maxSize={sourceCollapsed ? 5 : 30}
          className={sourceCollapsed ? 'panel-collapsed' : ''}
          onResize={handleSourceResize}
        >
          <div className="layout-inner source-inner">
            <SourcePanel 
              activeProject={activeProject} 
              collapsed={sourceCollapsed}
              setCollapsed={setSourceCollapsed}
            />
          </div>
        </Panel>
        
        <ResizeHandle />
        
        {/* 채팅 패널 */}
        <Panel defaultSize={50} minSize={30}>
          <div className="layout-inner chat-inner">
            <ChatPanel activeProject={activeProject} />
          </div>
        </Panel>
        
        <ResizeHandle />
        
        {/* 메모 패널 */}
        <Panel 
          ref={memoPanelRef}
          defaultSize={memoCollapsed ? 5 : 25}
          minSize={memoCollapsed ? 5 : 15}
          maxSize={memoCollapsed ? 5 : 40}
          className={memoCollapsed ? 'panel-collapsed' : ''}
          onResize={handleMemoResize}
        >
          <div className="layout-inner memo-inner">
            <MemoPanel 
              activeProject={activeProject} 
              collapsed={memoCollapsed}
              setCollapsed={setMemoCollapsed}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default MainLayout;