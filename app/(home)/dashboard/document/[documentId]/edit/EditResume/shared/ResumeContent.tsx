'use client';
import React from 'react';
import { SECTION_COMPONENTS, type SectionKey } from '@/constant/resume-sections';
import { cn } from '@/lib/utils';

export const RESUME_STYLES = `
  #resume-content ul, #resume-content ol {
    list-style: none;
    padding-left: 0;
    margin-left: 0;
  }
  #resume-content ul li {
    list-style-type: none;
  }
 
  #resume-content ol li {
    counter-increment: item;
  }
  #resume-content ol li::before {
    content: counter(item) ". ";
    font-size: 1.1em;
    margin-right: 6px;
    color: #333;
  }
  #resume-content ol {
    counter-reset: item;
  }
  
  /* Hide interactive elements in print/PDF mode */
  .pdf-mode .section-wrapper:hover,
  .pdf-mode .section-wrapper.bg-blue-50,
  .pdf-mode .absolute.right-2.top-2,
  .pdf-mode .absolute.left-4.top-4,
  .pdf-mode .cursor-pointer {
    background: transparent !important;
    ring: none !important;
    box-shadow: none !important;
    cursor: default !important;
  }
  
  .pdf-mode .absolute.right-2.top-2,
  .pdf-mode .absolute.left-4.top-4 {
    display: none !important;
  }

  .pdf-mode button:hover,
  .pdf-mode .hover\\:underline:hover {
    background: inherit !important;
    text-decoration: none !important;
  }
  
  @media print {
    #resume-content ul {
      list-style-position: inside;
      padding-left: 18px;
      margin-left: 0;
    }
    #resume-content li {
      margin-left: 0;
      padding-left: 0;
    }
    
    .section-wrapper:hover,
    .section-wrapper.bg-blue-50,
    .absolute.right-2.top-2,
    .absolute.left-4.top-4,
    .cursor-pointer {
      background: transparent !important;
      ring: none !important;
      box-shadow: none !important;
      cursor: default !important;
    }
    
    .absolute.right-2.top-2,
    .absolute.left-4.top-4 {
      display: none !important;
    }
  }
`;

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
