'use client';

import React from 'react';
import { Button } from '@/components';
import { MoveDown, MoveUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RenderSectionWrapperPortalProps {
  sectionKey: string;
  component: React.ReactNode;
  isSelected: boolean;
  currentOrder: string[];
  onSectionClick: (sectionKey: string) => void;
  onMoveSection: (direction: 'up' | 'down') => void;
}

export const renderSectionWrapperPortal = ({
  sectionKey,
  component,
  isSelected,
  currentOrder,
  onSectionClick,
  onMoveSection,
}: RenderSectionWrapperPortalProps) => {
  const currentIndex = currentOrder.indexOf(sectionKey);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < currentOrder.length - 1;

  return (
    <div
      key={`section-wrapper-portal-${sectionKey}`}
      className={cn(
        'section-wrapper relative cursor-pointer rounded-md border-2 border-transparent transition-all duration-200',
        isSelected && 'border-blue-500 bg-blue-50 p-2 shadow-lg dark:border-blue-400 dark:bg-blue-950'
      )}
      onClick={e => {
        e.stopPropagation();
        onSectionClick(sectionKey);
      }}
      title={`Click to select "${sectionKey}" section`}
    >
      {component}

      {isSelected && (
        <div
          key={`buttons-${sectionKey}`}
          className="absolute right-2 top-2 flex flex-col gap-1 rounded-md border bg-white p-2 shadow-xl"
          style={{
            zIndex: 999999,
            position: 'absolute',
            right: '8px',
            top: '8px',
            backgroundColor: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="mb-1 text-center text-xs font-bold text-blue-600">🎯 {sectionKey}</div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className={cn(
              'min-h-[32px] border-green-500 bg-green-100 font-semibold text-green-800 hover:bg-green-200',
              !canMoveUp && 'cursor-not-allowed opacity-50'
            )}
            onClick={e => {
              e.stopPropagation();
              onMoveSection('up');
            }}
            disabled={!canMoveUp}
            title="Move section up"
          >
            <MoveUp size={14} />
            <span className="ml-1 text-xs">UP</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className={cn(
              'min-h-[32px] border-blue-500 bg-blue-100 font-semibold text-blue-800 hover:bg-blue-200',
              !canMoveDown && 'cursor-not-allowed opacity-50'
            )}
            onClick={e => {
              e.stopPropagation();
              onMoveSection('down');
            }}
            disabled={!canMoveDown}
            title="Move section down"
          >
            <MoveDown size={14} />
            <span className="ml-1 text-xs">DOWN</span>
          </Button>
        </div>
      )}
    </div>
  );
};
