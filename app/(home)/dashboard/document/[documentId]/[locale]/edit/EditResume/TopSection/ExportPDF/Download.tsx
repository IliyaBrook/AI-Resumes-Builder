'use client';

import React, { useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { Button } from '@/components';
import { StatusType } from '@/types';
import { PDFExporter } from './PDFExporter';
import { useTranslations } from 'next-intl';

const Download = (props: { title: string; isLoading: boolean; status?: StatusType }) => {
  const t = useTranslations('TopSection');
  const { title, status, isLoading } = props;
  const [loading, setLoading] = useState(false);

  return (
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
            <span className="hidden lg:flex">{loading ? t('Generating PDF') : t('Download Resume')}</span>
          </div>
        </Button>
      </PDFExporter>
    </div>
  );
};

export default Download;
