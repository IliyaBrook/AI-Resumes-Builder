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

  const [currentOrder, setCurrentOrder] = useState<string[]>(DEFAULT_PAGES_ORDER);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (fixedResumeInfo?.pagesOrder && !isInitialized) {
      const currentPagesOrder = fixedResumeInfo.pagesOrder;
      const syncedOrder = syncPagesOrder(currentPagesOrder);

      if (JSON.stringify(currentPagesOrder) !== JSON.stringify(syncedOrder)) {
        updatePagesOrder(syncedOrder);
        setCurrentOrder(syncedOrder);
      } else {
        setCurrentOrder(currentPagesOrder);
      }
      setIsInitialized(true);
    }
  }, [fixedResumeInfo?.pagesOrder, isInitialized]);

  return {
    currentOrder,
    setCurrentOrder,
    updatePagesOrder,
    documentData,
    fixedResumeInfo,
    isLoading,
  };
};
