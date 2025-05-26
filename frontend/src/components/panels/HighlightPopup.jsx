import React, { useState, useEffect, useRef } from 'react';

const colors = ['#fff7a3', '#ffd8c2', '#c9ffd9', '#cfe9ff', '#f2ccff'];

const HighlightPopup = ({ position, containerRef, onSelectColor, onCopyText, onClose }) => {
  const popupRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [currentPos, setCurrentPos] = useState({
    x: position.x,
    y: position.y + (containerRef?.current?.scrollTop || 0)
  });

  // ✅ 드래그하지 않은 경우에만 position으로 위치 초기화
  useEffect(() => {
    if (!dragging) {
      setCurrentPos({
        x: position.x,
        y: position.y + (containerRef?.current?.scrollTop || 0)
      });
    }
  }, [position]);

  // ✅ 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose?.(); // 외부 클릭 시 onClose 호출
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);


  const handleMouseDown = (e) => {
    e.preventDefault();
    const popupRect = popupRef.current?.getBoundingClientRect();
    if (!popupRect) return;

    setDragOffset({
      x: e.clientX - popupRect.left,
      y: e.clientY - popupRect.top
    });
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const scrollTop = containerRef?.current?.scrollTop || window.scrollY || 0;
    const scrollLeft = containerRef?.current?.scrollLeft || window.scrollX || 0;
    const containerRect = containerRef?.current?.getBoundingClientRect();

    const baseX = containerRect ? containerRect.left : 0;
    const baseY = containerRect ? containerRect.top : 0;

    setCurrentPos({
      x: e.clientX - baseX - dragOffset.x + scrollLeft,
      y: e.clientY - baseY - dragOffset.y + scrollTop
    });
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const style = {
    position: 'absolute',
    left: currentPos.x,
    top: currentPos.y,
    padding: '10px 14px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #e6e8eb',
    cursor: dragging ? 'grabbing' : 'grab'
  };

  const circleStyle = (color) => ({
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: color,
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  });

  return (
    <div ref={popupRef} style={style} onMouseDown={handleMouseDown}>
      {colors.map((color) => (
        <div
          key={color}
          style={circleStyle(color)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectColor(color);
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      ))}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCopyText();
        }}
        style={{
          border: 'none',
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        복사
      </button>
    </div>
  );
};

export default HighlightPopup;
