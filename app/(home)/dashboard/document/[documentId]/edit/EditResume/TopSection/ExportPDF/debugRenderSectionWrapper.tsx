'use client';

import React from 'react';
import { Button } from '@/components';
import { MoveDown, MoveUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebugRenderSectionWrapperProps {
  sectionKey: string;
  component: React.ReactNode;
  isSelected: boolean;
  currentOrder: string[];
  onSectionClick: (sectionKey: string) => void;
  onMoveSection: (direction: 'up' | 'down') => void;
}

export const debugRenderSectionWrapper = ({
  sectionKey,
  component,
  isSelected,
  currentOrder,
  onSectionClick,
  onMoveSection,
}: DebugRenderSectionWrapperProps) => {
  const currentIndex = currentOrder.indexOf(sectionKey);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < currentOrder.length - 1;
  
  console.log(`DEBUG renderSectionWrapper: ${sectionKey}, isSelected: ${isSelected}, canMoveUp: ${canMoveUp}, canMoveDown: ${canMoveDown}`);

  return (
    <div
      key={`debug-section-wrapper-${sectionKey}`}
      className={cn(
        'section-wrapper relative cursor-pointer rounded-md transition-all duration-200',
        isSelected && 'bg-blue-50 p-2 ring-2 ring-blue-500 ring-opacity-50 dark:bg-blue-950 dark:ring-blue-400'
      )}
      onClick={e => {
        e.stopPropagation();
        console.log('DEBUG: Section clicked:', sectionKey);
        onSectionClick(sectionKey);
      }}
      title={`Click to select "${sectionKey}" section`}
    >
      {component}

      {isSelected && (
        <div 
          key={`debug-buttons-${sectionKey}`}
          className="fixed right-4 top-4 flex flex-col gap-2 rounded-md border-4 border-red-500 bg-red-100 p-2 shadow-2xl"
          style={{ 
            zIndex: 99999,
            position: 'fixed',
            right: '20px',
            top: '20px',
            backgroundColor: '#fef2f2',
            border: '4px solid #ef4444',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="text-xs text-red-800 font-bold mb-1">
            DEBUG: {sectionKey}
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className={cn(
              'bg-green-200 border-green-500 hover:bg-green-300',
              !canMoveUp && 'cursor-not-allowed opacity-50'
            )}
            onClick={e => {
              e.stopPropagation();
              console.log('DEBUG: Move up clicked for:', sectionKey);
              onMoveSection('up');
            }}
            disabled={!canMoveUp}
            title="Move section up"
            style={{ backgroundColor: '#bbf7d0', borderColor: '#22c55e' }}
          >
            <MoveUp size={16} />
            <span className="ml-1">UP</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className={cn(
              'bg-blue-200 border-blue-500 hover:bg-blue-300',
              !canMoveDown && 'cursor-not-allowed opacity-50'
            )}
            onClick={e => {
              e.stopPropagation();
              console.log('DEBUG: Move down clicked for:', sectionKey);
              onMoveSection('down');
            }}
            disabled={!canMoveDown}
            title="Move section down"
            style={{ backgroundColor: '#bfdbfe', borderColor: '#3b82f6' }}
          >
            <MoveDown size={16} />
            <span className="ml-1">DOWN</span>
          </Button>
        </div>
      )}
    </div>
  );
};