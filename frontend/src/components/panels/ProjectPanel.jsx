// src/components/layout/ProjectPanel.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* API ─ backend */
import { listUserBrains } from '../../../../backend/services/backend';

/* 아이콘 매핑 */
import { iconByKey } from '../iconMap';

/* style */
import './styles/Common.css';
import './styles/ProjectPanel.css';
import './styles/Scrollbar.css';

import { IoHomeOutline } from 'react-icons/io5';
import { AiOutlinePlus } from 'react-icons/ai';

/**
 * 왼쪽 세로 사이드바 (프로젝트/브레인 아이콘 목록)
 * @param {number}   activeProject   – 현재 열린 브레인 id
 * @param {function} onProjectChange – 상위 컴포넌트로 id 전파
 */
export default function ProjectPanel({ activeProject, onProjectChange }) {
  const nav = useNavigate();
  const [brains, setBrains] = useState([]);

  /* ───────── DB 호출 ───────── */
  useEffect(() => {
    const uid = Number(localStorage.getItem('userId'));
    if (!uid) return;
    listUserBrains(uid)
      .then(setBrains)
      .catch(console.error);
  }, []);

  /* ───────── 이벤트 ───────── */
  const handleProjectClick = id => {
    onProjectChange?.(id);
    nav(`/project/${id}`);
  };

  /* ───────── UI ───────── */
  return (
    <div className="panel-container sidebar-container">
      <div className="panel-content">
        <div className="sidebar-icons">
          {brains.slice().sort((a, b) => b.brain_id - a.brain_id)
            .map(b => {
              const Icon = iconByKey[b.icon_key] ?? iconByKey.BsGraphUp;
              return (
                <div
                  key={b.brain_id}
                  className={`sidebar-icon ${activeProject === b.brain_id ? 'active' : ''}`}
                  onClick={() => handleProjectClick(b.brain_id)}
                  title={b.brain_name}
                >
                  <Icon size={20} />
                </div>
              );
            })}

          {/* + 버튼 – 새 프로젝트(홈) */}
          <div
            className="sidebar-icon add-icon"
            onClick={() => nav('/')}
            title="새 프로젝트"
          >
            <AiOutlinePlus size={25} style={{ margin: 'auto' }} />
          </div>
        </div>
      </div>
      {/* 하단 고정 홈 아이콘 */}
      <div
        className="sidebar-icon home-icon"
        onClick={() => nav('/')}
        title="홈으로"
      >
        <IoHomeOutline size={20} />
      </div>
    </div>
  );
}
