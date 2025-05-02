// src/components/SourceQuotaBar.jsx
import React from 'react';
import { FaFileAlt } from 'react-icons/fa'; // React 아이콘
import './styles/SourceQuotaBar.css';

function SourceQuotaBar({ current, max }) {
    const percentage = Math.min((current / max) * 100, 100);

    return (
        <div className="source-quota-bar">
            <div className="quota-label">
                <FaFileAlt style={{ marginRight: '6px' }} />
                소스 한도
            </div>
            <div className="quota-progress-wrapper">
                <div className="quota-progress" style={{ width: `${percentage}%` }} />
            </div>
            <div className="quota-count">{current} / {max}</div>
        </div>
    );
}

export default SourceQuotaBar;
