'use client';

import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { toast, useGetDocumentById } from '@/hooks';
import { formatFileName } from '@/lib/helper';
import { useParams } from 'next/navigation';
import { DEFAULT_PAGES_ORDER } from '@/constant/resume-sections';
import RESUME_STYLES from '../../shared/resume-styles.css?inline';
import { normalizeResumeData } from '@/lib/utils';
import { ResumeContent } from '../../shared/ResumeContent';

interface PDFExporterProps {
  title: string;
  children: React.ReactNode;
}

export const PDFExporter: React.FC<PDFExporterProps> = ({ title, children }) => {
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const fixedResumeInfo = normalizeResumeData(data?.data);
  const pagesOrder = fixedResumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER;
  const themeColor = fixedResumeInfo?.themeColor || '#3b82f6';

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
      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.id = 'pdf-temp-container';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      document.body.appendChild(tempContainer);

      // Render the ResumeContent component
      const root = createRoot(tempContainer);
      await new Promise<void>(resolve => {
        root.render(
          <ResumeContent
            resumeInfo={fixedResumeInfo}
            pagesOrder={pagesOrder}
            themeColor={themeColor}
            isLoading={false}
            isPdfMode={true}
            isInteractive={false}
            fetchDataIndependently={false}
          />
        );
        // Give React time to render
        setTimeout(resolve, 100);
      }).catch(error => {
        console.error('Error rendering ResumeContent:', error);
        throw error;
      });

      // Get the rendered HTML
      const resumeElement = tempContainer.querySelector('#resume-content');
      if (!resumeElement) {
        throw new Error('Could not render resume content');
      }

      // Get all stylesheets from the document
      const stylesheets: string[] = [];

      // Add resume-specific styles
      stylesheets.push(RESUME_STYLES);

      // Get external stylesheets (like Tailwind) - only from same origin
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      for (const link of linkElements) {
        try {
          const href = (link as HTMLLinkElement).href;
          if (href && (href.startsWith(window.location.origin) || href.startsWith('/'))) {
            const response = await fetch(href);
            const css = await response.text();
            stylesheets.push(css);
          }
        } catch (e) {
          console.warn('Could not load stylesheet:', e);
        }
      }

      // Create complete HTML with all styles
      const completeHTML = `
        <!DOCTYPE html>
        <html lang="en">
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
            }
            
            .pdf-export {
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
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

            /* Print media query */
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
          <div class="pdf-export">
            ${resumeElement.outerHTML}
          </div>
        </body>
        </html>
      `;

      // Clean up the temporary container
      root.unmount();
      document.body.removeChild(tempContainer);

      // Send to API route for PDF generation
      const response = await fetch('/api/pdf-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: completeHTML,
          title: fileName.replace('.pdf', ''),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
        variant: 'default',
      });
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
  }, [title, fixedResumeInfo, pagesOrder, themeColor]);

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
