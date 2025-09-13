'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetDocumentById, useUpdateDocument } from '@/hooks';
import DefaultSkillsForm from './DefaultSkillsForm';
import CategorySkillsForm from './CategorySkillsForm';

const SkillsForm = () => {
  const t = useTranslations('Skills');
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, refetch } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();

  const [format, setFormat] = useState<'default' | 'byCategory'>('default');

  useEffect(() => {
    if (
      resumeInfo?.skillsDisplayFormat &&
      (resumeInfo.skillsDisplayFormat === 'default' || resumeInfo.skillsDisplayFormat === 'byCategory')
    ) {
      setFormat(resumeInfo.skillsDisplayFormat);
    }
  }, [resumeInfo?.skillsDisplayFormat]);

  const handleFormatChange = (newFormat: 'default' | 'byCategory') => {
    setFormat(newFormat);
    setResumeInfo({ skillsDisplayFormat: newFormat });
  };

  return (
    <div>
      <div className="mb-2 flex w-full items-center gap-4">
        <h2 className="text-lg font-bold">{t('Skills')}</h2>
        <select
          className="rounded border px-2 py-1 text-sm"
          value={format}
          onChange={e => handleFormatChange(e.target.value as 'default' | 'byCategory')}
        >
          <option value="default">{t('Default')}</option>
          <option value="byCategory">{t('By category')}</option>
        </select>
      </div>
      <p className="text-sm">{t('Add your skills information')}</p>

      {format === 'default' ? (
        <DefaultSkillsForm resumeInfo={resumeInfo} />
      ) : (
        <CategorySkillsForm resumeInfo={resumeInfo} refetchResumeInfo={refetch} />
      )}
    </div>
  );
};

export default SkillsForm;
