// src/components/panels/MemoPanel.jsx
import React, { useState, useEffect } from 'react';
import './styles/Common.css';
import './styles/MemoPanel.css';
import './styles/PanelToggle.css';
import './styles/Scrollbar.css';

import MemoEditor from './MemoEditor';
import MemoListPanel from './MemoListPanel';

import toggleIcon from '../../assets/icons/toggle-view.png';
import graphOnIcon from '../../assets/icons/graph-on.png';
import graphOffIcon from '../../assets/icons/graph-off.png';
import memoOnIcon from '../../assets/icons/memo-on.png';
import memoOffIcon from '../../assets/icons/memo-off.png';
import GraphViewWithModal from './GraphViewWithModal';

function MemoPanel({ activeProject, collapsed, setCollapsed, referencedNodes = [], graphRefreshTrigger }) {
  const projectId = activeProject;
  const MEMO_STORAGE_KEY = `brainTrace-memos-${projectId}`;
  const DELETED_MEMO_STORAGE_KEY = `brainTrace-deleted-${projectId}`;

  const [showGraph, setShowGraph] = useState(true);
  const [showMemo, setShowMemo] = useState(true);
  const [memos, setMemos] = useState([]);
  const [deletedMemos, setDeletedMemos] = useState([]);
  const [selectedMemoId, setSelectedMemoId] = useState(null);
  const [highlightedMemoId, setHighlightedMemoId] = useState(null);
  const [graphHeight, setGraphHeight] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(MEMO_STORAGE_KEY);
    const deleted = localStorage.getItem(DELETED_MEMO_STORAGE_KEY);

    setMemos(saved ? JSON.parse(saved) : []);
    setDeletedMemos(deleted ? JSON.parse(deleted) : []);
    setSelectedMemoId(null);
  }, [MEMO_STORAGE_KEY, DELETED_MEMO_STORAGE_KEY]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newHeight = e.clientY - document.querySelector('.panel-container').getBoundingClientRect().top - 45;
      if (newHeight > 10 && newHeight < 950) {
        setGraphHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const selectedMemo = memos.find(m => m.id === selectedMemoId);

  const handleAddMemo = () => {
    const newId = Date.now();
    const newMemo = { id: newId, title: '', content: '' };
    const updated = [newMemo, ...memos];
    setMemos(updated);
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(updated));
    setHighlightedMemoId(newId);
    setSelectedMemoId(null);
    setTimeout(() => {
      setSelectedMemoId(newId);
      setHighlightedMemoId(null);
    }, 1000);
  };

  const handleDeleteMemo = (id) => {
    const target = memos.find(m => m.id === id);
    const updated = memos.filter(m => m.id !== id);

    if (!target) return;

    setMemos(updated);
    setDeletedMemos(prev => {
      const next = [target, ...prev];
      localStorage.setItem(DELETED_MEMO_STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(updated));
    if (selectedMemoId === id) {
      setSelectedMemoId(null);
    }
  };

  const handleRestoreMemo = (id) => {
    const target = deletedMemos.find(m => m.id === id);
    if (!target) return;

    const updatedTrash = deletedMemos.filter(m => m.id !== id);
    const updatedMemos = [target, ...memos];

    setDeletedMemos(updatedTrash);
    setMemos(updatedMemos);

    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(updatedMemos));
    localStorage.setItem(DELETED_MEMO_STORAGE_KEY, JSON.stringify(updatedTrash));
  };

  return (
    <div className={`panel-container ${collapsed ? 'collapsed' : ''}`}>
      <div
        className="header-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '45px',
          padding: '10px 16px',
          borderBottom: '1px solid #eaeaea',
        }}
      >
        {!collapsed && (
          <div className="header-actions2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="header-title" style={{ fontSize: '17px' }}>Insight</span>
          </div>
        )}
        <div className="header-actions">
          {!collapsed && (
            <>
              <img
                src={showGraph ? graphOnIcon : graphOffIcon}
                alt="Graph View"
                style={{ width: '19px', height: '19px', cursor: 'pointer' }}
                onClick={() => setShowGraph(prev => !prev)}
              />
              <img
                src={showMemo ? memoOnIcon : memoOffIcon}
                alt="Memo View"
                style={{ width: '19px', height: '19px', cursor: 'pointer' }}
                onClick={() => setShowMemo(prev => !prev)}
              />
            </>
          )}
          <img
            src={toggleIcon}
            alt="Toggle View"
            style={{ width: '23px', height: '23px', cursor: 'pointer' }}
            onClick={() => setCollapsed(prev => !prev)}
          />
        </div>
      </div>

      {!collapsed && (
        <div className="panel-content" style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          {showGraph && (
            <div
              style={{
                height: showMemo ? `${graphHeight}px` : '100%',
                transition: isResizing ? 'none' : 'height 0.3s ease'
              }}
            >
              <GraphViewWithModal
                brainId={projectId || 'default-brain-id'}
                height={showMemo ? graphHeight : 1022}
                referencedNodes={referencedNodes} // MainLayout에서 받은 참고된 노드 목록 전달
                graphRefreshTrigger={graphRefreshTrigger}

              />
            </div>
          )}

          {/* 리사이저 바 */}
          {showGraph && showMemo && (
            <div
              style={{
                height: '10px',
                cursor: 'row-resize',
                borderBottom: '2px solid #ccc',
                backgroundColor: '#fafafa',
              }}
              onMouseDown={() => setIsResizing(true)}
            />
          )}

          {showMemo && (
            <div className="memo-body" style={{
              flex: 1,
              overflow: 'auto',
              borderTop: '1px solid #eaeaea',
            }}>
              {selectedMemoId == null ? (
                <MemoListPanel
                  memos={memos}
                  deletedMemos={deletedMemos}
                  selectedId={selectedMemoId}
                  highlightedId={highlightedMemoId}
                  onSelect={setSelectedMemoId}
                  onAdd={handleAddMemo}
                  onDelete={handleDeleteMemo}
                  onRestore={handleRestoreMemo}
                />
              ) : (
                <MemoEditor
                  memo={selectedMemo}
                  onSaveAndClose={(updatedMemo) => {
                    const updatedList = memos.map(m =>
                      m.id === updatedMemo.id ? updatedMemo : m
                    );
                    setMemos(updatedList);
                    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(updatedList));
                    setSelectedMemoId(null);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MemoPanel;
