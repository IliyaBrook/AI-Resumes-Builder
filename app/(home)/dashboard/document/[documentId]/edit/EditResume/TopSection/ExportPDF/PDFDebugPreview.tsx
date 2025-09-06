'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResumeContentIndependent } from '../../shared/ResumeContent';
import { renderSectionWrapper } from '../../ResumePreview/renderSectionWrapper';
import { moveSection } from '../../ResumePreview/pageOrderUtils';
import { useSectionSelection } from '../../ResumePreview/useSectionSelection';
import { usePageOrderSync } from '../../ResumePreview/usePageOrderSync';

interface PDFDebugPreviewProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export const PDFDebugPreview: React.FC<PDFDebugPreviewProps> = ({ isOpen, onCloseAction }) => {
  const {
    currentOrder,
    setCurrentOrder,
    updatePagesOrder,
    fixedResumeInfo,
    isLoading,
  } = usePageOrderSync();
  
  const {
    selectedSection,
    setSelectedSection,
    toggleSection,
    containerRef,
  } = useSectionSelection();

  const handleMoveSection = (direction: 'up' | 'down') => {
    if (!selectedSection) return;
    
    const newOrder = moveSection(currentOrder, selectedSection, direction);
    if (newOrder) {
      updatePagesOrder(newOrder);
      setCurrentOrder(newOrder);
    }
  };

  const handleRenderSectionWrapper = (
    sectionKey: string,
    component: React.ReactNode,
    isSelected: boolean
  ) => {
    return renderSectionWrapper({
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
            className="mx-auto relative" 
            style={{ width: '210mm', minHeight: '297mm' }}
            onClick={() => setSelectedSection(null)}
          >
            {selectedSection && (
              <div className="absolute left-4 top-4 z-10 rounded-md bg-white px-2 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-800">
                Selected section: {selectedSection} (ESC to cancel)
              </div>
            )}
            <div className="rounded-lg border bg-white shadow-lg">
              <ResumeContentIndependent
                customResumeInfo={fixedResumeInfo}
                customPagesOrder={currentOrder}
                customThemeColor={fixedResumeInfo?.themeColor}
                customIsLoading={isLoading}
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
