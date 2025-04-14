import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import HighlightPopup from './HighlightPopup';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const PDFViewer = ({ file, containerWidth }) => {
  const [numPages, setNumPages] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [popup, setPopup] = useState(null);
  const viewerRef = useRef(null);
  const [scale, setScale] = useState(1.5);

  useEffect(() => {
    if (containerWidth > 0) {
      const newScale = Math.max(containerWidth / 800, 1); // 최소 1
      setScale(newScale);
    }
  }, [containerWidth]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const onTextSelection = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (selection.toString().length === 0) return;

    const rect = range.getBoundingClientRect();

    setPopup({
      position: { x: rect.left + window.scrollX, y: rect.bottom + window.scrollY },
      range,
      text: selection.toString(),
    });
  };

  const addHighlight = (color) => {
    if (!popup) return;

    const rects = Array.from(popup.range.getClientRects());
    let container = popup.range.startContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }

    const pageDiv = container.closest('.react-pdf__Page');
    if (!pageDiv) return;

    const pageNumber = parseInt(pageDiv.getAttribute('data-page-number'), 10);
    const canvas = pageDiv.querySelector('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    const scaledPositions = rects.map(rect => ({
      x1: (rect.left - canvasRect.left) / canvasRect.width,
      y1: (rect.top - canvasRect.top) / canvasRect.height,
      x2: ((rect.left + rect.width) - canvasRect.left) / canvasRect.width,
      y2: ((rect.top + rect.height) - canvasRect.top) / canvasRect.height,
    }));

    setHighlights(prev => [
      ...prev,
      { page: pageNumber, positions: scaledPositions, color }
    ]);

    setPopup(null);
    window.getSelection().removeAllRanges();
  };

  const copyText = () => {
    if (!popup) return;
    navigator.clipboard.writeText(popup.text);
    setPopup(null);
    window.getSelection().removeAllRanges();
  };

  return (
    <div
      onMouseUp={onTextSelection}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      ref={viewerRef}
    >
      {popup && (
        <HighlightPopup
          position={popup.position}
          onSelectColor={addHighlight}
          onCopyText={copyText}
        />
      )}

      {/* 확대/축소 버튼 플로팅 */}
      <div style={{
        position: 'sticky',
        top: 12,
        right: 12,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#ffffffcc',
        borderRadius: '6px',
        padding: '6px 10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        fontSize: '14px',
        fontWeight: 500,
        justifyContent: 'flex-end',
        marginLeft: 'auto',
        marginBottom: '12px',
        width: 'fit-content',
      }}>
        <button
          onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
          style={{
            background: '#4a4a4a',
            border: 'none',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          축소
        </button>
        <button
          onClick={() => setScale(prev => Math.min(prev + 0.2, 3))}
          style={{
            background: '#4a4a4a',
            border: 'none',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          확대
        </button>
        <span style={{ color: '#333', minWidth: '40px', textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
      </div>

      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from({ length: numPages }, (_, index) => (
          <div key={`page_${index + 1}`} style={{ position: 'relative' }}>
            <Page
              pageNumber={index + 1}
              scale={scale}
              renderTextLayer={true}
            />
            {highlights
              .filter(h => h.page === index + 1)
              .flatMap((h, idx) => h.positions.map((pos, innerIdx) => {
                const pageDiv = viewerRef.current?.querySelector(`.react-pdf__Page[data-page-number="${h.page}"]`);
                const canvas = pageDiv?.querySelector('canvas');
                const canvasRect = canvas?.getBoundingClientRect();
                if (!canvasRect) return null;
                return (
                  <div
                    key={`${idx}-${innerIdx}`}
                    style={{
                      position: 'absolute',
                      left: `${pos.x1 * canvasRect.width}px`,
                      top: `${pos.y1 * canvasRect.height}px`,
                      width: `${(pos.x2 - pos.x1) * canvasRect.width}px`,
                      height: `${(pos.y2 - pos.y1) * canvasRect.height}px`,
                      backgroundColor: h.color,
                      opacity: 0.5,
                      borderRadius: '4px',
                      pointerEvents: 'none',
                    }}
                  />
                );
              }))}
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;
