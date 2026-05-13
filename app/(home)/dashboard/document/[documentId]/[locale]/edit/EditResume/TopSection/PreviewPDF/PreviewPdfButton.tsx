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
          className="lg:min-w-auto min-w-9 gap-1 border bg-white !p-1 dark:bg-gray-800 lg:p-4"
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
