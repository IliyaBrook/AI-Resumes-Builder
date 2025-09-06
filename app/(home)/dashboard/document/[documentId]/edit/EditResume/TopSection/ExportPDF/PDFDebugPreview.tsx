'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResumeContent } from '../../shared/ResumeContent';
import { renderSectionWrapperPortal } from '../../ResumePreview/renderSectionWrapperPortal';
import { moveSection } from '../../ResumePreview/pageOrderUtils';
import { usePageOrderSync } from '../../ResumePreview/usePageOrderSync';

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

    console.log('PDFDebugPreview - handleMoveSection called:', { selectedSection, direction, currentOrder });
    const newOrder = moveSection(currentOrder, selectedSection, direction);
    console.log('PDFDebugPreview - newOrder calculated:', newOrder);

    if (newOrder) {
      console.log('PDFDebugPreview - updating pages order from', currentOrder, 'to', newOrder);
      updatePagesOrder(newOrder);
      setCurrentOrder(newOrder);
    }
  };

  const handleRenderSectionWrapper = (sectionKey: string, component: React.ReactNode, isSelected: boolean) => {
    console.log('PDFDebugPreview - handleRenderSectionWrapper called for:', sectionKey, 'isSelected:', isSelected);
    return renderSectionWrapperPortal({
      sectionKey,
      component,
      isSelected,
      currentOrder,
      onSectionClick: toggleSection,
      onMoveSection: handleMoveSection,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-h-[90vh] max-w-[900px] p-0" aria-describedby="PDF Debug Preview">
        <div className="h-full max-h-[85vh] overflow-y-auto p-6">
          <div
            ref={containerRef}
            className="relative mx-auto"
            style={{ width: '210mm', minHeight: '297mm' }}
            onClick={() => setSelectedSection(null)}
          >
            {selectedSection && (
              <div className="absolute left-4 top-4 z-40 rounded-md bg-white px-2 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-800">
                Selected section: {selectedSection} (ESC to cancel)
              </div>
            )}
            <div className="rounded-lg border bg-white shadow-lg">
              <ResumeContent
                key="pdf-debug-resume-content"
                resumeInfo={fixedResumeInfo}
                pagesOrder={currentOrder}
                themeColor={fixedResumeInfo?.themeColor}
                isLoading={isLoading}
                isPdfMode={true}
                isInteractive={true}
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
