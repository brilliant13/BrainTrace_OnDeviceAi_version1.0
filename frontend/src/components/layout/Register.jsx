// src/components/layout/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../../../backend/services/backend';
import './auth.css';
export default function Register() {
    const nav = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        if (password !== confirm) {
            setError('비밀번호가 일치하지 않습니다'); return;
        }
        setLoading(true); setError('');
        try {
            await register(username, password);
            alert('회원가입이 완료되었습니다! 로그인해 주세요.');
            nav('/login');
        } catch (err) {
            setError(err.response?.data?.detail ?? '회원가입 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-box" onSubmit={handleSubmit}>
                <h2>회원가입</h2>

                <label>사용자 이름 (2~8자)</label>
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    minLength={2}
                    maxLength={8}
                    required
                />

                <label>비밀번호 (4자 이상)</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={4}
                    required
                />

                <label>비밀번호 확인</label>
                <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    minLength={4}
                    required
                />

                {error && <div className="error-msg">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? '처리 중…' : '가입하기'}
                </button>

                <p className="helper">
                    이미 계정이 있나요? <Link to="/login">로그인</Link>
                </p>
            </form>
        </div>
    );
}
