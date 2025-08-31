'use client';

import React, { useCallback, useState } from 'react';
import { toast } from '@/hooks';
import { formatFileName } from '@/lib/helper';

interface PDFExporterProps {
  title: string;
  children: React.ReactNode;
}

export const PDFExporter: React.FC<PDFExporterProps> = ({ title, children }) => {
  const [loading, setLoading] = useState(false);

  const generatePDFFromHTML = useCallback(async () => {
    const resumeElement = document.getElementById('resume-preview-id');
    if (!resumeElement) {
      toast({
        title: 'Error',
        description: 'Could not find resume preview',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const fileName = formatFileName(title);

    try {
      // Get all stylesheets from the document
      const stylesheets: string[] = [];

      // Get inline styles
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        stylesheets.push(style.innerHTML);
      });

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

      // Get computed styles for the resume element
      const computedStyles = window.getComputedStyle(resumeElement);
      const importantStyles = ['font-family', 'font-size', 'line-height', 'color', 'background-color'];

      let elementStyles = '';
      importantStyles.forEach(prop => {
        const value = computedStyles.getPropertyValue(prop);
        if (value) {
          elementStyles += `${prop}: ${value} !important; `;
        }
      });

      // Create complete HTML with all styles
      const completeHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume</title>
          <style>
            ${stylesheets.join('\n')}
            
            /* PDF-specific styles */
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .pdf-export {
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            /* Apply computed styles to resume element */
            #resume-preview-id {
              ${elementStyles}
            }

            /* Hide interactive elements */
            .section-wrapper:hover,
            .section-wrapper.bg-blue-50,
            .absolute.right-2.top-2,
            .absolute.left-4.top-4,
            .cursor-pointer {
              background: transparent !important;
              ring: none !important;
              box-shadow: none !important;
              cursor: default !important;
            }
            
            .absolute.right-2.top-2,
            .absolute.left-4.top-4 {
              display: none !important;
            }

            /* Remove hover effects */
            button:hover,
            .hover\\:underline:hover {
              background: inherit !important;
              text-decoration: none !important;
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
  }, [title]);

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
