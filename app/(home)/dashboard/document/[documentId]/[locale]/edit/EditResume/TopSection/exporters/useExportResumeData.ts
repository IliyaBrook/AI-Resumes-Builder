'use client';

import { useParams } from 'next/navigation';
import { useGetDocumentById } from '@/hooks';
import { normalizeResumeData } from '@/lib/utils';
import { DEFAULT_PAGES_ORDER } from '@/constant/resume-sections';
import { DocumentType } from '@/types';

interface ExportResumeData {
  documentId: string;
  locale: string;
  fixedResumeInfo: DocumentType | null;
  pagesOrder: string[];
  themeColor: string;
  direction: string;
}

export const useExportResumeData = (): ExportResumeData => {
  const param = useParams();
  const documentId = param.documentId as string;
  const locale = (param.locale as string) || 'en';
  const { data } = useGetDocumentById(documentId);
  const fixedResumeInfo = normalizeResumeData(data?.data);
  const pagesOrder = fixedResumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER;
  const themeColor = fixedResumeInfo?.themeColor || '#3b82f6';
  const direction = fixedResumeInfo?.direction || 'ltr';

  return { documentId, locale, fixedResumeInfo, pagesOrder, themeColor, direction };
};
