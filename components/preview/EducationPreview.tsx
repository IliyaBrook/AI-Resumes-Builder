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

  if (isLoading) {
    return <SkeletonLoader />;
  }
  return (
    <div className="w-full my-5">
      <h5
        className="text-center font-bold text-[18px]"
        style={{ color: themeColor }}
      >
        Education
      </h5>
      <hr
        className="
          border-[1.5px] mb-2
          "
        style={{
          borderColor: themeColor,
        }}
      />

      <div className="flex flex-col gap-2 min-h-9">
        {resumeInfo?.educations?.map((education, index) => (
          <div key={index}>
            <h5 className="text-sm font-bold" style={{ color: themeColor }}>
              {education?.universityName}
            </h5>
            <div className="flex items-start justify-between">
              <h5 className="text-[13px]">
                {education?.degree}
                {education?.degree && education?.major && " in "}
                {education?.major}
              </h5>
              {education?.skipDates === true || (!education?.startDate && !education?.endDate) ? null : (
                <span className="text-[13px] font-bold">
                  {formatDateByLocale(education?.startDate ?? undefined)}
                  {education?.startDate && " - "}
                  {education?.currentlyStudying ? "Present" : formatDateByLocale(education?.endDate ?? undefined)}
                </span>
              )}
            </div>
            <p className="text-[13px] my-2">{education?.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationPreview;
