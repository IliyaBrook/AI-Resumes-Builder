'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetDocumentById } from '@/hooks';
import { SECTION_COMPONENTS, type SectionKey } from '@/constant/resume-sections';
import { DEFAULT_PAGES_ORDER } from '@/constant/resume-sections';
import { cn, normalizeResumeData } from '@/lib/utils';
import { DocumentType } from '@/types/resume.type';
import RESUME_STYLES from './resume-styles.css?inline';

interface ResumeContentIndependentProps {
  isPdfMode?: boolean;
  isInteractive?: boolean;
  selectedSection?: string | null;
  onSectionClick?: (sectionKey: string) => void;
  renderSectionWrapper?: (sectionKey: string, component: React.ReactNode, isSelected: boolean) => React.ReactNode;
  customResumeInfo?: DocumentType;
  customPagesOrder?: string[];
  customThemeColor?: string;
  customIsLoading?: boolean;
}

export const ResumeContentIndependent: React.FC<ResumeContentIndependentProps> = ({
  isPdfMode = false,
  isInteractive = false,
  selectedSection = null,
  onSectionClick,
  renderSectionWrapper,
  customResumeInfo,
  customPagesOrder,
  customThemeColor,
  customIsLoading,
}) => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading: dataIsLoading } = useGetDocumentById(documentId);
  const documentData = data?.data as DocumentType;
  
  const resumeInfo = customResumeInfo || normalizeResumeData(documentData);
  const pagesOrder = customPagesOrder || resumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER;
  const themeColor = customThemeColor || resumeInfo?.themeColor || '#3b82f6';
  const isLoading = customIsLoading !== undefined ? customIsLoading : dataIsLoading;

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