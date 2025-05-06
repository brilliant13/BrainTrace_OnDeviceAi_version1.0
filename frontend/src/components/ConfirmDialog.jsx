import React from 'react';
import './ConfirmDialog.css';

export default function ConfirmDialog({ message, onOk, onCancel }) {
    return (
        <div className="confirm-back" onClick={onCancel}>
            <div className="confirm-box" onClick={e => e.stopPropagation()}>
                <div>{message}</div>
                <div className="confirm-buttons">
                    <button className="secondary" onClick={onCancel}>
                        취소
                    </button>
                    <button className="danger" onClick={onOk}>
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}
