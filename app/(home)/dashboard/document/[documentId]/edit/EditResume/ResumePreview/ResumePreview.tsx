'use client';

import React from 'react';
import { ResumeContent } from '@/app/(home)/dashboard/document/[documentId]/edit/EditResume/shared/ResumeContent';
import { renderSectionWrapper } from './renderSectionWrapper';
import { moveSection } from './pageOrderUtils';
import { useSectionSelection } from './useSectionSelection';
import { usePageOrderSync } from './usePageOrderSync';

const ResumePreview = () => {
  const { currentOrder, setCurrentOrder, updatePagesOrder, fixedResumeInfo, isLoading } = usePageOrderSync();

  const { selectedSection, setSelectedSection, toggleSection, containerRef } = useSectionSelection();

  const handleMoveSection = (direction: 'up' | 'down') => {
    if (!selectedSection) return;

    const newOrder = moveSection(currentOrder, selectedSection, direction);
    if (newOrder) {
      updatePagesOrder(newOrder);
      setCurrentOrder(newOrder);
    }
  };

  const handleRenderSectionWrapper = (sectionKey: string, component: React.ReactNode, isSelected: boolean) => {
    return renderSectionWrapper({
      sectionKey,
      component,
      isSelected,
      currentOrder,
      onSectionClickAction: toggleSection,
      onMoveSectionAction: handleMoveSection,
    });
  };

  return (
    <div
      ref={containerRef}
      id="resume-preview-id"
      className="relative h-full w-full flex-[1.02]"
      onClick={() => setSelectedSection(null)}
    >
      <ResumeContent
        key="main-preview-resume-content"
        resumeInfo={fixedResumeInfo}
        pagesOrder={currentOrder}
        themeColor={fixedResumeInfo?.themeColor}
        isLoading={isLoading}
        isInteractive={true}
        selectedSection={selectedSection}
        onSectionClick={toggleSection}
        renderSectionWrapper={handleRenderSectionWrapper}
      />
    </div>
  );
};

export default ResumePreview;
