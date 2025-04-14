import React from 'react';
import './AppHeader.css';
import logo from '../../assets/logo.png'

function AppHeader() {
    return (
        <header className="app-header">
            <div className="header-left">
                <img src={logo} alt="brainTrace 로고" className="app-logo" />
                <span className="app-name">brainTrace</span>
            </div>
        </header>
    );
}

export default AppHeader;
