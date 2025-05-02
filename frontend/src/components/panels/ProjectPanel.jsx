import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Common.css';
import './styles/ProjectPanel.css';
import './styles/Scrollbar.css';

import projectData from '../../data/projectData';
import { IoHomeOutline } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";


function ProjectPanel({ activeProject, onProjectChange }) {
  const navigate = useNavigate();

  const handleProjectClick = (projectId) => {
    onProjectChange(projectId);
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="panel-container sidebar-container">
      <div className="panel-content">
        <div className="sidebar-icons">
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

          <div
            className="sidebar-icon add-icon"
            onClick={() => navigate('/')}
          >
            <span role="img" aria-label="add"><AiOutlinePlus size={25} style={{ margin: 'auto' }} /></span>
          </div>
        </div>
      </div>

      {/* 맨 아래 고정 홈 아이콘 */}
      <div
        className="sidebar-icon home-icon"
        onClick={() => navigate('/')}
        title="홈으로"
      >
        <IoHomeOutline size={20} />
      </div>
    </div>
  );
}

export default ProjectPanel;
