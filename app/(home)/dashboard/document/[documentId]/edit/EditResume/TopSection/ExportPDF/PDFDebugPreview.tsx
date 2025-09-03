'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useParams } from 'next/navigation';
import { useGetDocumentById } from '@/hooks';
import { normalizeResumeData, ResumeContent } from '../../shared/ResumeContent';
import { DEFAULT_PAGES_ORDER } from '@/constant/resume-sections';

interface PDFDebugPreviewProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export const PDFDebugPreview: React.FC<PDFDebugPreviewProps> = ({ isOpen, onCloseAction }) => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const fixedResumeInfo = normalizeResumeData(data?.data);
  const pagesOrder = fixedResumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER;

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-h-[90vh] max-w-[900px] p-0">
        <div className="h-full max-h-[85vh] overflow-y-auto p-6">
          <div className="mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
            <div className="rounded-lg border bg-white shadow-lg">
              <ResumeContent
                resumeInfo={fixedResumeInfo}
                pagesOrder={pagesOrder}
                themeColor={fixedResumeInfo?.themeColor}
                isLoading={isLoading}
                isPdfMode={true}
                isInteractive={false}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
