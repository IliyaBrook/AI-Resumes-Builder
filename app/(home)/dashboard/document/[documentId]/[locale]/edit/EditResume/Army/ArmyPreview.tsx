import { Skeleton } from '@/components';
import React, { FC } from 'react';
import { DocumentType } from '@/types';
import { useTranslations } from 'next-intl';

interface PropsType {
  resumeInfo: DocumentType | undefined;
  isLoading: boolean;
}

const ArmyPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const t = useTranslations('Army');

  // Don't show section if no army service is entered
  if (!isLoading && !resumeInfo?.armyService) {
    return null;
  }

  return (
    <div className="min-h-10 w-full">
      <h2 className="mb-3 text-[15px] font-bold text-primary">{t('Military Service')}</h2>
      {isLoading ? (
        <Skeleton className="h-6 w-full" />
      ) : (
        <div className="text-[13px] !leading-4">
          {resumeInfo?.armyService ? (
            <div dangerouslySetInnerHTML={{ __html: resumeInfo.armyService }} />
          ) : (
            t('Enter military service details')
          )}
        </div>
      )}
    </div>
  );
};

export default ArmyPreview;
