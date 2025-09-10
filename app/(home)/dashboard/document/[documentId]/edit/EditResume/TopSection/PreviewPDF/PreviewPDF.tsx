'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResumeContent } from '@/shared/ResumeContent';
import { ModalSectionWrapper } from './modalSectionWrapper';
import { moveSection, usePageOrderSync } from '@/editResume';

interface PDFDebugPreviewProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export const PreviewPDF: React.FC<PDFDebugPreviewProps> = ({ isOpen, onCloseAction }) => {
  const { currentOrder, setCurrentOrder, updatePagesOrder, fixedResumeInfo, isLoading } = usePageOrderSync();

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleSection = (sectionKey: string) => {
    setSelectedSection(prev => {
      return prev === sectionKey ? null : sectionKey;
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
    return (
      <ModalSectionWrapper
        key={sectionKey}
        sectionKey={sectionKey}
        component={component}
        isSelected={isSelected}
        currentOrder={currentOrder}
        onSectionAction={toggleSection}
        onMoveAction={handleMoveSection}
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-h-[90vh] max-w-[900px] p-0" aria-describedby="PDF Debug Preview">
        <div className="h-full max-h-[85vh] overflow-y-auto bg-gray-100 p-6">
          <div className="mx-auto" style={{ width: 'fit-content' }}>
            {/* PDF Page Preview */}
            <div ref={containerRef} onClick={() => setSelectedSection(null)}>
              <ResumeContent
                resumeInfo={fixedResumeInfo}
                pagesOrder={currentOrder}
                themeColor={fixedResumeInfo?.themeColor}
                isLoading={isLoading}
                selectedSection={selectedSection}
                onSectionClick={toggleSection}
                renderSectionWrapper={handleRenderSectionWrapper}
                isPagedPreview={true}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
