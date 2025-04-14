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

import { useParams, useNavigate } from 'react-router-dom';
import projectData from '../../data/projectData';

// 리사이즈 핸들 컴포넌트
function ResizeHandle() {
  return (
    <PanelResizeHandle className="resize-handle">
      <div className="handle-line"></div>
    </PanelResizeHandle>
  );
}

function MainLayout() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // 존재하는 프로젝트인지 확인
  const selectedProject = projectData.find(p => p.id === Number(projectId));
  useEffect(() => {
    if (!selectedProject) {
      navigate('/'); // 잘못된 projectId일 경우 홈으로 리디렉션
    }
  }, [selectedProject, navigate]);

  const DEFAULT_SOURCE_PANEL_SIZE = 20;
  const [activeProject, setActiveProject] = useState(projectId);
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const [memoCollapsed, setMemoCollapsed] = useState(false);
  const sourcePanelRef = useRef(null);
  const memoPanelRef = useRef(null);
  const [sourcePanelSize, setSourcePanelSize] = useState(20);
  const [memoPanelSize, setMemoPanelSize] = useState(25);
  const [isPDFOpen, setIsPDFOpen] = useState(false);

  const handleBackFromPDF = () => {
    setIsPDFOpen(false);
    if (sourcePanelRef.current) {
      sourcePanelRef.current.resize(DEFAULT_SOURCE_PANEL_SIZE);
    }
  };

  const handleProjectChange = (projectId) => {
    setActiveProject(projectId);
    navigate(`/project/${projectId}`);
  };

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

  useEffect(() => {
    if (sourcePanelRef.current) {
      if (isPDFOpen) {
        sourcePanelRef.current.resize(35);
      } else {
        sourcePanelRef.current.resize(sourcePanelSize);
      }
    }
  }, [isPDFOpen, sourceCollapsed]);

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
      <div className="layout project-layout">
        <ProjectPanel
          activeProject={Number(activeProject)}
          onProjectChange={handleProjectChange}
        />
      </div>

      <PanelGroup direction="horizontal" className="panels-container">
        <Panel
          ref={sourcePanelRef}
          defaultSize={sourceCollapsed ? 5 : 20}
          minSize={sourceCollapsed ? 5 : 10}
          maxSize={sourceCollapsed ? 5 : 120}
          className={sourceCollapsed ? 'panel-collapsed' : ''}
          onResize={handleSourceResize}
        >
          <div className="layout-inner source-inner">
            <SourcePanel
              activeProject={Number(activeProject)}
              collapsed={sourceCollapsed}
              setCollapsed={setSourceCollapsed}
              setIsPDFOpen={setIsPDFOpen}
              onBackFromPDF={handleBackFromPDF}
            />
          </div>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize={50} minSize={30}>
          <div className="layout-inner chat-inner">
            <ChatPanel activeProject={Number(activeProject)} />
          </div>
        </Panel>

        <ResizeHandle />

        <Panel
          ref={memoPanelRef}
          defaultSize={memoCollapsed ? 5 : 25}
          minSize={memoCollapsed ? 5 : 10}
          maxSize={memoCollapsed ? 5 : 120}
          className={memoCollapsed ? 'panel-collapsed' : ''}
          onResize={handleMemoResize}
        >
          <div className="layout-inner memo-inner">
            <MemoPanel
              activeProject={Number(activeProject)}
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
