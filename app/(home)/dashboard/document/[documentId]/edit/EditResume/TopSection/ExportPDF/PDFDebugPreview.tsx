'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResumeContentPaged } from '@/shared/ResumeContentPaged';
import { ModalSectionWrapper } from './modalSectionWrapper';
import { moveSection, usePageOrderSync } from '@/editResume';

interface PDFDebugPreviewProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export const PDFDebugPreview: React.FC<PDFDebugPreviewProps> = ({ isOpen, onCloseAction }) => {
  const { currentOrder, setCurrentOrder, updatePagesOrder, fixedResumeInfo, isLoading } = usePageOrderSync();

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleSection = (sectionKey: string) => {
    console.log('PDFDebugPreview - toggleSection called:', sectionKey);
    setSelectedSection(prev => {
      const newValue = prev === sectionKey ? null : sectionKey;
      console.log('PDFDebugPreview - selectedSection changed from', prev, 'to', newValue);
      return newValue;
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSection(null);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedSection(null);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset selected section when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSection(null);
    }
  }, [isOpen]);

  const handleMoveSection = (direction: 'up' | 'down') => {
    if (!selectedSection) return;

    const newOrder = moveSection(currentOrder, selectedSection, direction);
    if (newOrder) {
      updatePagesOrder(newOrder);
      setCurrentOrder(newOrder);
    }
  };

  const handleRenderSectionWrapper = (sectionKey: string, component: React.ReactNode, isSelected: boolean) => {
    console.log('PDFDebugPreview - handleRenderSectionWrapper called for:', sectionKey, 'isSelected:', isSelected);
    return (
      <ModalSectionWrapper
        key={sectionKey}
        sectionKey={sectionKey}
        component={component}
        isSelected={isSelected}
        currentOrder={currentOrder}
        onSectionClick={toggleSection}
        onMoveSection={handleMoveSection}
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-h-[90vh] max-w-[900px] p-0" aria-describedby="PDF Debug Preview">
        <div className="h-full max-h-[85vh] overflow-y-auto bg-gray-100 p-6">
          <div className="mx-auto" style={{ width: 'fit-content' }}>
            {selectedSection && (
              <div className="fixed left-4 top-4 z-40 rounded-md bg-white px-2 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-800">
                Selected section: {selectedSection} (ESC to cancel)
              </div>
            )}

            {/* PDF Page Preview */}
            <div ref={containerRef} onClick={() => setSelectedSection(null)}>
              <ResumeContentPaged
                resumeInfo={fixedResumeInfo}
                pagesOrder={currentOrder}
                themeColor={fixedResumeInfo?.themeColor}
                isLoading={isLoading}
                selectedSection={selectedSection}
                onSectionClick={toggleSection}
                renderSectionWrapper={handleRenderSectionWrapper}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
