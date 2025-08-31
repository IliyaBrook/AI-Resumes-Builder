'use client';

import React, { useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { Button } from '@/components';
import { formatFileName } from '@/lib/helper';
import { ResumeDataType, StatusType } from '@/types/resume.type';
import { PDFGenerator } from './PDFGenerator';
import { useGetDocumentById } from '@/hooks';
import { useParams } from 'next/navigation';
import { DEFAULT_PAGES_ORDER } from '@/constant/resume-sections';

const Download = (props: { title: string; isLoading: boolean; status?: StatusType }) => {
  const { title, status, isLoading } = props;
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);

  const resumeInfo = data?.data as ResumeDataType;
  const pagesOrder = resumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER;
  const fileName = formatFileName(title);

  if (!resumeInfo) {
    return (
      <Button
        disabled={true}
        variant="secondary"
        className="lg:min-w-auto min-w-9 gap-1 border bg-white !p-1 dark:bg-gray-800 lg:p-4"
      >
        <div className="flex items-center gap-1">
          <DownloadIcon size="17px" />
          <span className="hidden lg:flex">Loading...</span>
        </div>
      </Button>
    );
  }

  return (
    <PDFGenerator resumeInfo={resumeInfo} pagesOrder={pagesOrder} fileName={fileName}>
      <Button
        disabled={isLoading || loading || status === 'archived'}
        variant="secondary"
        className="lg:min-w-auto min-w-9 gap-1 border bg-white !p-1 dark:bg-gray-800 lg:p-4"
        onClick={() => setLoading(true)}
        onMouseUp={() => setTimeout(() => setLoading(false), 100)}
      >
        <div className="flex items-center gap-1">
          <DownloadIcon size="17px" />
          <span className="hidden lg:flex">{loading ? 'Generating PDF' : 'Download Resume'}</span>
        </div>
      </Button>
    </PDFGenerator>
  );
};

export default Download;
