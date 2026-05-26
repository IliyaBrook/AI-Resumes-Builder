'use client';

import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components';
import { PreviewPDF } from './PreviewPDF';
import { useTranslations } from 'next-intl';

export const PreviewPdfButton = () => {
  const t = useTranslations('TopSection');
  const [showDebugPreview, setShowDebugPreview] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="min-w-9 gap-1 border bg-white !p-1 lg:min-w-auto lg:p-4 dark:bg-gray-800"
          onClick={() => setShowDebugPreview(true)}
        >
          <div className="flex items-center gap-1">
            <Eye size="17px" />
            <span className="hidden lg:flex">{t('Preview PDF')}</span>
          </div>
        </Button>
      </div>

      <PreviewPDF isOpen={showDebugPreview} onCloseAction={() => setShowDebugPreview(false)} />
    </>
  );
};
