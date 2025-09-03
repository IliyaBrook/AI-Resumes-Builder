'use client';

import React, { useState } from 'react';
import { DownloadIcon, Eye } from 'lucide-react';
import { Button } from '@/components';
import { StatusType } from '@/types';
import { PDFExporter } from './PDFExporter';
import { PDFDebugPreview } from './PDFDebugPreview';

const Download = (props: { title: string; isLoading: boolean; status?: StatusType }) => {
  const { title, status, isLoading } = props;
  const [loading, setLoading] = useState(false);
  const [showDebugPreview, setShowDebugPreview] = useState(false);

  // Enable debug mode by default, can be controlled via env variable
  const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_PDF !== 'false';

  return (
    <>
      <div className="flex items-center gap-2">
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

        {isDebugMode && (
          <Button
            disabled={isLoading || status === 'archived'}
            variant="secondary"
            className="lg:min-w-auto min-w-9 gap-1 border bg-white !p-1 dark:bg-gray-800 lg:p-4"
            onClick={() => setShowDebugPreview(true)}
          >
            <div className="flex items-center gap-1">
              <Eye size="17px" />
              <span className="hidden lg:flex">Preview PDF</span>
            </div>
          </Button>
        )}
      </div>

      <PDFDebugPreview isOpen={showDebugPreview} onCloseAction={() => setShowDebugPreview(false)} />
    </>
  );
};

export default Download;
