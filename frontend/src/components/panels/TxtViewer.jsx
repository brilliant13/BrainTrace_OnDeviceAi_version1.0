// src/components/panels/TxtViewer.jsx
import React, { useEffect, useState } from 'react';
import './styles/TxtViewer.css';

export default function TxtViewer({ fileUrl }) {
    const [content, setContent] = useState('');

    useEffect(() => {
        fetch(fileUrl)
            .then(res => res.text())
            .then(setContent)
            .catch(err => {
                console.error("TXT 파일 로드 실패", err);
                setContent('[텍스트 파일을 불러올 수 없습니다]');
            });
    }, [fileUrl]);

    return (
        <div className="txt-viewer">
            <pre className="txt-content">{content}</pre>
        </div>
    );
}
