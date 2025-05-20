import React, { useState, useRef, useEffect } from 'react';
import GraphView from './GraphView';
import { MdFullscreen, MdClose } from 'react-icons/md';
import './styles/GraphViewWithModal.css';
import { ImEnlarge } from "react-icons/im";

function GraphViewWithModal(props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const modalRef = useRef(null);
    const offset = useRef({ x: 0, y: 0 });

    // ESC로 닫기
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsFullscreen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 모달 바깥 클릭 시 닫기
    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setIsFullscreen(false);
        }
    };

    // 모달 드래그
    const handleMouseDown = (e) => {
        const modal = modalRef.current;
        if (!modal) return;

        const rect = modal.getBoundingClientRect();
        offset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        modal.style.transform = 'none';
        modal.style.left = `${rect.left}px`;
        modal.style.top = `${rect.top}px`;

        const onMouseMove = (e) => {
            const newLeft = e.clientX - offset.current.x;
            const newTop = e.clientY - offset.current.y;

            // 화면 밖으로 나가지 않게 제한
            // const maxLeft = window.innerWidth - modal.offsetWidth;
            // const maxTop = window.innerHeight - modal.offsetHeight;

            // modal.style.left = `${Math.min(Math.max(0, newLeft), maxLeft)}px`;
            // modal.style.top = `${Math.min(Math.max(0, newTop), maxTop)}px`;

            // 제한 없이 자유롭게 이동 가능
            modal.style.left = `${newLeft}px`;
            modal.style.top = `${newTop}px`;

        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // 리사이즈
    const handleResizeMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const modal = modalRef.current;
        if (!modal) return;

        const startWidth = modal.offsetWidth;
        const startHeight = modal.offsetHeight;
        const startX = e.clientX;
        const startY = e.clientY;

        const onMouseMove = (e) => {
            const newWidth = Math.max(400, startWidth + (e.clientX - startX));
            const newHeight = Math.max(300, startHeight + (e.clientY - startY));
            modal.style.width = `${newWidth}px`;
            modal.style.height = `${newHeight}px`;
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div className="graph-view-wrapper">
            <div className="graph-with-button">
                <GraphView {...props} isFullscreen={isFullscreen} />
                <button className="fullscreen-btn" onClick={() => setIsFullscreen(true)}>
                    {!isFullscreen && (<MdFullscreen size={22} color='black' title='전체화면' />)}
                </button>
            </div>

            {isFullscreen && (
                <div className="fullscreen-modal" onMouseDown={handleBackdropClick}>
                    <div
                        className="modal-graph-container"
                        ref={modalRef}
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            position: 'fixed'
                        }}
                        onMouseDown={(e) => e.stopPropagation()} // 내부 클릭은 닫힘 방지
                    >
                        <div className="modal-header" onMouseDown={handleMouseDown}>
                            <div className="modal-title">Graph</div>
                            <button className="close-btn" onClick={() => setIsFullscreen(false)}>
                                <MdClose size={25} />
                            </button>
                        </div>
                        <GraphView {...props} isFullscreen={isFullscreen} />
                        <div className="modal-resize-handle" onMouseDown={handleResizeMouseDown} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default GraphViewWithModal;
