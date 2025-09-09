import React from 'react';
import { OrganPiece } from './OrganPiece';
import { Card } from '@/components/ui/card';

interface Organ {
  id: string;
  name: string;
  image: string;
  placed: boolean;
  targetId: string;
}

interface OrganTrayProps {
  organs: Organ[];
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
}

export const OrganTray: React.FC<OrganTrayProps> = ({
  organs,
  onDragStart,
  onDragEnd,
  onDragMove
}) => {
  const availableOrgans = organs.filter(organ => !organ.placed);

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-center text-foreground">
          Drag Organs to Body
        </h3>
        
        {availableOrgans.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 max-w-4xl mx-auto">
            {availableOrgans.map(organ => (
              <OrganPiece
                key={organ.id}
                id={organ.id}
                image={organ.image}
                label={organ.name}
                placed={organ.placed}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragMove={onDragMove}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-lg font-medium text-success">
              All organs placed correctly!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};