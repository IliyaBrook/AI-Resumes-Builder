'use client';

import React, { useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { Button } from '@/components';
import { StatusType } from '@/types/resume.type';
import { PDFExporter } from './PDFExporter';

const Download = (props: { title: string; isLoading: boolean; status?: StatusType }) => {
  const { title, status, isLoading } = props;
  const [loading, setLoading] = useState(false);

  return (
    <PDFExporter title={title}>
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
    </PDFExporter>
  );
};

export default Download;