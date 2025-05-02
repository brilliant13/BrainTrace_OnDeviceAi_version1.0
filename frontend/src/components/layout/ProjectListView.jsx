import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import projectData from '../../data/projectData';
import AppHeader from './AppHeader';
import './ProjectListView.css';

function ProjectListView() {
    const navigate = useNavigate();
    const [sortOption, setSortOption] = useState('최신 항목');

    const getSortedProjects = () => {
        const sorted = [...projectData];
        if (sortOption === '제목') {
            return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (sortOption === '공유 문서함') {
            return sorted.filter(p => p.shared); // 예시: shared = true인 항목만
        } else {
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    };

    return (
        <div className="project-list-page" style={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppHeader />

            <div className="project-list-view" style={{ flex: 1 }}>
                {/* 가운데 정렬된 문구 */}
                <div className="project-header" style={{ textAlign: 'center', margin: '35px 0 16px' }}>
                    <h1 className="page-highlight" style={{ fontSize: '35px' }}>
                        당신의 두뇌 저장소..
                    </h1>
                </div>

                {/* 정렬 드롭다운 */}
                <div className="project-header-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, paddingRight: 20 }}>
                    <div className="sort-dropdown">
                        <button className="sort-button">
                            {sortOption} ▼
                        </button>
                        <div className="sort-menu">
                            {['최신 항목', '제목', '공유 문서함'].map(option => (
                                <div
                                    key={option}
                                    className="sort-menu-item"
                                    onClick={() => setSortOption(option)}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 프로젝트 카드 그리드 */}
                <div className="project-grid">
                    {getSortedProjects().map(project => {
                        const Icon = project.icon;
                        return (
                            <div
                                key={project.id}
                                className="project-card"
                                onClick={() => navigate(`/project/${project.id}`)}
                            >
                                <div className="project-icon" style={{ fontSize: '33px' }}>
                                    <Icon size={32} />
                                </div>
                                <div className="project-name">{project.name}</div>
                                <div className="project-date">
                                    {project.createdAt ?? '날짜 없음'}
                                </div>
                            </div>
                        );
                    })}


                    <div className="project-card add-card">
                        ➕ 새 프로젝트 만들기
                    </div>
                </div>
            </div>

            <footer
                className="project-footer"
                style={{
                    padding: '30px 10px',
                    textAlign: 'center',
                    backgroundColor: '#e5e5e5', // 밝은 회색 배경
                    color: '#333',              // 짙은 회색 텍스트
                    fontSize: '14px'
                }}
            >
                © 2025 당신의 두뇌 저장소. All rights reserved.
            </footer>


        </div>
    );
}

export default ProjectListView;
