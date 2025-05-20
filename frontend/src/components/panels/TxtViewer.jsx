// src/components/panels/TxtViewer.jsx
import React, { useEffect, useState, useRef } from 'react';
import HighlightPopup from './HighlightPopup'; // 이미 있는 컴포넌트
import './styles/TxtViewer.css';

export default function TxtViewer({ fileUrl }) {
    const [content, setContent] = useState('');
    const [popup, setPopup] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        fetch(fileUrl)
            .then(res => res.text())
            .then(setContent)
            .catch(err => {
                console.error("TXT 파일 로드 실패", err);
                setContent('[텍스트 파일을 불러올 수 없습니다]');
            });
    }, [fileUrl]);

    const onTextSelection = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount || !selection.toString()) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setPopup({
            position: {
                x: rect.left + window.scrollX,
                y: rect.bottom + window.scrollY,
            },
            range,
            text: selection.toString()
        });
    };

    const addHighlight = (color) => {
        if (!popup) return;
        const span = document.createElement('span');
        span.style.backgroundColor = color;
        span.style.borderRadius = '4px';
        span.style.padding = '0 2px';
        span.textContent = popup.text;

        const range = popup.range;
        range.deleteContents();
        range.insertNode(span);

        setHighlights(prev => [...prev, { text: popup.text, color }]);
        setPopup(null);
        window.getSelection().removeAllRanges();
    };

    const copyText = () => {
        if (popup) {
            navigator.clipboard.writeText(popup.text);
            setPopup(null);
            window.getSelection().removeAllRanges();
        }
    };

    return (
        <div
            className="txt-viewer"
            ref={containerRef}
            onMouseUp={onTextSelection}
            style={{ position: 'relative' }}
        >
            {popup && (
                <HighlightPopup
                    position={popup.position}
                    containerRef={containerRef}
                    onSelectColor={addHighlight}
                    onCopyText={copyText}
                />
            )}

            <pre className="txt-content" style={{ whiteSpace: 'pre-wrap' }}>
                {content}
            </pre>
        </div>
    );
}
