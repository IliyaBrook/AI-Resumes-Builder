import React, { FC } from 'react';
import { SkeletonLoader } from '@/components';
import { INITIAL_THEME_COLOR } from '@/lib/helper';
import { DocumentType } from '@/types/resume.type';
import { formatDateByLocale } from '@/lib/utils';

interface PropsType {
  resumeInfo: DocumentType | undefined;
  isLoading: boolean;
}

const EducationPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;

  const isDoNotShowDates = resumeInfo?.educations?.every(
    education =>
      education.skipDates === true || education.hideDates === true || (!education.startDate && !education.endDate)
  );

  const isCompactMode = resumeInfo?.educations?.every(
    education =>
      education.educationType === 'course' &&
      education.hideDates === true &&
      !education.description?.trim() &&
      education.universityName?.trim() &&
      education.degree?.trim()
  );

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (isCompactMode) {
    return (
      <div className="my-3 w-full">
        <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
          Education
        </h5>
        <hr
          className="mb-2 mt-2 border-[1.5px]"
          style={{
            borderColor: themeColor,
          }}
        />
        <div className="text-[13px] leading-relaxed">
          {resumeInfo?.educations?.map((education, index) => (
            <div key={index} className="mb-1">
              <span className="font-bold" style={{ color: themeColor }}>
                {education?.universityName}
              </span>
              <span className="mx-[1px]"> - </span>
              <span>{education?.degree}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-3 w-full">
      <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
        Education
      </h5>
      <hr
        className="mb-2 mt-2 border-[1.5px]"
        style={{
          borderColor: themeColor,
        }}
      />

      <div className={`min-h-9 ${isDoNotShowDates ? 'grid grid-cols-2 gap-x-4 gap-y-1' : 'flex flex-col gap-2'}`}>
        {resumeInfo?.educations?.map((education, index) => (
          <div key={index} className={isDoNotShowDates ? 'mb-1' : ''}>
            {education?.educationType === 'course' ? (
              <h5 className="text-sm">
                <span className="font-bold" style={{ color: themeColor }}>
                  {education?.universityName}
                </span>
                <span className="mx-[1px]"> - </span>
                <span>{education?.degree}</span>
              </h5>
            ) : (
              <h5 className="text-sm font-bold" style={{ color: themeColor }}>
                {education?.universityName}
              </h5>
            )}
            {education?.educationType !== 'course' && (
              <div className={isDoNotShowDates ? 'block' : 'flex items-start justify-between'}>
                <h5 className="text-[13px]">
                  {education?.degree}
                  {education?.degree && education?.major?.trim() && ' in '}
                  {education?.major?.trim() && education?.major}
                </h5>
                {education?.skipDates === true ||
                education?.hideDates === true ||
                (!education?.startDate && !education?.endDate) ? null : (
                  <span className="text-[13px] font-bold">
                    {education?.yearsOnly
                      ? `${education?.startDate ? new Date(education.startDate).getFullYear() : ''}${education?.startDate ? ' - ' : ''}${education?.currentlyStudying ? 'Present' : education?.endDate ? new Date(education.endDate).getFullYear() : ''}`
                      : `${formatDateByLocale(education?.startDate ?? undefined)}${education?.startDate ? ' - ' : ''}${education?.currentlyStudying ? 'Present' : formatDateByLocale(education?.endDate ?? undefined)}`}
                  </span>
                )}
              </div>
            )}
            {education?.educationType === 'course' &&
              !education?.hideDates &&
              (education?.startDate || education?.endDate) && (
                <div className={isDoNotShowDates ? 'block' : 'flex items-start justify-between'}>
                  <span className="text-[13px] font-bold">
                    {education?.yearsOnly
                      ? `${education?.startDate ? new Date(education.startDate).getFullYear() : ''}${education?.startDate ? ' - ' : ''}${education?.currentlyStudying ? 'Present' : education?.endDate ? new Date(education.endDate).getFullYear() : ''}`
                      : `${formatDateByLocale(education?.startDate ?? undefined)}${education?.startDate ? ' - ' : ''}${education?.currentlyStudying ? 'Present' : formatDateByLocale(education?.endDate ?? undefined)}`}
                  </span>
                </div>
              )}
            {education?.description?.trim() && (
              <p className={`text-[13px] ${isDoNotShowDates ? 'my-1' : 'my-2'}`}>{education?.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationPreview;
