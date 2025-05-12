// src/components/layout/AppFooter.jsx
import React from 'react';
import './AppFooter.css';

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-inner">
                <span className="brand">brainTrace ⓒ 2025</span>
                <span className="divider">·</span>
                <a href="https://example.com/privacy" target="_blank" rel="noreferrer">
                    개인정보처리방침
                </a>
                <span className="divider">·</span>
                <a href="https://example.com/terms" target="_blank" rel="noreferrer">
                    이용약관
                </a>
            </div>
        </footer>
    );
}
