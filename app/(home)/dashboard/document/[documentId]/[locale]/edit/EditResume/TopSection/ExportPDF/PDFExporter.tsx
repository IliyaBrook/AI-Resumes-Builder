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

interface PDFExporterProps {
  title: string;
  children: React.ReactNode;
}

export const PDFExporter: React.FC<PDFExporterProps> = ({ title, children }) => {
  const [loading, setLoading] = useState(false);
  const { locale, fixedResumeInfo, pagesOrder, themeColor, direction } = useExportResumeData();

  const generatePDFFromHTML = useCallback(async () => {
    if (!fixedResumeInfo) {
      toast({
        title: 'Error',
        description: 'Resume data not available',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const fileName = formatFileName(title);

    try {
      const messages = await loadMessages(locale);
      const { resumeElement, cleanup } = await renderResumeToTempContainer({
        containerId: 'pdf-temp-container',
        fixedResumeInfo,
        pagesOrder,
        themeColor,
        locale,
        messages,
      });

      const resumeElementClone = resumeElement.cloneNode(true) as HTMLElement;
      const stylesheets = await collectStylesheets();

      const completeHTML = `
        <!DOCTYPE html>
        <html lang="en" dir="${direction}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume</title>
          <style>
            ${stylesheets.join('\\n')};

            /* PDF-specific styles */
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

            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          ${resumeElement.outerHTML}
        </body>
        </html>
      `;

      let serverSucceeded = false;
      try {
        const response = await fetch('/api/pdf-export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            html: completeHTML,
            title: fileName.replace('.pdf', ''),
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          downloadBlob(blob, fileName);
          serverSucceeded = true;
          toast({
            title: 'Success',
            description: 'PDF downloaded successfully (server-side)',
            variant: 'default',
          });
        } else {
          const errorText = await response.text();
          console.warn('Error response:', errorText);
        }
      } catch (serverError) {
        console.warn('Server-side PDF generation error:', serverError);
      }

      cleanup();

      if (serverSucceeded) {
        return;
      }

      try {
        const html2pdf = (await import('html2pdf.js')).default;

        const opt = {
          margin: 0,
          filename: fileName,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: 794,
            height: 1123,
            logging: false,
          },
          jsPDF: {
            unit: 'mm' as const,
            format: 'a4',
            orientation: 'portrait' as const,
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };

        const clientTempContainer = document.createElement('div');
        clientTempContainer.style.position = 'absolute';
        clientTempContainer.style.left = '-9999px';
        clientTempContainer.style.width = '210mm';
        clientTempContainer.style.fontFamily = 'Open Sans, sans-serif';
        clientTempContainer.appendChild(resumeElementClone);
        document.body.appendChild(clientTempContainer);

        await html2pdf().set(opt).from(resumeElementClone).save();

        document.body.removeChild(clientTempContainer);

        toast({
          title: 'Success',
          description: 'PDF downloaded successfully (client-side fallback)',
          variant: 'default',
        });
      } catch (clientError) {
        console.error('Client-side PDF generation failed:', clientError);
        toast({
          title: 'Error',
          description: 'Both server-side and client-side PDF generation failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
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
      void generatePDFFromHTML();
    },
    [generatePDFFromHTML]
  );

  return (
    <div onClick={handleClick} style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
      {React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleClick,
      })}
    </div>
  );
};
