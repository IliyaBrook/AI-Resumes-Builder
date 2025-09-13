import React, { FC } from 'react';
import { SkeletonLoader } from '@/components';
import { INITIAL_THEME_COLOR } from '@/lib/helper';
import { DocumentType } from '@/types';
import { useTranslations } from 'next-intl';

interface PropsType {
  resumeInfo: DocumentType | undefined;
  isLoading: boolean;
}

const LanguagePreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const t = useTranslations('Languages');
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
    <div className="my-3 w-full">
      <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
        {resumeInfo?.languagesSectionTitle?.trim() || t('Languages')}
      </h5>
      <hr className="mb-2 mt-2 border-[1.5px]" style={{ borderColor: themeColor }} />
      <div className="grid min-h-9 grid-cols-2 gap-x-8 gap-y-1">
        {languages.map((language, index) => (
          <div key={language.id || index} className="flex items-center justify-between">
            <span className="text-[13px] font-medium">{language.name}</span>
            {language.level && language.level.trim() && (
              <span className="text-[12px] text-gray-600">{language.level}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguagePreview;
