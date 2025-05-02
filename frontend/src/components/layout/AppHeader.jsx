import React from 'react';
import './AppHeader.css';
import logo from '../../assets/logo.png';
import { FiShare2, FiSettings } from 'react-icons/fi';
function AppHeader() {
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

                <button className="avatar-round">무무</button>
            </div>
        </header>
    );
}

export default AppHeader;
