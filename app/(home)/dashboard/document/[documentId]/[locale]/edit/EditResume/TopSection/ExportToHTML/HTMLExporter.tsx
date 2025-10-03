'use client';

import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { toast, useGetDocumentById } from '@/hooks';
import { formatFileName } from '@/lib/helper';
import { useParams } from 'next/navigation';
import { DEFAULT_PAGES_ORDER } from '@/constant/resume-sections';
import RESUME_STYLES from '../../shared/resume-styles.css?inline';
import { normalizeResumeData } from '@/lib/utils';
import { ResumeContentBase } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/shared/ResumeContentBase';
import { getPagePrintStyles } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/shared/styles';
import { NextIntlClientProvider } from 'next-intl';

interface HTMLExporterProps {
  title: string;
  children: React.ReactNode;
}

// Function to load messages for the current locale
const loadMessages = async (locale: string) => {
  try {
    const messages = await import(`@/messages/${locale}.json`);
    return messages.default;
  } catch {
    // Fallback to English if locale file not found
    const messages = await import(`@/messages/en.json`);
    return messages.default;
  }
};

export const HTMLExporter: React.FC<HTMLExporterProps> = ({ title, children }) => {
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const documentId = param.documentId as string;
  const locale = (param.locale as string) || 'en';
  const { data } = useGetDocumentById(documentId);
  const fixedResumeInfo = normalizeResumeData(data?.data);
  const pagesOrder = fixedResumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER;
  const themeColor = fixedResumeInfo?.themeColor || '#3b82f6';
  const direction = fixedResumeInfo?.direction || 'ltr';

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
      // Load messages for current locale
      const messages = await loadMessages(locale);

      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.id = 'html-temp-container';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      document.body.appendChild(tempContainer);

      // Render the ResumeContent component with NextIntlClientProvider
      const root = createRoot(tempContainer);
      await new Promise<void>(resolve => {
        root.render(
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ResumeContentBase
              resumeInfo={fixedResumeInfo}
              pagesOrder={pagesOrder}
              themeColor={themeColor}
              isLoading={false}
              isInteractive={false}
              containerProps={{
                id: 'resume-content',
                ...getPagePrintStyles(themeColor),
              }}
            />
          </NextIntlClientProvider>
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

      // Try server-side HTML generation
      try {
        const response = await fetch('/api/html-export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html: completeHTML,
            title: fileName.replace('.html', ''),
          }),
        });

        if (response.ok) {
          // Download the HTML from server
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          // Clean up the temporary container after successful server generation
          root.unmount();
          document.body.removeChild(tempContainer);

          toast({
            title: 'Success',
            description: 'HTML downloaded successfully',
            variant: 'default',
          });
          return;
        } else {
          const errorText = await response.text();
          console.warn('Error response:', errorText);
          throw new Error('Server-side HTML generation failed');
        }
      } catch (serverError) {
        console.error('Server-side HTML generation error:', serverError);
        toast({
          title: 'Error',
          description: 'Failed to generate HTML',
          variant: 'destructive',
        });
      }

      // Clean up the temporary container
      root.unmount();
      document.body.removeChild(tempContainer);
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
