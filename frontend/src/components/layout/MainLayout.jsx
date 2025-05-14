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

import { useParams, useNavigate } from 'react-router-dom';
/* API ─ backend */
import { listUserBrains } from '../../../../backend/services/backend'


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
  const [hasProject, setHasProject] = useState(true);

  const DEFAULT_SOURCE_PANEL_SIZE = 18;
  const DEFAULT_CHAT_PANEL_SIZE = 50;  // 추가된 기본 채팅 패널 크기
  const DEFAULT_MEMO_PANEL_SIZE = 30;

  const [activeProject, setActiveProject] = useState(projectId);
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const [memoCollapsed, setMemoCollapsed] = useState(false);

  // 참고된 노드 목록을 위한 state 추가
  const [referencedNodes, setReferencedNodes] = useState([]);


  const sourcePanelRef = useRef(null);
  const chatPanelRef = useRef(null);  // 추가된 채팅 패널 ref
  const memoPanelRef = useRef(null);

  const [sourcePanelSize, setSourcePanelSize] = useState(DEFAULT_SOURCE_PANEL_SIZE);
  const [chatPanelSize, setChatPanelSize] = useState(DEFAULT_CHAT_PANEL_SIZE);  // 추가된 채팅 패널 크기 상태
  const [memoPanelSize, setMemoPanelSize] = useState(DEFAULT_MEMO_PANEL_SIZE);
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
    // 프로젝트가 변경되면 참고된 노드 초기화
    setReferencedNodes([]);
  };

  // 패널 리사이즈 핸들러들
  const handleSourceResize = (size) => {
    if (!sourceCollapsed) {
      setSourcePanelSize(size);
    }
  };

  const handleChatResize = (size) => {
    setChatPanelSize(size);
  };

  const handleMemoResize = (size) => {
    if (!memoCollapsed) {
      setMemoPanelSize(size);
    }
  };

  // 소스 패널 크기 변경 효과
  useEffect(() => {
    if (!projectId) return;                   // 루트 페이지일 때는 무시

    const uid = Number(localStorage.getItem('userId'));
    if (!uid) { navigate('/'); return; }

    // 사용자 브레인 목록을 불러와서 해당 id 가 없으면 홈으로
    listUserBrains(uid)
      .then(list => {
        const exist = list.some(b => b.brain_id === Number(projectId));
        if (!exist) navigate('/');
        setHasProject(exist);
      })
      .catch(() => navigate('/'));
  }, [projectId, navigate]);


  // 소스 패널 크기 변경 효과
  useEffect(() => {
    if (sourcePanelRef.current) {
      if (sourceCollapsed) {
        sourcePanelRef.current.resize(5);  // 접혔을 때 최소 크기
      } else {
        sourcePanelRef.current.resize(sourcePanelSize);
      }
    }
  }, [isPDFOpen, sourceCollapsed, sourcePanelSize]);

  // 메모 패널 크기 변경 효과
  useEffect(() => {
    if (!memoPanelRef.current) return;

    if (memoCollapsed) {
      memoPanelRef.current.resize(5); // 접힘
    } else {
      if (memoPanelSize === 5) {
        memoPanelRef.current.resize(DEFAULT_MEMO_PANEL_SIZE);
      } else {
        memoPanelRef.current.resize(memoPanelSize);
      }
    }
  }, [memoCollapsed]); // memoPanelSize 제거

  // 패널 레이아웃 재조정 (총합이 100%가 되도록)
  useEffect(() => {
    const allPanelsOpen = !sourceCollapsed && !memoCollapsed;

    if (!allPanelsOpen) return;

    const total = sourcePanelSize + chatPanelSize + memoPanelSize;

    if (Math.abs(total - 100) < 0.5) return; // 거의 100이면 무시 (떨림 방지)

    const ratio = 100 / total;

    setSourcePanelSize(prev => parseFloat((prev * ratio).toFixed(1)));
    setChatPanelSize(prev => parseFloat((prev * ratio).toFixed(1)));
    setMemoPanelSize(prev => parseFloat((prev * ratio).toFixed(1)));
  }, [sourceCollapsed, memoCollapsed]);

  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
    };

    window.addEventListener('dragover', handleDragOver);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

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
          defaultSize={sourceCollapsed ? 5 : DEFAULT_SOURCE_PANEL_SIZE}
          minSize={sourceCollapsed ? 5 : 10}
          maxSize={sourceCollapsed ? 5 : 100}
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

        <Panel
          ref={chatPanelRef}
          defaultSize={DEFAULT_CHAT_PANEL_SIZE}
          minSize={30}
          onResize={handleChatResize}
        >
          <div className="layout-inner chat-inner">
            {/* <ChatPanel activeProject={Number(activeProject)} /> */}
            <ChatPanel 
              activeProject={Number(activeProject)}
              onReferencedNodesUpdate={setReferencedNodes} // ChatPanel에 함수 전달
            />
          </div>
        </Panel>

        <ResizeHandle />

        <Panel
          ref={memoPanelRef}
          defaultSize={memoCollapsed ? 5 : DEFAULT_MEMO_PANEL_SIZE}
          minSize={memoCollapsed ? 5 : 10}
          maxSize={memoCollapsed ? 5 : 100}
          className={memoCollapsed ? 'panel-collapsed' : ''}
          onResize={handleMemoResize}
        >
          <div className="layout-inner memo-inner">
            {/* <MemoPanel
              activeProject={Number(activeProject)}
              collapsed={memoCollapsed}
              setCollapsed={setMemoCollapsed}
            /> */}
            <MemoPanel
              activeProject={Number(activeProject)}
              collapsed={memoCollapsed}
              setCollapsed={setMemoCollapsed}
              referencedNodes={referencedNodes} // MemoPanel에 참고된 노드 목록 전달
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default MainLayout;