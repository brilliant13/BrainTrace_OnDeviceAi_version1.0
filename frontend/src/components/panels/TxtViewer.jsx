// src/components/panels/TxtViewer.jsx
import React, { useEffect, useState, useRef } from 'react';
import HighlightPopup from './HighlightPopup';
import './styles/TxtViewer.css';
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";


export default function TxtViewer({ fileUrl, onBack }) {
    const [content, setContent] = useState('');
    const [popup, setPopup] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const containerRef = useRef(null);
    const [fontSize, setFontSize] = useState(16);

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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'white',
                    padding: '10px 16px',
                    borderBottom: '1px solid #ddd'
                }}
            >
                <FaArrowLeftLong
                    onClick={onBack}
                    style={{ cursor: 'pointer', fontSize: '18px', color: '#333' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaMinus
                        onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                        style={{
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#333',
                            borderRadius: '4px',
                            padding: '2px',
                            border: '1px solid #ccc',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                    <FaPlus
                        onClick={() => setFontSize(prev => Math.min(prev + 2, 48))}
                        style={{
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#333',
                            borderRadius: '4px',
                            padding: '2px',
                            border: '1px solid #ccc',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                    <span style={{ minWidth: '45px', textAlign: 'center', fontSize: '15px' }}>{fontSize}px</span>
                </div>
            </div>

            {/* 🔽 본문 + 하이라이팅 */}
            <div
                className="txt-viewer"
                ref={containerRef}
                onMouseUp={onTextSelection}
                style={{ position: 'relative', flex: 1, overflowY: 'auto' }}
            >
                {popup && (
                    <HighlightPopup
                        position={popup.position}
                        containerRef={containerRef}
                        onSelectColor={addHighlight}
                        onCopyText={copyText}
                        onClose={() => {
                            setPopup(null);
                            window.getSelection().removeAllRanges();
                        }}
                    />
                )}

                <pre
                    className="txt-content"
                    style={{ whiteSpace: 'pre-wrap', fontSize: `${fontSize}px`, padding: '12px' }}
                >
                    {content}
                </pre>
            </div>
        </div>
    );

}
