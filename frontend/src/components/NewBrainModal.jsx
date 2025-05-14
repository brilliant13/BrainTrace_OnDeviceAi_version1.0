// src/components/NewBrainModal.jsx
import React, { useState } from 'react';
import { createBrain } from '../../../backend/services/backend';
import { ICONS } from './iconMap';
import './NewBrainModal.css';

export default function NewBrainModal({ onClose, onCreated }) {
    const [name, setName] = useState('');
    const [iconKey, setIconKey] = useState(ICONS[0].key);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        const uid = Number(localStorage.getItem('userId'));
        if (!uid) return alert('로그인이 필요합니다');

        setLoading(true);
        try {
            const newBrain = await createBrain({
                brain_name: name,
                user_id: uid,
                icon_key: iconKey
            });
            onCreated(newBrain);
            onClose();
        } catch (err) {
            alert(err.response?.data?.detail ?? '생성 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-back">
            <form className="modal-box" onSubmit={handleSubmit}>
                <h3>새 프로젝트</h3>

                <label>이름</label>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />

                {/* <label>소개</label>
                <input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="이 프로젝트는 어떤 내용을 다루나요?"
                    maxLength={100}
                /> */}

                <label>아이콘</label>
                <div className="icon-grid">
                    {ICONS.map(({ key, cmp: Icon }) => (
                        <div
                            key={key}
                            className={`icon-cell ${iconKey === key ? 'active' : ''}`}
                            onClick={() => setIconKey(key)}
                        >
                            <Icon size={28} />
                        </div>
                    ))}
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? '저장 중…' : '생성'}
                </button>
                <button
                    type="button"
                    className="secondary"
                    onClick={onClose}
                >
                    취소
                </button>
            </form>
        </div>
    );
}
