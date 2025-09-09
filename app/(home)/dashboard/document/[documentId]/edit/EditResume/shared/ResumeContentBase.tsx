import React from 'react';
import { DocumentType } from '@/types/resume.type';
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
  const renderSection = (sectionKey: string) => {
    const Component = SECTION_COMPONENTS[sectionKey as SectionKey];
    if (!Component) return null;

    const isSelected = isInteractive && selectedSection === sectionKey;
    const sectionPadding = resumeInfo?.sectionPaddings?.[sectionKey as keyof typeof resumeInfo.sectionPaddings];
    // Convert px to mm: 1px = 0.264583 mm (96 DPI)
    const paddingTopMm = ((sectionPadding?.paddingTop || 0) * 0.264583).toFixed(2);
    const paddingBottomMm = ((sectionPadding?.paddingBottom || 0) * 0.264583).toFixed(2);

    const sectionComponent = (
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
      return renderSectionWrapper(sectionKey, sectionComponent, isSelected);
    }

    return (
      <div
        key={sectionKey}
        style={{
          marginTop: `${paddingTopMm}mm`,
          marginBottom: `${paddingBottomMm}mm`,
        }}
      >
        {sectionComponent}
      </div>
    );
  };

  return <div {...containerProps}>{pagesOrder.map(renderSection)}</div>;
};
