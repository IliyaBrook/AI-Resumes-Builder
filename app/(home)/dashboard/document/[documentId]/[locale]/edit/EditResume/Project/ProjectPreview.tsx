import React, { FC } from 'react';
import { INITIAL_THEME_COLOR } from '@/lib/helper';
import { DocumentType } from '@/types';
import { Link as LinkIcon } from 'lucide-react';

interface PropsType {
  resumeInfo: DocumentType | undefined;
  isLoading: boolean;
}

const ProjectPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;
  const projects = (resumeInfo?.projects || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  if (isLoading || !projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="my-3 w-full">
      <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
        {resumeInfo?.projectsSectionTitle?.trim() || 'Projects'}
      </h5>
      <hr className="mb-2 mt-2 border-[1.5px]" style={{ borderColor: themeColor }} />
      <div className="flex min-h-9 flex-col gap-2">
        {projects.map((project, index) => (
          <div key={project.id || index}>
            <h5 className="text-[15px] font-bold" style={{ color: themeColor }}>
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: themeColor }}>
                  {project.name}
                </a>
              ) : (
                project.name
              )}
            </h5>
            <div className="mb-2 text-[13px]">
              <div dangerouslySetInnerHTML={{ __html: project.description || '' }} />
            </div>
            {project.git && (
              <div className="pdf-margin-bottom-0 mb-2 flex items-center gap-1 text-[13px]">
                <LinkIcon size={15} className="opacity-60" />
                <a
                  href={project.git}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-position-fix"
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
