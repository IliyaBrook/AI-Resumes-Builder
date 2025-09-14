import React from 'react';
import { DocumentType } from '@/types';
import { SECTION_COMPONENTS } from '@/constant/resume-sections';
import type { SectionKey } from '@/constant/resume-sections';

interface ResumeContentBaseProps {
  resumeInfo: DocumentType;
  pagesOrder: string[];
  themeColor: string;
  isLoading: boolean;
  isInteractive?: boolean;
  selectedSection?: string | null;
  onSectionClick?: (sectionKey: string) => void;
  renderSectionWrapper?: (sectionKey: string, component: React.ReactNode, isSelected: boolean) => React.ReactNode;
  containerProps?: {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
  };
}

export const ResumeContentBase: React.FC<ResumeContentBaseProps> = ({
  resumeInfo,
  pagesOrder,
  isLoading,
  isInteractive = false,
  selectedSection = null,
  onSectionClick,
  renderSectionWrapper,
  containerProps = {},
}) => {
  type PaddingKeys = keyof NonNullable<DocumentType['sectionPaddings']>;
  const paddingKeyMap: Record<string, PaddingKeys> = {
    'personal-info': 'personalInfo',
    summary: 'summary',
    experience: 'experience',
    education: 'education',
    projects: 'projects',
    skills: 'skills',
    languages: 'languages',
  } as const;

  const renderSection = (sectionKey: string) => {
    const Component = SECTION_COMPONENTS[sectionKey as SectionKey];
    if (!Component) return null;

    const isSelected = isInteractive && selectedSection === sectionKey;
    const paddingKey = paddingKeyMap[sectionKey];
    const sectionPadding = resumeInfo?.sectionPaddings?.[paddingKey];
    // Convert px to mm: 1px = 0.264583 mm (96 DPI)
    const paddingTopMm = ((sectionPadding?.paddingTop || 0) * 0.264583).toFixed(2);
    const paddingBottomMm = ((sectionPadding?.paddingBottom || 0) * 0.264583).toFixed(2);

    const component = (
      <Component
        resumeInfo={resumeInfo}
        isLoading={isLoading}
        isInteractive={isInteractive}
        selectedSection={selectedSection}
        onSectionClick={onSectionClick}
        renderSectionWrapper={renderSectionWrapper}
      />
    );

    if (renderSectionWrapper && isInteractive) {
      // When using renderSectionWrapper in interactive mode, let the wrapper handle padding
      // to avoid double margins
      return renderSectionWrapper(sectionKey, component, isSelected);
    }

    // Only apply margins when not using interactive wrapper
    return (
      <div 
        key={`section-margin-${sectionKey}`}
        style={{
          marginTop: `${paddingTopMm}mm`,
          marginBottom: `${paddingBottomMm}mm`,
        }}
      >
        {component}
      </div>
    );
  };

  return <div {...containerProps}>{pagesOrder.map(renderSection)}</div>;
};
