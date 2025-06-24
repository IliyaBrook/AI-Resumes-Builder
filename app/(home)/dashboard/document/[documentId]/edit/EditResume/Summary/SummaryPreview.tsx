import { Skeleton } from '@/components';
import { ResumeDataType } from '@/types/resume.type';
import React, { FC } from 'react';

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const SummaryPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  return (
    <div className="w-full min-h-10">
      {isLoading ? (
        <Skeleton className="h-6 w-full" />
      ) : (
        <div className="text-[13px] !leading-4">
          {resumeInfo?.summary ? (
            <div dangerouslySetInnerHTML={{ __html: resumeInfo?.summary }} />
          ) : (
            'Enter a brief description of your profession baground.'
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryPreview;
