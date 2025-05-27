import React, { FC, useState } from "react";
import { INITIAL_THEME_COLOR } from "@/lib/helper";
import { ResumeDataType } from "@/types/resume.type";
import { Link as LinkIcon } from "lucide-react";

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const ProjectPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;
  const projects = resumeInfo?.projects || [];

  if (isLoading || !projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-3">
      <h5
        className="text-center font-bold text-[18px]"
        style={{ color: themeColor }}
      >
        {resumeInfo?.projectsSectionTitle?.trim() || "Projects"}
      </h5>
      <hr
        className="border-[1.5px] mt-2 mb-2"
        style={{ borderColor: themeColor }}
      />
      <div className="flex flex-col gap-2 min-h-9">
        {projects.map((project, index) => (
          <div key={project.id || index}>
            <h5 className="text-[15px] font-bold" style={{ color: themeColor }}>
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: themeColor }}
                >
                  {project.name}
                </a>
              ) : (
                project.name
              )}
            </h5>
            <div className="text-[13px] mb-2">
              <div dangerouslySetInnerHTML={{ __html: project.description || "" }} />
            </div>
            {project.git && (
              <div className="text-[13px] mb-2 flex items-center gap-1 pdf-margin-bottom-0">
                <LinkIcon size={15} className="opacity-60" />
                <a
                  href={project.git}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline pdf-position-fix"
                  style={{ color: themeColor }}
                >
                  {project.git}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectPreview; 