'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components';
import { MoveDown, MoveUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateDocument, useGetDocumentById } from '@/hooks';
import { useParams } from 'next/navigation';
import { PaddingControls } from './PaddingControls';
import type { DocumentType, SectionPaddingsType } from '@/types';

interface ModalSectionWrapperProps {
  sectionKey: string;
  component: React.ReactNode;
  isSelected: boolean;
  currentOrder: string[];
  onSectionClick: (sectionKey: string) => void;
  onMoveSection: (direction: 'up' | 'down') => void;
}

export const ModalSectionWrapper = ({
  sectionKey,
  component,
  isSelected,
  currentOrder,
  onSectionClick,
  onMoveSection,
}: ModalSectionWrapperProps) => {
  const params = useParams();
  const documentId = params.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const documentData = data?.data as DocumentType;
  const { mutate: updateDocument } = useUpdateDocument();

  // Check if this is an individual experience item
  const isExperienceItem = sectionKey.startsWith('experience-');
  const experienceId = isExperienceItem ? sectionKey.replace('experience-', '') : null;

  const currentIndex = currentOrder.indexOf(sectionKey);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < currentOrder.length - 1;

  // For experience items, get individual padding from experience data
  const getInitialPadding = () => {
    if (isExperienceItem && experienceId) {
      const experience = documentData?.experiences?.find(
        exp => exp.id?.toString() === experienceId || exp.order?.toString() === experienceId
      );
      return {
        top: experience?.paddingTop || 0,
        bottom: experience?.paddingBottom || 0,
      };
    } else {
      // For sections, get from sectionPaddings
      const sectionPadding = documentData?.sectionPaddings?.[sectionKey as keyof SectionPaddingsType];
      return {
        top: sectionPadding?.paddingTop || 0,
        bottom: sectionPadding?.paddingBottom || 0,
      };
    }
  };

  const initialPadding = getInitialPadding();
  const [paddingTop, setPaddingTop] = useState<number>(initialPadding.top);
  const [paddingBottom, setPaddingBottom] = useState<number>(initialPadding.bottom);

  useEffect(() => {
    const newPadding = getInitialPadding();
    setPaddingTop(newPadding.top);
    setPaddingBottom(newPadding.bottom);
  }, [documentData, sectionKey, isExperienceItem, experienceId]);

  const updatePadding = useCallback(
    (type: 'top' | 'bottom', value: number) => {
      if (isExperienceItem && experienceId) {
        // Update individual experience item padding
        const experienceIndex = documentData?.experiences?.findIndex(
          exp => exp.id?.toString() === experienceId || exp.order?.toString() === experienceId
        );

        if (experienceIndex !== -1 && experienceIndex !== undefined && documentData?.experiences) {
          const updatedExperiences = [...documentData.experiences];
          updatedExperiences[experienceIndex] = {
            ...updatedExperiences[experienceIndex],
            [type === 'top' ? 'paddingTop' : 'paddingBottom']: value,
          };

          updateDocument({
            experience: updatedExperiences,
          });
        }
      } else {
        // Update section padding
        const currentPaddings = documentData?.sectionPaddings || {};
        const updatedPaddings = {
          ...currentPaddings,
          [sectionKey]: {
            ...currentPaddings[sectionKey as keyof SectionPaddingsType],
            [type === 'top' ? 'paddingTop' : 'paddingBottom']: value,
          },
        };

        updateDocument({
          sectionPaddings: updatedPaddings,
        });
      }

      if (type === 'top') {
        setPaddingTop(value);
      } else {
        setPaddingBottom(value);
      }
    },
    [documentData, sectionKey, updateDocument, isExperienceItem, experienceId]
  );

  console.log(
    `modalSectionWrapper: ${sectionKey}, isSelected: ${isSelected}, canMoveUp: ${canMoveUp}, canMoveDown: ${canMoveDown}`
  );

  return (
    <div
      // key={`modal-section-wrapper-${sectionKey}`}
      className={cn(
        'section-wrapper relative cursor-pointer rounded-md border-2 border-transparent transition-all duration-200',
        isSelected &&
          'border-blue-500 bg-blue-50 p-2 shadow-lg ring-2 ring-blue-500 ring-opacity-50 dark:border-blue-400 dark:bg-blue-950 dark:ring-blue-400'
      )}
      style={{
        marginTop: `${paddingTop}px`,
        marginBottom: `${paddingBottom}px`,
      }}
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
          // key={`modal-buttons-${sectionKey}`}
          className="fixed left-4 top-1/2 flex -translate-y-1/2 transform flex-col gap-3 rounded-lg border-2 border-blue-500 bg-white p-4 shadow-2xl backdrop-blur-sm"
          onClick={e => e.stopPropagation()}
          style={{
            zIndex: 99999,
            position: 'fixed',
            left: '-12vw',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            minWidth: '180px',
          }}
        >
          <div className="mb-2 border-b border-blue-200 pb-2 text-center text-sm font-bold text-blue-800">
            📝 {sectionKey}
          </div>

          {/* Padding Controls */}
          <div className="mb-3 space-y-2 border-b border-blue-200 pb-3">
            <div className="mb-2 text-xs font-semibold text-gray-700">Spacing:</div>
            <PaddingControls label="Top" value={paddingTop} onChange={value => updatePadding('top', value)} />
            <PaddingControls label="Bottom" value={paddingBottom} onChange={value => updatePadding('bottom', value)} />
          </div>

          {/* Move Controls */}
          <div className="mb-2 text-xs font-semibold text-gray-700">Order:</div>
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
