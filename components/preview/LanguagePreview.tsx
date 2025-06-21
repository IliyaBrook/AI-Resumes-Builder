import React, { FC } from "react";
import { SkeletonLoader } from "@/components";
import { INITIAL_THEME_COLOR } from "@/lib/helper";
import { ResumeDataType } from "@/types/resume.type";

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const LanguagePreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;
  const languages = (resumeInfo?.languages || [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .filter(lang => lang.name?.trim());
  
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!languages || languages.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-3">
      <h5
        className="text-center font-bold text-[18px]"
        style={{ color: themeColor }}
      >
        {resumeInfo?.languagesSectionTitle?.trim() || "Languages"}
      </h5>
      <hr
        className="border-[1.5px] mt-2 mb-2"
        style={{ borderColor: themeColor }}
      />
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 min-h-9">
        {languages.map((language, index) => (
          <div key={language.id || index} className="flex items-center justify-between">
            <span className="text-[13px] font-medium">
              {language.name}
            </span>
            {language.level && language.level.trim() && (
              <span className="text-[12px] text-gray-600">
                {language.level}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguagePreview; 