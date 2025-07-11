'use client';

import React, { useCallback, useState } from 'react';
import { DownloadCloud } from 'lucide-react';
import { Button } from '@/components';
import { toast } from '@/hooks';
import { formatFileName } from '@/lib/helper';
import { StatusType } from '@/types/resume.type';

const Download = (props: { title: string; isLoading: boolean; status?: StatusType }) => {
  const { title, status, isLoading } = props;
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    const resumeElement = document.getElementById('resume-preview-id');
    if (!resumeElement) {
      toast({
        title: 'Error',
        description: 'Could not download',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const fileName = formatFileName(title);
    try {
      resumeElement.classList.add('pdf-export');
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(resumeElement)
        .save();
    } catch {
      toast({
        title: 'Error',
        description: 'Error generating PDF',
        variant: 'destructive',
      });
    } finally {
      resumeElement.classList.remove('pdf-export');
      setLoading(false);
    }
  }, [title]);

  const handleDownloadClick = useCallback(() => {
    void handleDownload();
  }, [handleDownload]);

  return (
    <Button
      disabled={isLoading || loading || status === 'archived'}
      variant="secondary"
      className="lg:min-w-auto min-w-9 gap-1 border bg-white !p-1 dark:bg-gray-800 lg:p-4"
      onClick={handleDownloadClick}
    >
      <div className="flex items-center gap-1">
        <DownloadCloud size="17px" />
        <span className="hidden lg:flex">{loading ? 'Generating PDF' : 'Download Resume'}</span>
      </div>
    </Button>
  );
};

export default Download;
