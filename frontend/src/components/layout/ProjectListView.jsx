import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    listUserBrains,
    deleteBrain,
    renameBrain,
} from '../../../../backend/services/backend';

import { iconByKey } from '../iconMap';
import NewBrainModal from '../NewBrainModal';
import ConfirmDialog from '../ConfirmDialog';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';      // 추가

import './ProjectListView.css';

export default function ProjectListView() {
    const nav = useNavigate();

    /* ───────── state ───────── */
    const [sortOption, setSortOption] = useState('최신 항목');
    const [brains, setBrains] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);   // ⋮ 팝업
    const [editingId, setEditingId] = useState(null);    // 제목 편집중 카드 id
    const [tempTitle, setTempTitle] = useState('');
    const [confirmId, setConfirmId] = useState(null);    // 삭제 확인용

    /* ───────── DB 요청 ───────── */
    const fetchBrains = () => {
        const uid = Number(localStorage.getItem('userId'));
        if (!uid) return;
        listUserBrains(uid).then(setBrains).catch(console.error);
    };
    useEffect(fetchBrains, []);

    /* 팝업 외부 클릭 시 자동 닫기 */
    useEffect(() => {
        const close = () => setMenuOpenId(null);
        if (menuOpenId !== null) document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [menuOpenId]);

    /* ───────── 정렬 ───────── */
    const sorted = useMemo(() => {
        const arr = [...brains];
        if (sortOption === '제목') {
            arr.sort((a, b) =>
                (a.brain_name || '').localeCompare(b.brain_name || '')
            );
        } else {
            arr.sort((a, b) => b.brain_id - a.brain_id);;
        }
        return arr;
    }, [brains, sortOption]);

    /* ───────── 제목 저장 함수 ───────── */
    async function handleSaveTitle(brain) {
        const newTitle = tempTitle.trim();
        setEditingId(null);
        if (!newTitle || newTitle === brain.brain_name) return;

        try {
            const updated = await renameBrain(brain.brain_id, newTitle);
            setBrains(prev =>
                prev.map(b => (b.brain_id === brain.brain_id ? updated : b))
            );
        } catch {
            alert('제목 수정 실패');
        }
    }

    /* ───────── 화면 ───────── */
    return (
        <div className="project-list-page">
            <AppHeader />

            <div className="project-list-view">
                <div className="project-header">
                    <h1 className="page-highlight">당신의 두뇌 저장소..</h1>
                </div>

                {/* 정렬 드롭다운 */}
                <div className="project-header-controls">
                    <div className="sort-dropdown">
                        <button className="sort-button">{sortOption} ▼</button>
                        <div className="sort-menu">
                            {['최신 항목', '제목'].map(opt => (
                                <div
                                    key={opt}
                                    className="sort-menu-item"
                                    onClick={() => setSortOption(opt)}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ───────── 카드 그리드 ───────── */}
                <div className="project-grid">
                    {sorted.map(p => {
                        const Icon = iconByKey[p.icon_key] ?? iconByKey.BsGraphUp;

                        return (
                            <div
                                key={p.brain_id}
                                className="project-card"
                                data-id={p.brain_id}
                                onClick={e => {
                                    // ⋮ 클릭 시 이동 금지
                                    // 1) ⋮ 메뉴 클릭 무시
                                    if (e.target.closest('.card-menu')) return;

                                    // 2) **편집 중**이거나 제목을 클릭했을 땐 이동하지 않음
                                    if (editingId === p.brain_id || e.target.closest('.project-name')) return;

                                    // 그 외엔 정상 이동
                                    nav(`/project/${p.brain_id}`);
                                    //nav(`/project/1`);
                                }}
                            >
                                <div className="project-icon">
                                    <Icon size={32} />
                                </div>

                                {/* ─── 제목 (인라인 편집) ─── */}
                                <div
                                    className="project-name"
                                    contentEditable={editingId === p.brain_id}
                                    suppressContentEditableWarning
                                    onInput={e => setTempTitle(e.currentTarget.textContent)}
                                    onKeyDown={e => {
                                        if (e.key === 'Escape') {
                                            e.currentTarget.textContent = p.brain_name;
                                            setEditingId(null);
                                        }
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSaveTitle(p);
                                        }
                                    }}
                                    onBlur={() =>
                                        editingId === p.brain_id && handleSaveTitle(p)
                                    }
                                    style={{ cursor: editingId ? 'text' : 'pointer' }}
                                >
                                    {p.brain_name}
                                </div>

                                <div className="project-date">
                                    {p.created_at ?? '날짜 없음'}
                                </div>

                                {/* ─── ⋮ 메뉴 ─── */}
                                <div
                                    className="card-menu"
                                    onClick={e => {
                                        e.stopPropagation();
                                        setMenuOpenId(prev =>
                                            prev === p.brain_id ? null : p.brain_id
                                        );
                                    }}
                                >
                                    ⋮
                                    {menuOpenId === p.brain_id && (
                                        <div
                                            className="card-menu-popup"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {/* 제목 수정 진입 */}
                                            <div
                                                className="popup-item"
                                                onClick={() => {
                                                    setEditingId(p.brain_id);
                                                    setTempTitle(p.brain_name);
                                                    setMenuOpenId(null);
                                                    // ── 포커스 & 커서를 끝으로 이동 ──
                                                    setTimeout(() => {
                                                        const el = document.querySelector(
                                                            `.project-card[data-id="${p.brain_id}"] .project-name`
                                                        );
                                                        if (el) {
                                                            el.focus();                       // 먼저 포커스
                                                            // ▼ 커서를 텍스트 끝으로 이동
                                                            const sel = window.getSelection();
                                                            const range = document.createRange();
                                                            range.selectNodeContents(el);
                                                            range.collapse(false);            // false ⇒ 끝 위치
                                                            sel.removeAllRanges();
                                                            sel.addRange(range);
                                                        }
                                                    }, 0);
                                                }}
                                            >
                                                제목 수정
                                            </div>

                                            {/* 삭제 */}
                                            <div
                                                className="popup-item"
                                                onClick={() => {
                                                    setConfirmId(p.brain_id);
                                                    setMenuOpenId(null);
                                                }}
                                            >
                                                삭제
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* ➕ 카드 */}
                    <div
                        className="project-card add-card"
                        onClick={() => setShowModal(true)}
                    >
                        ➕ 새 프로젝트
                    </div>
                </div>
            </div>

            <AppFooter />

            {/* 새 브레인 모달 */}
            {showModal && (
                <NewBrainModal
                    onClose={() => setShowModal(false)}
                    onCreated={brain => setBrains(prev => [brain, ...prev])}
                />
            )}

            {/* 삭제 확인 모달 */}
            {confirmId !== null && (
                <ConfirmDialog
                    message="이 프로젝트를 삭제하시겠습니까?"
                    onCancel={() => setConfirmId(null)}
                    onOk={async () => {
                        try {
                            await deleteBrain(confirmId);
                            setBrains(prev => prev.filter(b => b.brain_id !== confirmId));
                        } catch {
                            alert('삭제 실패');
                        }
                        setConfirmId(null);
                    }}
                />
            )}
        </div>
    );
}
