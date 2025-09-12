import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGetDocumentById } from '@/hooks';
import { DEFAULT_PAGES_ORDER, syncPagesOrder } from '@/constant/resume-sections';
import { normalizeResumeData } from '@/lib/utils';
import { usePageOrderUpdate } from './pageOrderUtils';
import { DocumentType } from '@/types';

export const usePageOrderSync = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const documentData = data?.data as DocumentType;
  const fixedResumeInfo = normalizeResumeData(documentData);
  const { updatePagesOrder } = usePageOrderUpdate();

  const [currentOrder, setCurrentOrder] = useState<string[]>(fixedResumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER);

  useEffect(() => {
    if (fixedResumeInfo?.pagesOrder) {
      const currentPagesOrder = fixedResumeInfo.pagesOrder;
      const syncedOrder = syncPagesOrder(currentPagesOrder);

      if (JSON.stringify(currentPagesOrder) !== JSON.stringify(syncedOrder)) {
        updatePagesOrder(syncedOrder);
        setCurrentOrder(syncedOrder);
      } else {
        setCurrentOrder(currentPagesOrder);
      }
    }
  }, [fixedResumeInfo?.pagesOrder]);

  return {
    currentOrder,
    setCurrentOrder,
    updatePagesOrder,
    documentData,
    fixedResumeInfo,
    isLoading,
  };
};
