import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, RotateCcw, Star } from 'lucide-react';

interface EndScreenProps {
  isWin: boolean;
  finalScore: number;
  placedCount: number;
  totalCount: number;
  timeBonus?: number;
  onPlayAgain: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({
  isWin,
  finalScore,
  placedCount,
  totalCount,
  timeBonus = 0,
  onPlayAgain
}) => {
  const getPerformanceRating = () => {
    const percentage = (placedCount / totalCount) * 100;
    if (percentage === 100) return { text: 'Perfect!', color: 'text-success', stars: 3 };
    if (percentage >= 80) return { text: 'Excellent!', color: 'text-primary', stars: 3 };
    if (percentage >= 60) return { text: 'Good job!', color: 'text-warning', stars: 2 };
    return { text: 'Keep trying!', color: 'text-muted-foreground', stars: 1 };
  };

  const rating = getPerformanceRating();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-card border-border shadow-2xl max-w-md w-full">
        <div className="p-8 text-center">
          {/* Header */}
          <div className="mb-6">
            {isWin ? (
              <>
                <Trophy className="w-16 h-16 mx-auto mb-4 text-success animate-bounce" />
                <h2 className="text-3xl font-bold text-success mb-2">
                  Congratulations!
                </h2>
                <p className="text-muted-foreground">
                  You placed all organs correctly!
                </p>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 mx-auto mb-4 text-warning" />
                <h2 className="text-3xl font-bold text-warning mb-2">
                  Time's Up!
                </h2>
                <p className="text-muted-foreground">
                  Good effort! Practice makes perfect!
                </p>
              </>
            )}
          </div>

          {/* Performance Rating */}
          <div className="mb-6">
            <div className="flex justify-center mb-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < rating.stars
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <p className={`text-lg font-semibold ${rating.color}`}>
              {rating.text}
            </p>
          </div>

          {/* Score Details */}
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center text-lg">
              <span className="text-muted-foreground">Final Score:</span>
              <span className="text-2xl font-bold text-primary">{finalScore}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Organs Placed:</span>
              <span className="text-xl font-semibold text-foreground">
                {placedCount} / {totalCount}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accuracy:</span>
              <span className="text-lg font-semibold text-foreground">
                {Math.round((placedCount / totalCount) * 100)}%
              </span>
            </div>

            {timeBonus > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time Bonus:</span>
                <span className="text-lg font-semibold text-success">
                  +{timeBonus}
                </span>
              </div>
            )}
          </div>

          {/* Educational Message */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {isWin 
                ? "Amazing! You've mastered human anatomy placement. Try again to beat your time!"
                : `You placed ${placedCount} out of ${totalCount} organs correctly. Each organ has a specific location in the human body. Keep practicing!`
              }
            </p>
          </div>

          {/* Play Again Button */}
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </Card>
    </div>
  );
};