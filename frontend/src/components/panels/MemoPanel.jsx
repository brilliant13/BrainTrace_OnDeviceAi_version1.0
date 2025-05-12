import React, { useState, useEffect } from 'react';
import './styles/Common.css';
import './styles/MemoPanel.css';
import './styles/PanelToggle.css';
import './styles/Scrollbar.css';

import GraphView from './GraphView';
import MemoEditor from './MemoEditor';
import MemoListPanel from './MemoListPanel';

import toggleIcon from '../../assets/icons/toggle-view.png';
import graphOnIcon from '../../assets/icons/graph-on.png';
import graphOffIcon from '../../assets/icons/graph-off.png';
import memoOnIcon from '../../assets/icons/memo-on.png';
import memoOffIcon from '../../assets/icons/memo-off.png';

function MemoPanel({ activeProject, collapsed, setCollapsed }) {
  const projectId = activeProject;
  const MEMO_STORAGE_KEY = `brainTrace-memos-${projectId}`;

  const [showGraph, setShowGraph] = useState(true);
  const [showMemo, setShowMemo] = useState(true);
  const [memos, setMemos] = useState([]);
  const [selectedMemoId, setSelectedMemoId] = useState(null);
  const [highlightedMemoId, setHighlightedMemoId] = useState(null);
  const [graphHeight, setGraphHeight] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(MEMO_STORAGE_KEY);
    if (saved) {
      const loaded = JSON.parse(saved);
      setMemos(loaded);
    } else {
      const initial = [];
      setMemos(initial);
      localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(initial));
    }
    setSelectedMemoId(null);
  }, [MEMO_STORAGE_KEY]);

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
    const newMemo = { id: newId, title: ``, content: '' };
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
    const updated = memos.filter((memo) => memo.id !== id);
    setMemos(updated);
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(updated));
    if (selectedMemoId === id) {
      setSelectedMemoId(null);
    }
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
            <span className="header-title" style={{ fontSize: '17px' }}>Insight </span>
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
          height: 'calc(100%)',
          overflow: 'hidden'
        }}>
          {showGraph && (
            <div
              style={{
                height: showMemo ? `${graphHeight}px` : 'calc(100%)',
                transition: isResizing ? 'none' : 'height 0.3s ease'
              }}
            >
              <GraphView
                brainId={projectId || 'default-brain-id'}
                height={showMemo ? graphHeight : undefined}
              />
            </div>
          )}

          {/* 리사이저 바 */}
          {showGraph && showMemo && (
            <div
              style={{
                height: '10px',
                cursor: 'row-resize',
<<<<<<< HEAD
                borderBottom: '2px solid #ccc',
                backgroundColor: '#fafafa',
=======
                borderBottom: '1px solid #ccc',
                backgroundColor: 'transparent', // ✅ 완전 투명
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
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
                  selectedId={selectedMemoId}
                  highlightedId={highlightedMemoId}
                  onSelect={setSelectedMemoId}
                  onAdd={handleAddMemo}
                  onDelete={handleDeleteMemo}
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
