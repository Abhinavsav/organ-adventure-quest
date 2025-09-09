import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Target, Volume2, VolumeX, Music, MicOff } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  timeLeft: number;
  placedCount: number;
  totalCount: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  timeLeft,
  placedCount,
  totalCount,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeColor = timeLeft <= 30 ? 'text-destructive' : timeLeft <= 60 ? 'text-warning' : 'text-foreground';

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Score */}
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold text-foreground">{score}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>

          {/* Center: Progress and Title */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-lg font-bold text-foreground hidden sm:block">
              Human Body Puzzle
            </h1>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-success" />
              <span className="text-lg font-semibold text-foreground">
                {placedCount} / {totalCount}
              </span>
            </div>
          </div>

          {/* Right: Timer and Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft <= 30 ? 'text-destructive animate-pulse' : 'text-warning'}`} />
              <span className={`text-xl font-bold ${timeColor}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSound}
                className="p-2 hover:bg-muted"
                aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMusic}
                className="p-2 hover:bg-muted"
                aria-label={musicEnabled ? 'Disable background music' : 'Enable background music'}
              >
                {musicEnabled ? (
                  <Music className="w-4 h-4 text-primary" />
                ) : (
                  <MicOff className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};