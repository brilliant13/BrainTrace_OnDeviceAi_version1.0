// src/components/layout/MainLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';
import './MainLayout.css';

import ProjectPanel from '../panels/ProjectPanel';
import SourcePanel from '../panels/SourcePanel';
import ChatPanel from '../panels/ChatPanel';
import ChatSidebar from '../panels/ChatSidebar';
import MemoPanel from '../panels/MemoPanel';
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
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showChatPanel, setShowChatPanel] = useState(false); // ← 채팅 보기 여부
  const [newlyCreatedSessionId, setNewlyCreatedSessionId] = useState(null);
  const lastSavedProjectRef = useRef(null);

  const DEFAULT_SOURCE_PANEL_SIZE = 18;
  const DEFAULT_CHAT_PANEL_SIZE = 50;  // 추가된 기본 채팅 패널 크기
  const DEFAULT_MEMO_PANEL_SIZE = 40;

  const [activeProject, setActiveProject] = useState(projectId);
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const [memoCollapsed, setMemoCollapsed] = useState(false);

  // 참고된 노드 목록을 위한 state 추가
  const [referencedNodes, setReferencedNodes] = useState([]);
  const [allNodeNames, setAllNodeNames] = useState([]);
  const [focusNodeNames, setFocusNodeNames] = useState([]);
  const [focusSourceId, setFocusSourceId] = useState(null);

  // 그래프 Refresh 용도
  const [graphRefreshTrigger, setGraphRefreshTrigger] = useState(0);
  // FileView에서 호출할 함수
  const handleGraphRefresh = () => {
    setGraphRefreshTrigger(prev => prev + 1);
    syncToStandaloneWindow({ action: 'refresh' }); // 추가

  };
  const handleGraphDataUpdate = (graphData) => {
    const nodeNames = graphData?.nodes?.map(n => n.name) || [];
    setAllNodeNames(nodeNames); // ✅ allNodeNames state 업데이트
  };

  const sourcePanelRef = useRef(null);
  const chatPanelRef = useRef(null);  // 추가된 채팅 패널 ref
  const memoPanelRef = useRef(null);
  const firstPdfExpand = useRef(true);

  const [sourcePanelSize, setSourcePanelSize] = useState(DEFAULT_SOURCE_PANEL_SIZE);
  const [chatPanelSize, setChatPanelSize] = useState(DEFAULT_CHAT_PANEL_SIZE);  // 추가된 채팅 패널 크기 상태
  const [memoPanelSize, setMemoPanelSize] = useState(DEFAULT_MEMO_PANEL_SIZE);
  const [isPDFOpen, setIsPDFOpen] = useState(false);

  const syncToStandaloneWindow = (data) => {
    localStorage.setItem('graphStateSync', JSON.stringify({
      brainId: activeProject,
      timestamp: Date.now(),
      ...data
    }));
  };

  const handleBackFromPDF = () => {
    setIsPDFOpen(false);
    firstPdfExpand.current = true;
    if (sourcePanelRef.current) {
      sourcePanelRef.current.resize(DEFAULT_SOURCE_PANEL_SIZE);
    }
  };

  const handleProjectChange = (projectId) => {
    // 이전 프로젝트 저장
    if (activeProject && sessions.length > 0) {
      localStorage.setItem(`sessions-${activeProject}`, JSON.stringify(sessions));
    }

    // ✅ 초기화는 하지 않음
    setActiveProject(projectId);
    setShowChatPanel(false); // ✅ 무조건 리스트로 이동
    navigate(`/project/${projectId}`);
    setReferencedNodes([]);
  };

  // 패널 리사이즈 핸들러들
  const handleSourceResize = (size) => {
    if (!sourceCollapsed) { setSourcePanelSize(size); }
  };

  const handleChatResize = (size) => { setChatPanelSize(size); };

  const handleMemoResize = (size) => {
    if (!memoCollapsed) { setMemoPanelSize(size); }
  };

  const onReferencedNodesUpdate = (nodes) => {
    setReferencedNodes(nodes);
    syncToStandaloneWindow({ referencedNodes: nodes }); // 추가
  };

  const handleFocusNodeNames = (nodeObject) => {
    if (Array.isArray(nodeObject)) {
      setFocusNodeNames(nodeObject); // 이미 배열이면 그대로 저장
    } else if (nodeObject && nodeObject.nodes) {
      setFocusNodeNames(nodeObject.nodes); // ✅ 이 라인이 핵심
    } else {
      setFocusNodeNames([]);
    }
    syncToStandaloneWindow({ focusNodeNames: Array.isArray(nodeObject) ? nodeObject : nodeObject.nodes }); // 추가

  };

  const onRenameSession = (id, newTitle) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const onDeleteSession = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(`sessions-${activeProject}`, JSON.stringify(updated));
    // ✅ 삭제한 세션이 현재 열려 있던 세션이라면
    if (id === currentSessionId) {
      setCurrentSessionId(null);
      setShowChatPanel(false); // ✅ 무조건 리스트로 이동
    }
  };

  const handleOpenSource = (sourceId) => {
    console.log("sourceId : ", sourceId)
    setFocusSourceId({ id: sourceId, timestamp: Date.now() }); // 무조건 새로운 객체
  };

  useEffect(() => {
    setActiveProject(projectId);
    setShowChatPanel(false);  // ✅ 프로젝트 이동 시 채팅 리스트로 초기화
  }, [projectId]);

  // 저장
  useEffect(() => {
    if (!activeProject || !showChatPanel) return;

    const activeProjectStr = String(activeProject);
    const projectIdStr = String(projectId);

    // 마지막으로 저장된 프로젝트가 같다면 중복 저장 방지
    if (
      activeProjectStr === projectIdStr &&
      lastSavedProjectRef.current !== activeProjectStr
    ) {
      localStorage.setItem(`sessions-${activeProjectStr}`, JSON.stringify(sessions));
      lastSavedProjectRef.current = activeProjectStr;
    }
  }, [sessions, activeProject, projectId, showChatPanel]);

  // 불러오기
  useEffect(() => {
    if (!activeProject) return;
    const saved = localStorage.getItem(`sessions-${activeProject}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      setCurrentSessionId(parsed[0]?.id || null);
    } else {
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, [activeProject]);

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
    if (!sourcePanelRef.current) return;

    // 1) 완전히 접힌 상태
    if (sourceCollapsed) {
      sourcePanelRef.current.resize(5);
      return;
    }

    // 2) PDF 뷰어가 열려 있으면, 넓게 펼치기 (예: 40%)
    if (isPDFOpen) {
      if (firstPdfExpand.current) {
        sourcePanelRef.current.resize(40);
        firstPdfExpand.current = false;
      }
      return;
    }

    // 3) 기본/사용자 지정 크기
    sourcePanelRef.current.resize(sourcePanelSize);
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
              onGraphRefresh={handleGraphRefresh} // 그래프 refresh 용도
              onFocusNodeNamesUpdate={handleFocusNodeNames}
              focusSource={focusSourceId}
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
            {!showChatPanel ? (
              <ChatSidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={(id) => {
                  setCurrentSessionId(id);
                  setShowChatPanel(true);
                }}
                onNewSession={(firstMessageText = '') => {
                  const newId = Date.now().toString();
                  const newSession = {
                    id: newId,
                    title: firstMessageText.slice(0, 20) || 'Untitled',
                    messages: firstMessageText ? [{ text: firstMessageText, isUser: true }] : [],
                  };
                  const updated = [...sessions, newSession];
                  setSessions(updated);
                  setNewlyCreatedSessionId(newId);
                  setTimeout(() => {
                    setCurrentSessionId(newId);
                    setShowChatPanel(true);
                    setNewlyCreatedSessionId(null);
                  }, 1200);
                  return newSession;
                }}
                onRenameSession={onRenameSession}
                onDeleteSession={onDeleteSession}
                newlyCreatedSessionId={newlyCreatedSessionId}
                setNewlyCreatedSessionId={setNewlyCreatedSessionId}
              />
            ) : (
              <ChatPanel
                activeProject={activeProject}
                onReferencedNodesUpdate={onReferencedNodesUpdate}
                sessions={sessions}
                setSessions={setSessions}
                currentSessionId={currentSessionId}
                setCurrentSessionId={setCurrentSessionId}
                showChatPanel={showChatPanel}
                setShowChatPanel={setShowChatPanel}
                allNodeNames={allNodeNames}
                onOpenSource={handleOpenSource}
              />
            )}
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
            <MemoPanel
              activeProject={Number(activeProject)}
              collapsed={memoCollapsed}
              setCollapsed={setMemoCollapsed}
              referencedNodes={referencedNodes} // MemoPanel에 참고된 노드 목록 전달
              graphRefreshTrigger={graphRefreshTrigger} // 그래프 refesh 용도
              onGraphDataUpdate={handleGraphDataUpdate}
              focusNodeNames={focusNodeNames} // SourcePanel에서 노드보기 눌렀을 때 노드 목록 전달
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default MainLayout;