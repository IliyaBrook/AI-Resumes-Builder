'use client';
import { useGetDocumentById, useUpdateDocument } from '@/hooks';
import { AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback } from 'react';
import { Download, MoreOption, ResumeTitle, ThemeColor } from '@/editResume';
import { PreviewPdfButton } from './PreviewPDF';
import { DirectionToggle } from '@/components';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

const TopSection = () => {
  const t = useTranslations('TopSection');
  const tCommon = useTranslations('Common');

  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo, isPending } = useUpdateDocument();

  const titleTest = tCommon('untitledResume');
  console.log('titleTest: ', titleTest);
  const handleTitle = useCallback(
    (title: string) => {
      if (title === tCommon('untitledResume') && !title) return;
      setResumeInfo({ title });
    },
    [setResumeInfo, tCommon]
  );
  return (
    <>
      {resumeInfo?.status === 'archived' && (
        <div className="absolute inset-0 top-0 z-[9] flex h-6 items-center justify-center gap-x-2 bg-rose-500 p-2 text-center text-base font-medium text-white">
          <AlertCircle size="16px" />
          {t('archivedResume')}
        </div>
      )}
      <div className="flex w-full items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <ResumeTitle
            isLoading={isLoading || isPending}
            initialTitle={resumeInfo?.title || ''}
            status={resumeInfo?.status}
            onSave={(value: string) => handleTitle(value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DirectionToggle />
          <LanguageSwitcher />
          <ThemeColor />
          <Download
            title={resumeInfo?.title || tCommon('untitledResume')}
            status={resumeInfo?.status}
            isLoading={isLoading}
          />
          <PreviewPdfButton />
          <MoreOption />
        </div>
      </div>
    </>
  );
};

export default TopSection;
