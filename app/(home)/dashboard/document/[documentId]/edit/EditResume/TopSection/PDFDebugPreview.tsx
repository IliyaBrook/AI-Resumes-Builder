'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components';

interface PDFDebugPreviewProps {
  title: string;
  onCloseAction: () => void;
}

export const PDFDebugPreview: React.FC<PDFDebugPreviewProps> = ({ title, onCloseAction }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateDebugHTML = () => {
      const resumeElement = document.getElementById('resume-preview-id');
      if (!resumeElement) {
        setHtmlContent('<div class="p-4 text-red-500">Could not find resume preview element</div>');
        setLoading(false);
        return;
      }

      // Get all stylesheets from the document
      const stylesheets: string[] = [];

      // Get inline styles
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        stylesheets.push(style.innerHTML);
      });

      // Get external stylesheets (like Tailwind) - only from same origin
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      const fetchStylesheets = Array.from(linkElements).map(async link => {
        try {
          const href = (link as HTMLLinkElement).href;
          if (href && (href.startsWith(window.location.origin) || href.startsWith('/'))) {
            const response = await fetch(href);
            return await response.text();
          }
        } catch (e) {
          console.warn('Could not load stylesheet:', e);
        }
        return '';
      });

      Promise.all(fetchStylesheets)
        .then(cssArray => {
          stylesheets.push(...cssArray.filter(css => css));

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
            <title>Resume Debug Preview</title>
            <style>
              ${stylesheets.join('\n')};
              
              /* PDF-specific styles */
              body {
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              .pdf-debug-container {
                background: white;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin: 0 auto;
                border-radius: 8px;
                overflow: hidden;
              }
              
              .pdf-export {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              /* Fix list styling for PDF - Keep original content bullets, remove CSS bullets */
              .exp-preview ul {
                list-style-type: none !important;
                list-style-position: outside !important;
                padding-left: 0.85em !important;
                margin: 0 !important;
              }
              
              .exp-preview li {
                display: block !important;
                margin-bottom: 0.2em !important;
                text-indent: 0 !important;
                padding-left: 0 !important;
                list-style-type: none !important;
              }
              
              /* Ensure other lists still work properly */
              #resume-preview-id ul:not(.exp-preview ul) {
                list-style-type: disc !important;
                padding-left: 1.2em !important;
              }
              
              #resume-preview-id li:not(.exp-preview li) {
                display: list-item !important;
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
            <div class="pdf-debug-container">
              <div class="pdf-export">
                ${resumeElement.outerHTML}
              </div>
            </div>
          </body>
          </html>
        `;

          setHtmlContent(completeHTML);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to build debug HTML:', err);
          setHtmlContent('<div class="p-4 text-red-500">Failed to build debug preview</div>');
          setLoading(false);
        });
    };

    generateDebugHTML();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span>Loading PDF preview...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b bg-white px-4 py-3">
          <h2 className="text-lg font-semibold">PDF Debug Preview - {title}</h2>
          <Button variant="ghost" size="sm" onClick={onCloseAction} className="h-8 w-8 p-1">
            <X size={16} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100">
          <iframe srcDoc={htmlContent} className="h-full w-full border-0" title="PDF Debug Preview" />
        </div>
      </div>
    </div>
  );
};
