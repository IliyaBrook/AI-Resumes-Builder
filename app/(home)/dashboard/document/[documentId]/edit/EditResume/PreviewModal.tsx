'use client';
// components
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components';

import { Eye, FileText } from 'lucide-react';
import React from 'react';
import ResumePreview from './ResumePreview';
import { useGetDocumentById } from '@/hooks';
import { useParams } from 'next/navigation';

const PreviewModal = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={isLoading || resumeInfo?.status === 'archived'}
          variant="secondary"
          className="w-9 gap-1 border bg-white !p-2 dark:bg-gray-800 lg:w-auto lg:p-4"
        >
          <div className="flex items-center gap-1">
            <Eye size="17px" />
            <span className="hidden lg:flex">Preview</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto p-0 sm:max-w-4xl lg:max-h-[95vh]">
        <DialogHeader className="sticky top-0 z-10 !m-0 bg-white !pb-0 backdrop-blur dark:bg-black/80">
          <DialogTitle className="flex items-center gap-1 px-3 pt-2 text-[20px] font-semibold opacity-100">
            <FileText size="20px" className="stroke-primary" />
            {resumeInfo?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="h-full w-full px-2 pb-4">
          <ResumePreview />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
