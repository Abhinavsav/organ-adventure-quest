import React, { useState, useRef, useCallback } from 'react';

interface OrganPieceProps {
  id: string;
  image: string;
  label: string;
  placed: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
}

export const OrganPiece: React.FC<OrganPieceProps> = ({
  id,
  image,
  label,
  placed,
  onDragStart,
  onDragEnd,
  onDragMove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isShaking, setIsShaking] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Trigger shake animation for wrong placement feedback
  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (placed) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDragPosition({ x: e.clientX - offsetX, y: e.clientY - offsetY });
    setIsDragging(true);
    
    // Capture pointer to ensure we get all move/up events
    e.currentTarget.setPointerCapture(e.pointerId);
    
    onDragStart(id);
  }, [placed, id, onDragStart]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };
    
    setDragPosition(newPosition);
    onDragMove(e.clientX, e.clientY);
  }, [isDragging, dragOffset, onDragMove]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    setIsDragging(false);
    
    // Release pointer capture
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    onDragEnd(id, e.clientX, e.clientY);
  }, [isDragging, id, onDragEnd]);

  // Keyboard accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (placed) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // For keyboard users, we'll trigger a placement attempt at the center of the organ's target
      // This is a simplified approach - in a full implementation, you might want arrow key movement
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        onDragEnd(id, centerX, centerY);
      }
    }
  }, [placed, id, onDragEnd]);

  // Note: triggerShake method available for parent component if needed

  if (placed) return null;

  return (
    <>
      {/* Draggable organ in tray */}
      <div
        ref={elementRef}
        className={`
          relative bg-card border-2 border-border rounded-lg p-3 cursor-grab active:cursor-grabbing
          transition-all duration-200 hover:border-primary hover:shadow-lg hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isShaking ? 'animate-shake' : ''}
          ${isDragging ? 'opacity-50 scale-110' : ''}
        `}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Drag ${label} to body`}
        style={{
          touchAction: 'none', // Prevent scrolling on touch devices during drag
        }}
      >
        <img
          src={image}
          alt={label}
          className="w-full aspect-square object-contain mb-2 pointer-events-none"
          draggable={false}
        />
        <p className="text-xs text-center font-medium text-foreground">
          {label}
        </p>
      </div>

      {/* Floating dragged organ */}
      {isDragging && (
        <div
          className="fixed pointer-events-none z-50 transition-transform duration-100"
          style={{
            left: dragPosition.x - 24, // Center the 48px (w-12) image
            top: dragPosition.y - 24,
            transform: 'translate3d(0, 0, 0) scale(1.1)',
          }}
        >
          <img
            src={image}
            alt={label}
            className="w-12 h-12 object-contain drop-shadow-lg animate-pulse"
            style={{
              filter: 'drop-shadow(0 8px 16px hsl(var(--primary) / 0.4))',
            }}
          />
        </div>
      )}
    </>
  );
};