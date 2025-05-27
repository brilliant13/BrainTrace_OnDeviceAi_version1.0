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

    // const openExternalGraphWindow = () => {
    //     const brainId = props.brainId || 'default-brain-id';
    //     const url = `${window.location.origin}/graph-view?brainId=${encodeURIComponent(brainId)}`;

    //     window.open(
    //         url,
    //         '_blank',
    //         'width=1200,height=800,scrollbars=no,resizable=yes'
    //     );
    // };

    // GraphViewWithModal.jsx의 openExternalGraphWindow 함수 개선
    const openExternalGraphWindow = () => {
        const brainId = props.brainId || 'default-brain-id';

        // URL 파라미터로 추가 정보 전달
        const params = new URLSearchParams({
            brainId: brainId
        });

        // 참고된 노드가 있다면 URL에 포함
        if (props.referencedNodes && props.referencedNodes.length > 0) {
            params.set('referencedNodes', encodeURIComponent(JSON.stringify(props.referencedNodes)));
        }

        // 현재 그래프 상태 정보도 전달 가능
        if (props.graphData) {
            // 필요시 그래프 데이터의 요약 정보나 특정 상태를 URL에 포함
            params.set('nodeCount', props.graphData.nodes?.length || 0);
        }

        const url = `${window.location.origin}/graph-view?${params.toString()}`;

        const newWindow = window.open(
            url,
            '_blank',
            'width=1200,height=800,scrollbars=no,resizable=yes'
        );

        // 새 창과의 통신을 위한 메시지 리스너 (선택사항)
        const handleMessage = (event) => {
            if (event.source === newWindow) {
                // 새 창에서 보낸 메시지 처리
                console.log('Message from standalone window:', event.data);
            }
        };

        window.addEventListener('message', handleMessage);

        // 새 창이 닫히면 리스너 제거
        const checkClosed = setInterval(() => {
            if (newWindow.closed) {
                window.removeEventListener('message', handleMessage);
                clearInterval(checkClosed);
            }
        }, 1000);
    };


    return (
        <div className="graph-view-wrapper">
            <div className="graph-with-button">
                <GraphView {...props} isFullscreen={isFullscreen} referencedNodes={props.referencedNodes}
                    focusNodeNames={props.focusNodeNames} />
                <button className="fullscreen-btn" onClick={openExternalGraphWindow}>
                    {!isFullscreen && (<MdFullscreen size={22} color='black' title='전체화면' />)}
                </button>
            </div>
        </div>
    );
}

export default GraphViewWithModal;
