import React from "react";
import { INITIAL_THEME_COLOR } from "@/lib/helper";
import { ResumeDataType } from "@/types/resume.type";
import { cn } from "@/lib/utils";
import PersonalInfo from "@/components/preview/PersonalInfo";
import SummaryPreview from "@/components/preview/SummaryPreview";
import EducationPreview from "@/components/preview/EducationPreview";
import ExperiencePreview from "@/components/preview/ExperiencePreview";
import SkillPreview from "@/components/preview/SkillPreview";
import ProjectPreview from "@/components/preview/ProjectPreview";

const PreviewResume = (props: {
  isLoading: boolean;
  resumeInfo: ResumeDataType;
}) => {
  const { isLoading, resumeInfo } = props;
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;
  return (
    <div
      className={cn(`
        shadow-lg !bg-white w-full flex-[1.02]
        h-full p-10 !font-open-sans
        !text-black
        `)}
      style={{
        borderTop: `13px solid ${resumeInfo?.themeColor}`,
      }}
    >
      <PersonalInfo isLoading={isLoading} resumeInfo={resumeInfo} />
      <SummaryPreview isLoading={isLoading} resumeInfo={resumeInfo} />
      <ExperiencePreview isLoading={isLoading} resumeInfo={resumeInfo} />
      <EducationPreview isLoading={isLoading} resumeInfo={resumeInfo} />
      <ProjectPreview isLoading={isLoading} resumeInfo={resumeInfo} />
      <SkillPreview isLoading={isLoading} resumeInfo={resumeInfo} />
    </div>
  );
};

export default PreviewResume;
