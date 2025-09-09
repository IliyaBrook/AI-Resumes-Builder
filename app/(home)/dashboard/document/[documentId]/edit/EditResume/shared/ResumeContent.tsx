'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useGetDocumentById } from '@/hooks';
import { SECTION_COMPONENTS, type SectionKey, DEFAULT_PAGES_ORDER } from '@/constant/resume-sections';
import { cn, normalizeResumeData } from '@/lib/utils';
import { DocumentType } from '@/types/resume.type';
import RESUME_STYLES from './resume-styles.css?inline';

interface ResumeContentProps {
  // Direct data props (used when fetchDataIndependently is false)
  resumeInfo?: DocumentType;
  pagesOrder?: string[];
  themeColor?: string;
  isLoading?: boolean;

  // Common props
  isPdfMode?: boolean;
  isInteractive?: boolean;
  selectedSection?: string | null;
  onSectionClick?: (sectionKey: string) => void;
  renderSectionWrapper?: (sectionKey: string, component: React.ReactNode, isSelected: boolean) => React.ReactNode;

  // Control whether to fetch data independently
  fetchDataIndependently?: boolean;
}

export const ResumeContent: React.FC<ResumeContentProps> = ({
  resumeInfo: propsResumeInfo,
  pagesOrder: propsPagesOrder,
  themeColor: propsThemeColor,
  isLoading: propsIsLoading,
  isPdfMode = false,
  isInteractive = false,
  selectedSection = null,
  onSectionClick,
  renderSectionWrapper,
  fetchDataIndependently = false,
}) => {
  // Hooks must be called unconditionally
  const param = useParams();
  const documentId = param?.documentId as string;
  const shouldFetch = fetchDataIndependently && !!documentId;
  const { data, isLoading: dataIsLoading } = useGetDocumentById(shouldFetch ? documentId : 'disabled');

  // Determine which data to use
  const documentData = shouldFetch ? (data?.data as DocumentType) : null;
  const resumeInfo = shouldFetch ? normalizeResumeData(documentData) : propsResumeInfo;
  const pagesOrder = shouldFetch
    ? resumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER
    : propsPagesOrder || DEFAULT_PAGES_ORDER;
  const themeColor = shouldFetch ? resumeInfo?.themeColor || '#3b82f6' : propsThemeColor || '#3b82f6';
  const isLoading = shouldFetch ? dataIsLoading : propsIsLoading || false;

  const renderSection = (sectionKey: string) => {
    const Component = SECTION_COMPONENTS[sectionKey as SectionKey];
    if (!Component) return null;

    const isSelected = isInteractive && selectedSection === sectionKey;

    // Get padding values for this section
    const sectionPadding = resumeInfo?.sectionPaddings?.[sectionKey as keyof typeof resumeInfo.sectionPaddings];
    const paddingTop = sectionPadding?.paddingTop || 0;
    const paddingBottom = sectionPadding?.paddingBottom || 0;

    const sectionComponent = (
      <Component
        isLoading={isLoading}
        resumeInfo={resumeInfo}
        isInteractive={isInteractive}
        selectedSection={selectedSection}
        onSectionClick={onSectionClick}
        renderSectionWrapper={renderSectionWrapper}
      />
    );

    if (renderSectionWrapper && isInteractive) {
      return renderSectionWrapper(sectionKey, sectionComponent, isSelected);
    }

    if (isInteractive) {
      return (
        <div
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

  if (!resumeInfo && !fetchDataIndependently) {
    return null;
  }

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

// Backward compatibility export
export const ResumeContentIndependent: React.FC<Omit<ResumeContentProps, 'fetchDataIndependently'>> = props => {
  return <ResumeContent {...props} fetchDataIndependently={true} />;
};
