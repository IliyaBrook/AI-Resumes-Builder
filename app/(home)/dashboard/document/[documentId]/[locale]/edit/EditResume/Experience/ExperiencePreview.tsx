import { SkeletonLoader } from '@/components';
import { INITIAL_THEME_COLOR } from '@/lib/helper';
import { DocumentType } from '@/types';
import React, { FC } from 'react';
import { formatDateByLocale } from '@/lib/utils';

interface PropsType {
  resumeInfo: DocumentType | undefined;
  isLoading: boolean;
  isInteractive?: boolean;
  selectedSection?: string | null;
  onSectionClick?: (sectionKey: string) => void;
  renderSectionWrapper?: (sectionKey: string, component: React.ReactNode, isSelected: boolean) => React.ReactNode;
}

const ExperiencePreview: FC<PropsType> = ({
  resumeInfo,
  isLoading,
  isInteractive = false,
  selectedSection = null,
  onSectionClick,
  renderSectionWrapper,
}) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;

  if (isLoading) {
    return <SkeletonLoader />;
  }

  const renderExperienceItem = (experience: any, index: number) => {
    const experienceKey = `experience-${experience?.id || index}`;
    const isSelected = isInteractive && selectedSection === experienceKey;

    const experienceContent = (
      <div key={index}>
        <h5 className="text-[15px] font-bold" style={{ color: themeColor }}>
          {experience?.title}
        </h5>
        <div className="mb-2 flex items-start justify-between">
          <h5 className="whitespace-nowrap text-[13px]">
            <span className="font-bold">{experience?.companyName}</span>
            <span>
              {experience?.companyName && experience?.city && ', '}
              {experience?.city}
            </span>
            <span>
              {experience?.city && experience?.state && ', '}
              {experience?.state}
            </span>
          </h5>
          <span className="text-[13px] font-bold">
            {experience?.yearsOnly
              ? `${experience?.startDate ? new Date(experience.startDate).getFullYear() : ''}${experience?.startDate ? ' - ' : ''}${experience?.currentlyWorking ? 'Present' : experience?.endDate ? new Date(experience.endDate).getFullYear() : ''}`
              : `${formatDateByLocale(experience?.startDate ?? undefined)}${experience?.startDate ? ' - ' : ''}${experience?.currentlyWorking ? 'Present' : formatDateByLocale(experience?.endDate ?? undefined)}`}
          </span>
        </div>
        <div
          style={{ fontSize: '13px' }}
          className="exp-preview leading-[14.6px]"
          dangerouslySetInnerHTML={{
            __html: experience?.workSummary || '',
          }}
        />
      </div>
    );

    if (renderSectionWrapper && isInteractive) {
      return renderSectionWrapper(experienceKey, experienceContent, isSelected);
    }

    if (isInteractive) {
      return (
        <div
          key={experienceKey}
          data-experience-id={experienceKey}
          className={`cursor-pointer rounded-md transition-all duration-200 ${
            isSelected ? 'bg-blue-50 p-2 ring-2 ring-blue-500 ring-opacity-50' : ''
          }`}
          style={{
            marginTop: `${((experience?.paddingTop || 0) * 0.264583).toFixed(2)}mm`,
            marginBottom: `${((experience?.paddingBottom || 0) * 0.264583).toFixed(2)}mm`,
          }}
          onClick={e => {
            e.stopPropagation();
            onSectionClick?.(experienceKey);
          }}
          title={`Click to select experience item`}
        >
          {experienceContent}
        </div>
      );
    }

    return (
      <div
        key={experienceKey}
        data-experience-id={experienceKey}
        style={{
          marginTop: `${((experience?.paddingTop || 0) * 0.264583).toFixed(2)}mm`,
          marginBottom: `${((experience?.paddingBottom || 0) * 0.264583).toFixed(2)}mm`,
        }}
      >
        {experienceContent}
      </div>
    );
  };

  return (
    <div className="my-3 w-full">
      <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
        Professional Experience
      </h5>
      <hr
        className="mb-2 mt-2 border-[1.5px]"
        style={{
          borderColor: themeColor,
        }}
      />

      <div className="flex min-h-9 flex-col gap-2">
        <style>{`
          .exp-preview ul {
            list-style-position: outside;
            padding-left: .85em!important;
          }
          .exp-preview li {
            margin-bottom: 0.2em;
            text-indent: 0;
          }
        `}</style>
        {resumeInfo?.experiences?.map((experience, index) => renderExperienceItem(experience, index))}
      </div>
    </div>
  );
};

export default ExperiencePreview;
