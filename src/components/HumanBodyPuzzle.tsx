import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Clock, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import organ images
import humanBodyOutline from '@/assets/human-body-outline.png';
import heartImg from '@/assets/heart.png';
import lungsImg from '@/assets/lungs.png';
import brainImg from '@/assets/brain.png';
import stomachImg from '@/assets/stomach.png';
import kidneysImg from '@/assets/kidneys.png';
import liverImg from '@/assets/liver.png';
import intestinesImg from '@/assets/intestines.png';

interface Organ {
  id: string;
  name: string;
  image: string;
  correctPosition: { x: number; y: number; tolerance: number };
  placed: boolean;
  currentPosition?: { x: number; y: number };
}

interface DragState {
  isDragging: boolean;
  draggedOrgan: string | null;
  offset: { x: number; y: number };
  currentPosition: { x: number; y: number };
}

const ORGANS: Organ[] = [
  {
    id: 'brain',
    name: 'Brain',
    image: brainImg,
    correctPosition: { x: 50, y: 15, tolerance: 8 }, // Head area (percentage)
    placed: false,
  },
  {
    id: 'heart',
    name: 'Heart',
    image: heartImg,
    correctPosition: { x: 45, y: 35, tolerance: 8 }, // Left chest area
    placed: false,
  },
  {
    id: 'lungs',
    name: 'Lungs',
    image: lungsImg,
    correctPosition: { x: 50, y: 35, tolerance: 10 }, // Chest area
    placed: false,
  },
  {
    id: 'liver',
    name: 'Liver',
    image: liverImg,
    correctPosition: { x: 55, y: 45, tolerance: 8 }, // Right upper abdomen
    placed: false,
  },
  {
    id: 'stomach',
    name: 'Stomach',
    image: stomachImg,
    correctPosition: { x: 45, y: 50, tolerance: 8 }, // Left upper abdomen
    placed: false,
  },
  {
    id: 'kidneys',
    name: 'Kidneys',
    image: kidneysImg,
    correctPosition: { x: 50, y: 55, tolerance: 10 }, // Mid-back area
    placed: false,
  },
  {
    id: 'intestines',
    name: 'Intestines',
    image: intestinesImg,
    correctPosition: { x: 50, y: 65, tolerance: 10 }, // Lower abdomen
    placed: false,
  },
];

const GAME_DURATION = 120; // 2 minutes

export const HumanBodyPuzzle: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [organs, setOrgans] = useState<Organ[]>(ORGANS);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedOrgan: null,
    offset: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shakeOrgan, setShakeOrgan] = useState<string | null>(null);
  
  const gameboardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Audio context for sound effects
  const playSound = useCallback((frequency: number, duration: number, type: 'success' | 'error') => {
    if (!soundEnabled) return;
    
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
  }, [soundEnabled]);

  const startGame = () => {
    setGameState('playing');
    setOrgans(ORGANS.map(organ => ({ ...organ, placed: false, currentPosition: undefined })));
    setScore(0);
    setTimeLeft(GAME_DURATION);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          setGameState('finished');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState('menu');
    setOrgans(ORGANS.map(organ => ({ ...organ, placed: false, currentPosition: undefined })));
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setDragState({
      isDragging: false,
      draggedOrgan: null,
      offset: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
    });
  };

  const handleMouseDown = (e: React.MouseEvent, organId: string) => {
    const organ = organs.find(o => o.id === organId);
    if (!organ || organ.placed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragState({
      isDragging: true,
      draggedOrgan: organId,
      offset: { x: offsetX, y: offsetY },
      currentPosition: { x: e.clientX - offsetX, y: e.clientY - offsetY },
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedOrgan) return;

    setDragState(prev => ({
      ...prev,
      currentPosition: {
        x: e.clientX - prev.offset.x,
        y: e.clientY - prev.offset.y,
      },
    }));
  }, [dragState.isDragging, dragState.draggedOrgan]);

  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedOrgan || !gameboardRef.current) return;

    const gameboardRect = gameboardRef.current.getBoundingClientRect();
    const relativeX = ((dragState.currentPosition.x - gameboardRect.left) / gameboardRect.width) * 100;
    const relativeY = ((dragState.currentPosition.y - gameboardRect.top) / gameboardRect.height) * 100;

    const draggedOrgan = organs.find(o => o.id === dragState.draggedOrgan);
    if (!draggedOrgan) return;

    const distanceX = Math.abs(relativeX - draggedOrgan.correctPosition.x);
    const distanceY = Math.abs(relativeY - draggedOrgan.correctPosition.y);
    const isCorrect = distanceX <= draggedOrgan.correctPosition.tolerance && 
                     distanceY <= draggedOrgan.correctPosition.tolerance;

    if (isCorrect) {
      // Correct placement
      setOrgans(prev => prev.map(organ => 
        organ.id === dragState.draggedOrgan 
          ? { ...organ, placed: true, currentPosition: draggedOrgan.correctPosition }
          : organ
      ));
      setScore(prev => prev + 10);
      playSound(880, 0.3, 'success');
      toast({
        title: "Great job!",
        description: `${draggedOrgan.name} placed correctly! +10 points`,
        className: "bg-gradient-success text-success-foreground border-success",
      });

      // Check if game is won
      const updatedOrgans = organs.map(organ => 
        organ.id === dragState.draggedOrgan 
          ? { ...organ, placed: true }
          : organ
      );
      
      if (updatedOrgans.every(organ => organ.placed)) {
        setTimeout(() => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setGameState('finished');
        }, 500);
      }
    } else {
      // Incorrect placement
      setScore(prev => Math.max(0, prev - 2));
      playSound(220, 0.2, 'error');
      setShakeOrgan(dragState.draggedOrgan);
      setTimeout(() => setShakeOrgan(null), 500);
      toast({
        title: "Try again!",
        description: `${draggedOrgan.name} isn't quite right. -2 points`,
        variant: "destructive",
        className: "bg-gradient-radial from-error/20 to-error/10 border-error text-error-foreground",
      });
    }

    setDragState({
      isDragging: false,
      draggedOrgan: null,
      offset: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
    });
  }, [dragState, organs, playSound, toast]);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const placedOrgansCount = organs.filter(organ => organ.placed).length;
  const totalOrgans = organs.length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <Card className="bg-gradient-card shadow-game border-0 p-8 text-center max-w-md w-full">
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-game bg-clip-text text-transparent mb-2">
              Human Body Puzzle
            </h1>
            <p className="text-muted-foreground text-lg">
              Learn anatomy by placing organs in the correct positions!
            </p>
          </div>
          
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>Drag & drop organs to correct body parts</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Trophy className="w-4 h-4" />
              <span>+10 points correct, -2 points wrong</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>2 minutes to complete</span>
            </div>
          </div>

          <Button 
            onClick={startGame}
            size="lg"
            className="bg-gradient-game hover:shadow-game transition-all duration-300 text-white border-0"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </Button>
        </Card>
      </div>
    );
  }

  if (gameState === 'finished') {
    const isWin = placedOrgansCount === totalOrgans;
    const finalScore = score + (isWin ? timeLeft : 0); // Bonus points for remaining time

    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <Card className="bg-gradient-card shadow-game border-0 p-8 text-center max-w-md w-full">
          <div className="mb-6">
            {isWin ? (
              <>
                <Trophy className="w-16 h-16 mx-auto mb-4 text-success animate-bounce-success" />
                <h2 className="text-3xl font-bold text-success mb-2">Congratulations!</h2>
                <p className="text-muted-foreground">You placed all organs correctly!</p>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 mx-auto mb-4 text-warning" />
                <h2 className="text-3xl font-bold text-warning mb-2">Time's Up!</h2>
                <p className="text-muted-foreground">Good effort! Try again to improve!</p>
              </>
            )}
          </div>

          <div className="mb-8 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Final Score:</span>
              <span className="text-2xl font-bold text-primary">{finalScore}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Organs Placed:</span>
              <span className="text-xl font-semibold">{placedOrgansCount}/{totalOrgans}</span>
            </div>
            {isWin && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time Bonus:</span>
                <span className="text-lg font-semibold text-success">+{timeLeft}</span>
              </div>
            )}
          </div>

          <Button 
            onClick={resetGame}
            size="lg"
            className="bg-gradient-game hover:shadow-game transition-all duration-300 text-white border-0"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      {/* Header with score, timer, and controls */}
      <div className="max-w-6xl mx-auto mb-4">
        <Card className="bg-gradient-card shadow-game border-0 p-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-xl font-bold">{score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                <span className="text-lg">{placedOrgansCount}/{totalOrgans}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetGame}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Game Area */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Human Body */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-card shadow-game border-0 p-6 h-[600px] relative overflow-hidden">
              <div 
                ref={gameboardRef}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img 
                  src={humanBodyOutline}
                  alt="Human body outline"
                  className="max-w-full max-h-full object-contain opacity-80"
                />
                
                {/* Placed organs */}
                {organs.filter(organ => organ.placed).map(organ => (
                  <div
                    key={`placed-${organ.id}`}
                    className="absolute pointer-events-none animate-bounce-success"
                    style={{
                      left: `${organ.currentPosition?.x || organ.correctPosition.x}%`,
                      top: `${organ.currentPosition?.y || organ.correctPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <img 
                      src={organ.image} 
                      alt={organ.name}
                      className="w-12 h-12 object-contain shadow-success rounded-lg"
                    />
                  </div>
                ))}

                {/* Dragged organ */}
                {dragState.isDragging && dragState.draggedOrgan && (
                  <div
                    className="fixed pointer-events-none z-50 transition-transform duration-100"
                    style={{
                      left: dragState.currentPosition.x,
                      top: dragState.currentPosition.y,
                      transform: 'translate(-50%, -50%) scale(1.1)',
                    }}
                  >
                    <img 
                      src={organs.find(o => o.id === dragState.draggedOrgan)?.image} 
                      alt=""
                      className="w-12 h-12 object-contain shadow-organ rounded-lg animate-pulse-glow"
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Organ Tray */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card shadow-game border-0 p-4">
              <h3 className="text-lg font-semibold mb-4 text-center">Drag Organs</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {organs.filter(organ => !organ.placed).map(organ => (
                  <div
                    key={organ.id}
                    className={`relative cursor-grab active:cursor-grabbing p-3 rounded-lg bg-gradient-card border-2 border-border hover:border-primary transition-all duration-200 hover:shadow-organ hover:scale-105 ${
                      shakeOrgan === organ.id ? 'animate-shake' : ''
                    } ${
                      dragState.draggedOrgan === organ.id ? 'opacity-50' : ''
                    }`}
                    onMouseDown={(e) => handleMouseDown(e, organ.id)}
                  >
                    <img 
                      src={organ.image} 
                      alt={organ.name}
                      className="w-full aspect-square object-contain mb-2"
                    />
                    <p className="text-xs text-center font-medium text-muted-foreground">
                      {organ.name}
                    </p>
                  </div>
                ))}
              </div>
              
              {organs.filter(organ => !organ.placed).length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-success animate-float" />
                  <p className="text-sm text-success font-medium">All organs placed!</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanBodyPuzzle;