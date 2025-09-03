'use client';
import React from 'react';
import { SECTION_COMPONENTS, type SectionKey } from '@/constant/resume-sections';
import { cn } from '@/lib/utils';
import RESUME_STYLES from './resume-styles.css?inline';

interface ResumeContentProps {
  resumeInfo: any;
  pagesOrder: string[];
  themeColor?: string;
  isLoading?: boolean;
  isPdfMode?: boolean;
  isInteractive?: boolean;
  selectedSection?: string | null;
  onSectionClick?: (sectionKey: string) => void;
  renderSectionWrapper?: (sectionKey: string, component: React.ReactNode, isSelected: boolean) => React.ReactNode;
}

export const ResumeContent: React.FC<ResumeContentProps> = ({
  resumeInfo,
  pagesOrder,
  themeColor = '#3b82f6',
  isLoading = false,
  isPdfMode = false,
  isInteractive = false,
  selectedSection = null,
  onSectionClick,
  renderSectionWrapper,
}) => {
  const renderSection = (sectionKey: string) => {
    const Component = SECTION_COMPONENTS[sectionKey as SectionKey];
    if (!Component) return null;

    const isSelected = isInteractive && selectedSection === sectionKey;
    const sectionComponent = <Component isLoading={isLoading} resumeInfo={resumeInfo} />;

    if (renderSectionWrapper && isInteractive) {
      return renderSectionWrapper(sectionKey, sectionComponent, isSelected);
    }

    if (isInteractive) {
      return (
        <div
          key={sectionKey}
          className={cn(
            'section-wrapper relative cursor-pointer rounded-md transition-all duration-200',
            isSelected && 'bg-blue-50 p-2 ring-2 ring-blue-500 ring-opacity-50 dark:bg-blue-950 dark:ring-blue-400'
          )}
          onClick={e => {
            e.stopPropagation();
            onSectionClick?.(sectionKey);
          }}
          title={`Click to select "${sectionKey}" section`}
        >
          {sectionComponent}
        </div>
      );
    }

    return (
      <div key={sectionKey} className="section-wrapper">
        {sectionComponent}
      </div>
    );
  };

  return (
    <div
      id="resume-content"
      className={cn(
        'relative h-full w-full bg-white px-10 py-4 !font-open-sans',
        isPdfMode && 'pdf-mode',
        !isPdfMode && 'shadow-lg dark:border dark:border-x-gray-800 dark:border-b-gray-800 dark:bg-card'
      )}
      style={{
        borderTop: `13px solid ${themeColor}`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: RESUME_STYLES }} />
      {pagesOrder.map(renderSection)}
    </div>
  );
};

export function normalizeResumeData(data: any) {
  if (!data) return data;
  if (data.projectsSectionTitle === null) {
    const { projectsSectionTitle, ...rest } = data;
    void projectsSectionTitle;
    return rest;
  }
  return data;
}
