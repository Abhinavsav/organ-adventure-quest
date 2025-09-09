import React, { useRef, useEffect } from 'react';
import { Target } from '@/utils/snapUtils';

// SVG body outline as inline SVG with proper viewBox
const HumanBodySVG = ({ targets, highlightedTarget }: { 
  targets: Target[], 
  highlightedTarget: string | null 
}) => (
  <svg
    viewBox="0 0 400 700"
    className="w-full h-full"
    style={{ maxHeight: '600px' }}
  >
    {/* Human body outline */}
    <path
      d="M200 50 C220 50 240 70 240 90 L240 120 C250 130 260 140 270 160 L280 180 C290 200 300 220 310 250 L320 280 C325 300 325 320 320 340 L310 380 C300 420 290 460 280 500 L270 540 C260 580 250 620 240 650 L200 680 C160 680 140 650 130 620 C120 580 110 540 100 500 L90 460 C80 420 70 380 60 340 C55 320 55 300 60 280 L70 250 C80 220 90 200 100 180 L110 160 C120 140 130 130 140 120 L140 90 C140 70 160 50 180 50 L200 50 Z"
      fill="none"
      stroke="hsl(var(--border))"
      strokeWidth="2"
      className="opacity-40"
    />
    
    {/* Target regions - show pulsing highlight when organ is being dragged */}
    {targets.map(target => (
      <circle
        key={target.id}
        cx={target.x}
        cy={target.y}
        r={target.r}
        fill="none"
        stroke={highlightedTarget === target.id ? "hsl(var(--primary))" : "transparent"}
        strokeWidth="3"
        className={highlightedTarget === target.id ? "animate-pulse opacity-60" : "opacity-20"}
        strokeDasharray={highlightedTarget === target.id ? "5,5" : "none"}
      />
    ))}
    
    {/* Body parts labels for educational value */}
    <text x="200" y="40" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="14">Head</text>
    <text x="200" y="180" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="12">Chest</text>
    <text x="200" y="320" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="12">Abdomen</text>
  </svg>
);

interface Organ {
  id: string;
  name: string;
  image: string;
  placed: boolean;
  targetId: string;
}

interface GameBoardProps {
  svgRef: React.RefObject<SVGSVGElement>;
  targets: Target[];
  placedOrgans: Organ[];
  highlightedTarget: string | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  svgRef,
  targets,
  placedOrgans,
  highlightedTarget
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-subtle rounded-lg border border-border/50">
      <div className="relative w-full max-w-md mx-auto" style={{ aspectRatio: '4/7' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 400 700"
          className="w-full h-full drop-shadow-sm"
          style={{ maxHeight: '600px' }}
        >
          <HumanBodySVG targets={targets} highlightedTarget={highlightedTarget} />
        </svg>
        
        {/* Render placed organs on the SVG */}
        {placedOrgans.map(organ => {
          const target = targets.find(t => t.id === organ.targetId);
          if (!target || !organ.placed) return null;
          
          return (
            <div
              key={`placed-${organ.id}`}
              className="absolute pointer-events-none"
              style={{
                left: `${(target.x / 400) * 100}%`,
                top: `${(target.y / 700) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <img
                src={organ.image}
                alt={organ.name}
                className="w-12 h-12 object-contain drop-shadow-lg animate-scale-in"
                style={{
                  filter: 'drop-shadow(0 4px 8px hsl(var(--primary) / 0.3))',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};