'use client';

import React from 'react';
import { Button } from '@/components';
import { MoveDown, MoveUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RenderSectionWrapperProps {
  sectionKey: string;
  component: React.ReactNode;
  isSelected: boolean;
  currentOrder: string[];
  onSectionClickAction: (sectionKey: string) => void;
  onMoveSectionAction: (direction: 'up' | 'down') => void;
  translations?: {
    moveSectionUp: string;
    moveSectionDown: string;
  };
}

export const renderSectionWrapper = ({
  sectionKey,
  component,
  isSelected,
  currentOrder,
  onSectionClickAction,
  onMoveSectionAction,
  translations,
}: RenderSectionWrapperProps) => {
  const currentIndex = currentOrder.indexOf(sectionKey);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < currentOrder.length - 1;

  return (
    <div
      key={`section-wrapper-${sectionKey}`}
      className={cn(
        'section-wrapper relative cursor-pointer rounded-md transition-all duration-200',
        isSelected && 'bg-blue-50 p-2 ring-2 ring-blue-500 ring-opacity-50 dark:bg-blue-950 dark:ring-blue-400'
      )}
      onClick={e => {
        e.stopPropagation();
        onSectionClickAction(sectionKey);
      }}
      title={`Click to select "${sectionKey}" section`}
    >
      {component}

      {isSelected && (
        <div
          key={`buttons-${sectionKey}`}
          className="absolute right-2 top-2 z-[60] flex flex-col gap-1 rounded-md border bg-white p-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
        >
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={cn(
              'size-6 hover:bg-gray-100 dark:hover:bg-gray-700',
              !canMoveUp && 'cursor-not-allowed opacity-50'
            )}
            onClick={e => {
              e.stopPropagation();
              onMoveSectionAction('up');
            }}
            disabled={!canMoveUp}
            title={translations?.moveSectionUp || 'Move section up'}
          >
            <MoveUp size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={cn(
              'size-6 hover:bg-gray-100 dark:hover:bg-gray-700',
              !canMoveDown && 'cursor-not-allowed opacity-50'
            )}
            onClick={e => {
              e.stopPropagation();
              onMoveSectionAction('down');
            }}
            disabled={!canMoveDown}
            title={translations?.moveSectionDown || 'Move section down'}
          >
            <MoveDown size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};
