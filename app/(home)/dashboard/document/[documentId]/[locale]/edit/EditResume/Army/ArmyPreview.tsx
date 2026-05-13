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
  const themeColor = resumeInfo?.themeColor || '#7c3aed';

  // Don't show section if no army service is entered
  if (!isLoading && !resumeInfo?.armyService) {
    return null;
  }

  return (
    <div className="my-3 w-full">
      <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
        {t('Military Service')}
      </h5>
      <hr
        className="mb-2 mt-2 border-[1.5px]"
        style={{
          borderColor: themeColor,
        }}
      />
      {isLoading ? (
        <Skeleton className="h-6 w-full" />
      ) : (
        <div className="text-[13px] !leading-4">
          <div dangerouslySetInnerHTML={{ __html: resumeInfo?.armyService || '' }} />
        </div>
      )}
    </div>
  );
};

export default ArmyPreview;
