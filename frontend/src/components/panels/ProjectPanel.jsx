<<<<<<< HEAD
// src/components/layout/ProjectPanel.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* API ─ backend */
import { listUserBrains } from '../../../../backend/services/backend';

/* 아이콘 매핑 */
import { iconByKey } from '../iconMap';

/* style */
=======
import React from 'react';
import { useNavigate } from 'react-router-dom';
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
import './styles/Common.css';
import './styles/ProjectPanel.css';
import './styles/Scrollbar.css';

<<<<<<< HEAD
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
=======
import projectData from '../../data/projectData';
import { IoHomeOutline } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";


function ProjectPanel({ activeProject, onProjectChange }) {
  const navigate = useNavigate();

  const handleProjectClick = (projectId) => {
    onProjectChange(projectId);
    navigate(`/project/${projectId}`);
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
  };

  /* ───────── UI ───────── */
  return (
    <div className="panel-container sidebar-container">
      <div className="panel-content">
        <div className="sidebar-icons">
<<<<<<< HEAD
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
=======
          {projectData.map(project => {
            const Icon = project.icon;
            return (
              <div
                key={project.id}
                className={`sidebar-icon ${activeProject === project.id ? 'active' : ''}`}
                onClick={() => handleProjectClick(project.id)}
                title={project.name}
              >
                <Icon size={20} />
              </div>
            );
          })}
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e

          {/* + 버튼 – 새 프로젝트(홈) */}
          <div
            className="sidebar-icon add-icon"
<<<<<<< HEAD
            onClick={() => nav('/')}
            title="새 프로젝트"
          >
            <AiOutlinePlus size={25} style={{ margin: 'auto' }} />
=======
            onClick={() => navigate('/')}
          >
            <span role="img" aria-label="add"><AiOutlinePlus size={25} style={{ margin: 'auto' }} /></span>
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* 하단 고정 홈 아이콘 */}
      <div
        className="sidebar-icon home-icon"
        onClick={() => nav('/')}
=======
      {/* 맨 아래 고정 홈 아이콘 */}
      <div
        className="sidebar-icon home-icon"
        onClick={() => navigate('/')}
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
        title="홈으로"
      >
        <IoHomeOutline size={20} />
      </div>
    </div>
  );
}
