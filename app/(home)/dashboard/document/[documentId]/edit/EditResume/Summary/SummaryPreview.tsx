import { Skeleton } from '@/components';
import React, { FC } from 'react';
import { DocumentType } from '@/types';

interface PropsType {
  resumeInfo: DocumentType | undefined;
  isLoading: boolean;
}

const SummaryPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  return (
    <div className="min-h-10 w-full">
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
