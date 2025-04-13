
import React from 'react';

const colors = ['#fffd7a', '#ffac80', '#a1ffb7', '#a5d8ff', '#e599f7'];

const HighlightPopup = ({ position, onSelectColor, onCopyText }) => {
  const style = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    padding: '10px 14px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #e6e8eb',
    transition: 'opacity 0.3s ease',
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
    <div style={style}>
      {colors.map((color) => (
        <div
          key={color}
          style={circleStyle(color)}
          onClick={() => onSelectColor(color)}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      ))}
      <button
        onClick={onCopyText}
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
