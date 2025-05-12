import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AppHeader.css';
import logo from '../../assets/logo.png';
import { FiShare2, FiSettings, FiLogOut } from 'react-icons/fi';

export default function AppHeader() {
    const [userName, setUserName] = useState('...');
    const nav = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('userName');
        if (stored) setUserName(stored);
    }, []);

    /* 로그아웃 클릭 */
    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        // 필요하다면 토큰·기타 항목도 같이 제거
        window.location.href = '/login';   // 로그인 페이지로 이동
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <img src={logo} alt="brainTrace 로고" className="app-logo" />
                <span className="app-name">brainTrace</span>
            </div>

            <div className="header-right">
                <button className="icon-button">
                    <FiShare2 className="icon" />
                    공유
                </button>
                <button className="icon-button">
                    <FiSettings className="icon" />
                    설정
                </button>
                {/* 사용자 메뉴: 이름 표시 & 로그아웃 */}
                <div className="avatar-wrapper">
                    <button className="avatar-round">{userName}</button>
                    <div className="avatar-dropdown">
                        <span onClick={handleLogout}>
                            <FiLogOut className="icon" /> 로그아웃
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
