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

const MEMO_STORAGE_KEY = 'brainTrace-memos';

function MemoPanel({ collapsed, setCollapsed }) {
  const [showGraph, setShowGraph] = useState(true);

  const [memos, setMemos] = useState([]);
  const [selectedMemoId, setSelectedMemoId] = useState(null);
  const [highlightedMemoId, setHighlightedMemoId] = useState(null);
  const nodes = [
    { id: "main", label: "노드", type: "main", x: 50, y: 50 },
    { id: "sub1", label: "A", type: "sub", x: 30, y: 30 },
    { id: "sub2", label: "B", type: "sub", x: 70, y: 30 }
  ];

  useEffect(() => {
    const saved = localStorage.getItem(MEMO_STORAGE_KEY);
    if (saved) {
      const loaded = JSON.parse(saved);
      setMemos(loaded);
    } else {
      const initial = [
        { id: 1, title: '새 메모 1', content: '' },
        { id: 2, title: '새 메모 2', content: '' }
      ];
      setMemos(initial);
      localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(initial));
    }
    setSelectedMemoId(null); // 메모 리스트 먼저 보이도록
  }, []);

  const selectedMemo = memos.find(m => m.id === selectedMemoId);

  const handleAddMemo = () => {
    const newId = Date.now();
    const newMemo = { id: newId, title: `새 메모 ${memos.length + 1}`, content: '' };
    const updated = [newMemo, ...memos];
    setMemos(updated);
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(updated));
    setHighlightedMemoId(newId); // ✅ 추가된 메모 강조
    setSelectedMemoId(null);
    // 1초 뒤에 에디터로 전환
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
          justifyContent: collapsed ? 'center' : 'space-between',
          alignItems: 'center',
          height: '45px',
          padding: '10px 16px',
          borderBottom: '1px solid #eaeaea',
        }}
      >
        {!collapsed && (
          <div className="header-actions2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="header-title" style={{ fontSize: '16px' }}>Memo</span>
            <img
              src={showGraph ? graphOnIcon : graphOffIcon}
              alt="Graph View"
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              onClick={() => setShowGraph(prev => !prev)}
            />
          </div>
        )}
        <div className="header-actions">
          <img
            src={toggleIcon}
            alt="Toggle View"
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            onClick={() => setCollapsed(prev => !prev)}
          />
        </div>
      </div>

      {!collapsed && (
        <div className="panel-content">
          {showGraph && <GraphView nodes={nodes} />}

          <div className="memo-body" style={{ marginTop: '16px' }}>
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
              <div>
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoPanel;
