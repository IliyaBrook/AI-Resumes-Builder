'use client';

import React, { useCallback, useState } from 'react';
import { toast } from '@/hooks';
import { formatFileName } from '@/lib/helper';
import {
  collectStylesheets,
  downloadBlob,
  loadMessages,
  renderResumeToTempContainer,
  useExportResumeData,
} from '../exporters';

interface HTMLExporterProps {
  title: string;
  children: React.ReactNode;
}

export const HTMLExporter: React.FC<HTMLExporterProps> = ({ title, children }) => {
  const [loading, setLoading] = useState(false);
  const { locale, fixedResumeInfo, pagesOrder, themeColor, direction } = useExportResumeData();

  const generateHTMLExport = useCallback(async () => {
    if (!fixedResumeInfo) {
      toast({
        title: 'Error',
        description: 'Resume data not available',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const fileName = formatFileName(title).replace('.pdf', '.html');

    try {
      const messages = await loadMessages(locale);
      const { resumeElement, cleanup } = await renderResumeToTempContainer({
        containerId: 'html-temp-container',
        fixedResumeInfo,
        pagesOrder,
        themeColor,
        locale,
        messages,
      });

      const stylesheets = await collectStylesheets();

      const completeHTML = `
        <!DOCTYPE html>
        <html lang="en" dir="${direction}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume</title>
          <style>
            ${stylesheets.join('\n')};

            /* HTML export specific styles */
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'Open Sans', sans-serif;
              direction: ${direction};
            }

            #resume-content {
              margin: 0;
              direction: ${direction};
            }

            /* Ensure proper font rendering */
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            /* Force font weights */
            .font-bold {
              font-weight: 700 !important;
            }

            .font-semibold {
              font-weight: 600 !important;
            }
          </style>
        </head>
        <body>
          ${resumeElement.outerHTML}
        </body>
        </html>
      `;

      try {
        const response = await fetch('/api/html-export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            html: completeHTML,
            title: fileName.replace('.html', ''),
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          downloadBlob(blob, fileName);
          toast({
            title: 'Success',
            description: 'HTML downloaded successfully',
            variant: 'default',
          });
        } else {
          const errorText = await response.text();
          console.warn('Error response:', errorText);
          toast({
            title: 'Error',
            description: 'Failed to generate HTML',
            variant: 'destructive',
          });
        }
      } catch (serverError) {
        console.error('Server-side HTML generation error:', serverError);
        toast({
          title: 'Error',
          description: 'Failed to generate HTML',
          variant: 'destructive',
        });
      }

      cleanup();
    } catch (error) {
      console.error('HTML generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate HTML',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [title, fixedResumeInfo, pagesOrder, themeColor, locale, direction]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      void generateHTMLExport();
    },
    [generateHTMLExport]
  );

  return (
    <div onClick={handleClick} style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
      {React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleClick,
      })}
    </div>
  );
};
