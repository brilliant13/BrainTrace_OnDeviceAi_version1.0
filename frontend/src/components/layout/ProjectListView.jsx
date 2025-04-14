import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 꼭 추가!
import projectData from '../../data/projectData';
import AppHeader from './AppHeader';
import './ProjectListView.css';


function ProjectListView() {
    const navigate = useNavigate();

    return (
        <div className="project-list-page" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <AppHeader />
            <div className="project-list-view">
                <div className="project-header">
                    <h1 className="page-highlight">당신의 두뇌 저장소</h1>
                </div>
                <div className="project-grid">
                    {projectData.map(project => (
                        <div
                            key={project.id}
                            className="project-card"
                            onClick={() => navigate(`/project/${project.id}`)}
                        >
                            <div className="project-icon" style={{ fontSize: '32px' }}>{project.icon}</div>
                            <div className="project-name">{project.name}</div>
                            <div className="project-date">
                                {project.createdAt ?? '날짜 없음'}
                            </div>
                        </div>
                    ))}

                    <div className="project-card add-card">
                        ➕ 새 프로젝트 만들기
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectListView;
