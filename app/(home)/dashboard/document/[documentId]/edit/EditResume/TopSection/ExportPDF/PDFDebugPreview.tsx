'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components';
import { X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useGetDocumentById } from '@/hooks';
import { normalizeResumeData, ResumeContent } from '../../shared/ResumeContent';
import { DEFAULT_PAGES_ORDER } from '@/constant/resume-sections';

interface PDFDebugPreviewProps {
  title: string;
  isOpen: boolean;
  onCloseAction: () => void;
}

export const PDFDebugPreview: React.FC<PDFDebugPreviewProps> = ({ title, isOpen, onCloseAction }) => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const fixedResumeInfo = normalizeResumeData(data?.data);
  const pagesOrder = fixedResumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER;

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-h-[90vh] max-w-[900px] overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center justify-between">
            <span>PDF Preview: {title}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseAction}
              className="size-8 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={18} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-auto px-6 py-4">
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

        <div className="border-t bg-gray-50 px-6 py-3 text-center text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          This preview shows exactly what will be exported to PDF
        </div>
      </DialogContent>
    </Dialog>
  );
};
