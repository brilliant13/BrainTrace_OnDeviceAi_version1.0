// src/components/layout/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authUser } from '../../../../backend/services/backend';
import './auth.css';
export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await authUser(username, password);
            // 세션 저장
            localStorage.setItem('userId', res.user_id);
            localStorage.setItem('userName', res.user_name);
            // 메인으로 이동
            navigate('/', { replace: true });
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.detail ?? '로그인 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-box" onSubmit={handleSubmit}>
                <h2>로그인</h2>

                <label>사용자 이름</label>
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />

                <label>비밀번호</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                {error && <div className="error-msg">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? '확인 중…' : '로그인'}
                </button>

                <p className="helper">
                    아직 계정이 없나요? <Link to="/register">회원가입</Link>
                </p>
            </form>

        </div>
    );
}
