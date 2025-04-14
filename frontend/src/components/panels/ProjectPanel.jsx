import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 추가
import './styles/Common.css';
import './styles/ProjectPanel.css';
import './styles/Scrollbar.css';

import projectData from '../../data/projectData';

function ProjectPanel({ activeProject, onProjectChange }) {
  const navigate = useNavigate(); // ✅ 네비게이션 훅 사용

  const handleProjectClick = (projectId) => {
    onProjectChange(projectId); // 상태 업데이트
    navigate(`/project/${projectId}`); // ✅ URL 이동
  };

  return (
    <div className="panel-container sidebar-container">
      <div className="panel-content">
        <div className="sidebar-icons">
          {projectData.map(project => (
            <div
              key={project.id}
              className={`sidebar-icon ${activeProject === project.id ? 'active' : ''}`}
              onClick={() => handleProjectClick(project.id)} // ✅ 클릭 핸들링
              title={project.name}
            >
              <span role="img" aria-label={project.name}>{project.icon}</span>
            </div>
          ))}

          <div
            className="sidebar-icon add-icon"
            onClick={() => navigate('/')} // ✅ 새 프로젝트 추가 → 프로젝트 리스트 페이지로
          >
            <span role="img" aria-label="add">➕</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectPanel;
