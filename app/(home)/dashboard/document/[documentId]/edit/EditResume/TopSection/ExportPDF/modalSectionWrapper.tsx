'use client';

import React from 'react';
import { Button } from '@/components';
import { MoveDown, MoveUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalSectionWrapperProps {
  sectionKey: string;
  component: React.ReactNode;
  isSelected: boolean;
  currentOrder: string[];
  onSectionClick: (sectionKey: string) => void;
  onMoveSection: (direction: 'up' | 'down') => void;
}

export const modalSectionWrapper = ({
  sectionKey,
  component,
  isSelected,
  currentOrder,
  onSectionClick,
  onMoveSection,
}: ModalSectionWrapperProps) => {
  const currentIndex = currentOrder.indexOf(sectionKey);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < currentOrder.length - 1;

  console.log(
    `modalSectionWrapper: ${sectionKey}, isSelected: ${isSelected}, canMoveUp: ${canMoveUp}, canMoveDown: ${canMoveDown}`
  );

  return (
    <div
      key={`modal-section-wrapper-${sectionKey}`}
      className={cn(
        'section-wrapper relative cursor-pointer rounded-md border-2 border-transparent transition-all duration-200',
        isSelected &&
          'border-blue-500 bg-blue-50 p-2 shadow-lg ring-2 ring-blue-500 ring-opacity-50 dark:border-blue-400 dark:bg-blue-950 dark:ring-blue-400'
      )}
      onClick={e => {
        e.stopPropagation();
        console.log('Modal: Section clicked:', sectionKey);
        onSectionClick(sectionKey);
      }}
      title={`Click to select "${sectionKey}" section`}
    >
      {component}

      {isSelected && (
        <div
          key={`modal-buttons-${sectionKey}`}
          className="fixed left-4 top-1/2 flex -translate-y-1/2 transform flex-col gap-3 rounded-lg border-2 border-blue-500 bg-white p-4 shadow-2xl backdrop-blur-sm"
          style={{
            zIndex: 99999,
            position: 'fixed',
            left: '-16%',
            top: '12%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="mb-2 border-b border-blue-200 pb-2 text-center text-sm font-bold text-blue-800">
            📝 {sectionKey}
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className={cn(
              'min-w-[100px] border-emerald-400 bg-emerald-100 font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-200',
              !canMoveUp && 'cursor-not-allowed opacity-50'
            )}
            onClick={e => {
              e.stopPropagation();
              console.log('Modal: Move up clicked for:', sectionKey);
              onMoveSection('up');
            }}
            disabled={!canMoveUp}
            title="Move section up"
          >
            <MoveUp size={16} />
            <span className="ml-1">UP</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className={cn(
              'min-w-[100px] border-sky-400 bg-sky-100 font-semibold text-sky-800 shadow-sm transition-all hover:bg-sky-200',
              !canMoveDown && 'cursor-not-allowed opacity-50'
            )}
            onClick={e => {
              e.stopPropagation();
              console.log('Modal: Move down clicked for:', sectionKey);
              onMoveSection('down');
            }}
            disabled={!canMoveDown}
            title="Move section down"
          >
            <MoveDown size={16} />
            <span className="ml-1">DOWN</span>
          </Button>
        </div>
      )}
    </div>
  );
};
