import React, { FC } from "react";
import SkeletonLoader from "@/components/skeleton-loader";
import { INITIAL_THEME_COLOR } from "@/lib/helper";
import { ResumeDataType } from "@/types/resume.type";
import { formatDateByLocale } from "@/lib/utils";

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const EducationPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;

  const isDoNotShowDates = resumeInfo?.educations?.every(
    (education) => education.skipDates === true || (!education.startDate && !education.endDate)
  );

  const isCompactMode = isDoNotShowDates && resumeInfo?.educations?.every(
    (education) => !education.major?.trim() && education.universityName?.trim()
  );

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (isCompactMode) {
    return (
      <div className="w-full my-3">
        <h5
          className="text-center font-bold text-[18px]"
          style={{ color: themeColor }}
        >
          Education
        </h5>
        <hr
          className="border-[1.5px] mt-2 mb-2"
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
    <div className="w-full my-3">
      <h5
        className="text-center font-bold text-[18px]"
        style={{ color: themeColor }}
      >
        Education
      </h5>
      <hr
        className="border-[1.5px] mt-2 mb-2"
        style={{
          borderColor: themeColor,
        }}
      />

      <div className={`min-h-9 ${isDoNotShowDates ? 'grid grid-cols-2 gap-x-4 gap-y-1' : 'flex flex-col gap-2'}`}>
        {resumeInfo?.educations?.map((education, index) => (
          <div key={index} className={isDoNotShowDates ? 'mb-1' : ''}>
            <h5 className="text-sm font-bold" style={{ color: themeColor }}>
              {education?.universityName}
            </h5>
            <div className={isDoNotShowDates ? 'block' : 'flex items-start justify-between'}>
              <h5 className="text-[13px]">
                {education?.degree}
                {education?.degree && education?.major?.trim() && " in "}
                {education?.major?.trim() && education?.major}
              </h5>
              {education?.skipDates === true || (!education?.startDate && !education?.endDate) ? null : (
                <span className="text-[13px] font-bold">
                  {education?.yearsOnly
                    ? `${education?.startDate ? new Date(education.startDate).getFullYear() : ''}${education?.startDate ? ' - ' : ''}${education?.currentlyStudying ? 'Present' : (education?.endDate ? new Date(education.endDate).getFullYear() : '')}`
                    : `${formatDateByLocale(education?.startDate ?? undefined)}${education?.startDate ? ' - ' : ''}${education?.currentlyStudying ? 'Present' : formatDateByLocale(education?.endDate ?? undefined)}`
                  }
                </span>
              )}
            </div>
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
