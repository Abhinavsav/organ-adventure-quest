import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { OrganTray } from '@/components/OrganTray';
import { ScoreBoard } from '@/components/ScoreBoard';
import { EndScreen } from '@/components/EndScreen';
import { clientToSVGCoords, isWithinSnapDistance, Target } from '@/utils/snapUtils';
import { useToast } from '@/hooks/use-toast';

// Import organ images (using existing assets)
import brainImg from '@/assets/brain.png';
import heartImg from '@/assets/heart.png';
import lungsImg from '@/assets/lungs.png';
import liverImg from '@/assets/liver.png';
import stomachImg from '@/assets/stomach.png';
import kidneysImg from '@/assets/kidneys.png';
import intestinesImg from '@/assets/intestines.png';

// Game configuration
const GAME_DURATION = 120; // 2 minutes
const SNAP_FACTOR = 1.2;
const VIEWBOX_WIDTH = 400;
const VIEWBOX_HEIGHT = 700;

// Target positions in SVG coordinates (exact coordinates as specified)
const TARGETS: Target[] = [
  { id: 'brain', x: 200, y: 60, r: 46 },
  { id: 'left_lung', x: 150, y: 210, r: 44 },
  { id: 'right_lung', x: 250, y: 210, r: 44 },
  { id: 'heart', x: 200, y: 280, r: 36 },
  { id: 'liver', x: 260, y: 340, r: 44 },
  { id: 'stomach', x: 170, y: 360, r: 36 },
  { id: 'intestines', x: 200, y: 450, r: 60 },
];

// Organ definitions
interface Organ {
  id: string;
  name: string;
  image: string;
  placed: boolean;
  targetId: string;
}

const ORGANS: Organ[] = [
  { id: 'brain', name: 'Brain', image: brainImg, placed: false, targetId: 'brain' },
  { id: 'heart', name: 'Heart', image: heartImg, placed: false, targetId: 'heart' },
  { id: 'lungs', name: 'Lungs', image: lungsImg, placed: false, targetId: 'left_lung' }, // Will snap to either lung
  { id: 'liver', name: 'Liver', image: liverImg, placed: false, targetId: 'liver' },
  { id: 'stomach', name: 'Stomach', image: stomachImg, placed: false, targetId: 'stomach' },
  { id: 'kidneys', name: 'Kidneys', image: kidneysImg, placed: false, targetId: 'stomach' }, // Near stomach area
  { id: 'intestines', name: 'Intestines', image: intestinesImg, placed: false, targetId: 'intestines' },
];

const Index = () => {
  // Game state
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [organs, setOrgans] = useState<Organ[]>(ORGANS);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [highlightedTarget, setHighlightedTarget] = useState<string | null>(null);
  const [occupiedTargets, setOccupiedTargets] = useState<Set<string>>(new Set());

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Audio context for sound effects
  const playSound = useCallback((frequency: number, duration: number, type: 'success' | 'error') => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type === 'success' ? 'sine' : 'triangle';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, [soundEnabled]);

  // Start game timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          setGameState('finished');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Check win condition
  useEffect(() => {
    const placedCount = organs.filter(organ => organ.placed).length;
    if (placedCount === organs.length && gameState === 'playing') {
      setTimeout(() => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setGameState('finished');
      }, 500);
    }
  }, [organs, gameState]);

  // Drag handlers
  const handleDragStart = useCallback((organId: string) => {
    const organ = organs.find(o => o.id === organId);
    if (organ) {
      // Show hint for target location
      setHighlightedTarget(organ.targetId);
    }
  }, [organs]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    // Could add real-time proximity feedback here
  }, []);

  const handleDragEnd = useCallback((organId: string, clientX: number, clientY: number) => {
    setHighlightedTarget(null);
    
    if (!svgRef.current) return;

    // Convert client coordinates to SVG coordinates
    const svgPoint = clientToSVGCoords(
      clientX,
      clientY,
      svgRef.current,
      VIEWBOX_WIDTH,
      VIEWBOX_HEIGHT
    );

    const organ = organs.find(o => o.id === organId);
    if (!organ) return;

    // Check all targets for potential matches (allows lungs to snap to either side)
    let bestMatch: Target | null = null;
    let bestDistance = Infinity;

    // For lungs, check both lung targets
    const targetsToCheck = organ.id === 'lungs' 
      ? TARGETS.filter(t => t.id === 'left_lung' || t.id === 'right_lung')
      : TARGETS.filter(t => t.id === organ.targetId);

    for (const target of targetsToCheck) {
      // Skip if target is already occupied
      if (occupiedTargets.has(target.id)) continue;

      if (isWithinSnapDistance(svgPoint, target, SNAP_FACTOR)) {
        const distance = Math.sqrt(
          Math.pow(svgPoint.x - target.x, 2) + Math.pow(svgPoint.y - target.y, 2)
        );
        if (distance < bestDistance) {
          bestMatch = target;
          bestDistance = distance;
        }
      }
    }

    if (bestMatch) {
      // Correct placement
      setOrgans(prev => prev.map(o => 
        o.id === organId ? { ...o, placed: true, targetId: bestMatch.id } : o
      ));
      setOccupiedTargets(prev => new Set([...prev, bestMatch.id]));
      setScore(prev => prev + 10);
      playSound(880, 0.3, 'success');
      
      toast({
        title: "Perfect!",
        description: `${organ.name} placed correctly! +10 points`,
        className: "bg-success/10 border-success text-success-foreground",
      });
    } else {
      // Wrong placement
      setScore(prev => Math.max(0, prev - 2));
      playSound(220, 0.2, 'error');
      
      toast({
        title: "Try again!",
        description: `${organ.name} doesn't belong there. -2 points`,
        variant: "destructive",
      });
    }
  }, [organs, occupiedTargets, playSound, toast]);

  const handlePlayAgain = useCallback(() => {
    setGameState('playing');
    setOrgans(ORGANS.map(organ => ({ ...organ, placed: false })));
    setOccupiedTargets(new Set());
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setHighlightedTarget(null);

    // Restart timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          setGameState('finished');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, []);

  const placedCount = organs.filter(organ => organ.placed).length;
  const isWin = placedCount === organs.length;
  const finalScore = score + (isWin ? timeLeft : 0); // Time bonus for completion

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      {/* Score Board */}
      <div className="max-w-6xl mx-auto mb-4">
        <ScoreBoard
          score={score}
          timeLeft={timeLeft}
          placedCount={placedCount}
          totalCount={organs.length}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onToggleMusic={() => setMusicEnabled(!musicEnabled)}
        />
      </div>

      {/* Main Game Area */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <GameBoard
              svgRef={svgRef}
              targets={TARGETS}
              placedOrgans={organs.filter(organ => organ.placed)}
              highlightedTarget={highlightedTarget}
            />
          </div>

          {/* Organ Tray - Hidden on small screens, shown as sticky bottom on mobile */}
          <div className="lg:col-span-1 lg:block hidden">
            <div className="h-full">
              <OrganTray
                organs={organs}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Organ Tray - Sticky bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <OrganTray
          organs={organs}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
        />
      </div>

      {/* End Screen */}
      {gameState === 'finished' && (
        <EndScreen
          isWin={isWin}
          finalScore={finalScore}
          placedCount={placedCount}
          totalCount={organs.length}
          timeBonus={isWin ? timeLeft : 0}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default Index;
