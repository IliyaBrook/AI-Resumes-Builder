import SkeletonLoader from "@/components/skeleton-loader";
import { INITIAL_THEME_COLOR } from "@/lib/helper";
import { ResumeDataType } from "@/types/resume.type";
import React, { FC } from "react";
import { formatDateByLocale } from "@/lib/utils";

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const ExperiencePreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;

  if (isLoading) {
    return <SkeletonLoader />;
  }
  return (
    <div className="w-full my-3">
      <h5
        className="text-center font-bold text-[18px]"
        style={{ color: themeColor }}
      >
        Professional Experience
      </h5>
      <hr
        className="
          border-[1.5px] mt-2 mb-2
          "
        style={{
          borderColor: themeColor,
        }}
      />

      <div className="flex flex-col gap-2 min-h-9">
        <style>{`
          .exp-preview ul {
            list-style-position: outside;
            margin-left: .85em!important;
            padding-left: .85em!important;
          }
          .exp-preview li {
            margin-bottom: 0.2em;
            text-indent: 0;
            // list-style-type: disc!important;
          }
        `}</style>
        {resumeInfo?.experiences?.map((experience, index) => (
          <div key={index}>
            <h5 className="text-[15px] font-bold" style={{ color: themeColor }}>
              {experience?.title}
            </h5>
            <div
              className="flex items-start 
            justify-between mb-2"
            >
              <h5 className="text-[13px] whitespace-nowrap">
                <span className="font-bold">{experience?.companyName}</span>
                <span>
                  {experience?.companyName && experience?.city && ", "}
                  {experience?.city}
                </span>
                <span>
                  {experience?.city && experience?.state && ", "}
                  {experience?.state}
                </span>
              </h5>
              <span className="text-[13px] font-bold">
                {experience?.yearsOnly
                  ? `${experience?.startDate ? new Date(experience.startDate).getFullYear() : ''}${experience?.startDate ? ' - ' : ''}${experience?.currentlyWorking ? 'Present' : (experience?.endDate ? new Date(experience.endDate).getFullYear() : '')}`
                  : `${formatDateByLocale(experience?.startDate ?? undefined)}${experience?.startDate ? ' - ' : ''}${experience?.currentlyWorking ? 'Present' : formatDateByLocale(experience?.endDate ?? undefined)}`
                }
              </span>
            </div>
            <div
              style={{ fontSize: "13px" }}
              className="exp-preview leading-[14.6px]"
              dangerouslySetInnerHTML={{
                __html: experience?.workSummary || "",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperiencePreview;
