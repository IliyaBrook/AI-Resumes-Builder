import React, { FC } from 'react';
import { Skeleton } from '@/components';
import { INITIAL_THEME_COLOR } from '@/lib/helper';
import { DocumentType } from '@/types';
import { useTranslations } from 'next-intl';

interface PropsType {
  resumeInfo: DocumentType | undefined;
  isLoading: boolean;
}

const formatCategories = (value?: string | null) => {
  return (
    value
      ?.split(',')
      .map(category => category.trim())
      .filter(Boolean)
      .join(', ') || ''
  );
};

const DrivingLicensePreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const t = useTranslations('DrivingLicense');
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;
  const categories = formatCategories(resumeInfo?.drivingLicense);

  if (!isLoading && !categories) {
    return null;
  }

  return (
    <div className="my-3 w-full">
      <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
        {t('Driving License')}
      </h5>
      <hr className="mt-2 mb-2 border-[1.5px]" style={{ borderColor: themeColor }} />
      {isLoading ? (
        <Skeleton className="h-5 w-full" />
      ) : (
        <div className="flex flex-wrap items-baseline gap-x-1 text-[13px] !leading-4">
          <span className="font-semibold">{t('Categories')}:</span>
          <span>{categories}</span>
        </div>
      )}
    </div>
  );
};

export default DrivingLicensePreview;
