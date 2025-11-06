import { useState, useRef, useEffect } from 'react';
import AnimatedEye from './AnimatedEye';
import './AdjustableEye.css';

const AdjustableEye = ({ adjustMode = true }) => {
  const [position, setPosition] = useState({ top: 47.0, right: 21.4 });
  const [size, setSize] = useState({ width: 69, height: 69 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const parentRef = useRef(null);

  useEffect(() => {
    if (!adjustMode) return;

    const handleMouseMove = (e) => {
      if (isDragging && parentRef.current) {
        const parentRect = parentRef.current.getBoundingClientRect();
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        const newTop = position.top + (deltaY / parentRect.height) * 100;
        const newRight = position.right - (deltaX / parentRect.width) * 100;

        setPosition({
          top: Math.max(0, Math.min(100, newTop)),
          right: Math.max(0, Math.min(100, newRight))
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        setSize({
          width: Math.max(20, size.width + deltaX),
          height: Math.max(20, size.height + deltaX)
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, position, size]);

  useEffect(() => {
    // Find the parent container
    const findParent = () => {
      if (containerRef.current) {
        const parent = containerRef.current.closest('.main-title-container');
        if (parent) {
          parentRef.current = parent;
        }
      }
    };
    findParent();
  }, []);

  const handleMouseDown = (e) => {
    if (!adjustMode) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseDown = (e) => {
    if (!adjustMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const copyToClipboard = () => {
    const config = `Position: top: ${position.top.toFixed(1)}%, right: ${position.right.toFixed(1)}%
Size: width: ${size.width}px, height: ${size.height}px`;
    navigator.clipboard.writeText(config);
    alert('Position and size copied to clipboard!');
  };

  if (!adjustMode) {
    return (
      <div
        className="eye-overlay"
        style={{
          top: `${position.top}%`,
          right: `${position.right}%`,
          width: `${size.width}px`,
          height: `${size.height}px`
        }}
      >
        <AnimatedEye />
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="eye-overlay adjustable-eye"
        style={{
          top: `${position.top}%`,
          right: `${position.right}%`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          border: '2px dashed #ff0000',
          background: 'rgba(255, 0, 0, 0.1)'
        }}
        onMouseDown={handleMouseDown}
      >
        <AnimatedEye />

        {/* Resize handle */}
        <div
          className="resize-handle"
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            bottom: '-5px',
            right: '-5px',
            width: '15px',
            height: '15px',
            background: '#ff0000',
            cursor: 'nwse-resize',
            borderRadius: '50%',
            border: '2px solid white',
            zIndex: 1000
          }}
        />
      </div>

      {/* Control panel */}
      <div
        style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '2px solid #ff0000',
          borderRadius: '8px',
          padding: '15px',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '12px',
          zIndex: 10000,
          minWidth: '250px'
        }}
      >
        <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#ff0000' }}>
          EYE ADJUSTMENT MODE
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Position:</strong>
        </div>
        <div>top: {position.top.toFixed(1)}%</div>
        <div>right: {position.right.toFixed(1)}%</div>

        <div style={{ marginTop: '10px', marginBottom: '5px' }}>
          <strong>Size:</strong>
        </div>
        <div>width: {size.width}px</div>
        <div>height: {size.height}px</div>

        <button
          onClick={copyToClipboard}
          style={{
            marginTop: '15px',
            padding: '8px 12px',
            background: '#ff0000',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '4px',
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          Copy Values
        </button>

        <div style={{ marginTop: '10px', fontSize: '10px', color: '#888' }}>
          Drag to move, use bottom-right handle to resize
        </div>
      </div>
    </>
  );
};

export default AdjustableEye;
