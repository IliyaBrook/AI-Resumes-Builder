'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import { ResumeContent } from '../../shared/ResumeContent';
import type { DocumentType } from '@/types/resume.type';

interface PagedResumeContentProps {
  resumeInfo: DocumentType;
  pagesOrder: string[];
  themeColor: string;
  isLoading: boolean;
  selectedSection: string | null;
  onSectionClick: (sectionKey: string) => void;
  renderSectionWrapper: (sectionKey: string, component: React.ReactNode, isSelected: boolean) => React.ReactNode;
}

interface PageInfo {
  pageNumber: number;
  content: React.ReactNode;
  hasOverflow: boolean;
  isLastPage?: boolean;
}

// A4 page height in pixels (approximately)
const PAGE_CONTENT_HEIGHT_PX = 950; // Accounting for margins

export const PagedResumeContent: React.FC<PagedResumeContentProps> = ({
  resumeInfo,
  pagesOrder,
  themeColor,
  isLoading,
  selectedSection,
  onSectionClick,
  renderSectionWrapper,
}) => {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Measure the full content height
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const needsMultiplePages = contentHeight > PAGE_CONTENT_HEIGHT_PX;

      // Calculate number of pages needed
      const pagesNeeded = Math.ceil(contentHeight / PAGE_CONTENT_HEIGHT_PX);

      // Create pages array
      const newPages: PageInfo[] = [];

      for (let i = 0; i < Math.min(pagesNeeded, 3); i++) {
        newPages.push({
          pageNumber: i + 1,
          content: (
            <div
              style={{
                position: 'absolute',
                top: `-${i * PAGE_CONTENT_HEIGHT_PX}px`,
                left: 0,
                right: 0,
              }}
            >
              <ResumeContent
                key={`pdf-page-${i + 1}`}
                resumeInfo={resumeInfo}
                pagesOrder={pagesOrder}
                themeColor={themeColor}
                isLoading={isLoading}
                isPdfMode={true}
                isInteractive={true}
                selectedSection={selectedSection}
                onSectionClick={onSectionClick}
                renderSectionWrapper={renderSectionWrapper}
                // TODO check/test render in pdf debug mode
                // renderSectionWrapper={i === 0 ? renderSectionWrapper : (key, component) => component}
              />
            </div>
          ),
          hasOverflow: i === 0 && needsMultiplePages,
          isLastPage: i === pagesNeeded - 1,
        });
      }

      // If content fits on one page, just show one page
      if (!needsMultiplePages) {
        newPages[0] = {
          pageNumber: 1,
          content: (
            <ResumeContent
              key="pdf-page-1"
              resumeInfo={resumeInfo}
              pagesOrder={pagesOrder}
              themeColor={themeColor}
              isLoading={isLoading}
              isPdfMode={true}
              isInteractive={true}
              selectedSection={selectedSection}
              onSectionClick={onSectionClick}
              renderSectionWrapper={renderSectionWrapper}
            />
          ),
          hasOverflow: false,
          isLastPage: true,
        };
      }

      setPages(newPages);
    }
  }, [resumeInfo, pagesOrder, themeColor, isLoading, selectedSection, onSectionClick, renderSectionWrapper]);

  const renderPage = (page: PageInfo, index: number) => {
    return (
      <div key={`page-${page.pageNumber}`} className="relative mx-auto mb-6">
        {/* Page header */}
        <div className="absolute -top-10 left-0 flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-700">📄 Page {page.pageNumber}</div>
          {page.hasOverflow && (
            <div className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-600">⚠️ Content overflow</div>
          )}
        </div>

        {/* Page content */}
        <div
          className="relative overflow-hidden border border-gray-300 bg-white shadow-2xl"
          style={{
            width: '210mm',
            height: '297mm',
            padding: '20mm 15mm',
            boxSizing: 'border-box',
          }}
        >
          <div className="h-full w-full overflow-hidden">{page.content}</div>

          {/* Page break indicator */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r opacity-75"
            style={{
              backgroundImage: `linear-gradient(90deg, 
                hsl(${(page.pageNumber - 1) * 60}, 70%, 60%), 
                hsl(${page.pageNumber * 60}, 70%, 60%))`,
            }}
          />

          {/* Page number */}
          <div className="absolute bottom-2 right-4 text-xs font-medium text-gray-400">{page.pageNumber}</div>
        </div>

        {/* Page info */}
        <div className="mt-2 text-center text-xs text-gray-500">
          A4 (210 × 297 mm) • {index === 0 ? 'Main content' : 'Additional content'}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hidden container for measuring full content */}
      <div ref={contentRef} className="invisible absolute -left-[9999px]" style={{ width: '180mm' }}>
        <ResumeContent
          key="pdf-measure"
          resumeInfo={resumeInfo}
          pagesOrder={pagesOrder}
          themeColor={themeColor}
          isLoading={isLoading}
          isPdfMode={true}
          isInteractive={false}
          selectedSection={null}
          onSectionClick={() => {}}
          renderSectionWrapper={(key, component) => component}
        />
      </div>

      {/* Render all pages */}
      {pages.map((page, index) => renderPage(page, index))}

      {/* Additional empty pages for preview */}
      {pages.length === 1 && (
        <>
          {/* Page 2 - Empty */}
          <div className="relative mx-auto mb-6">
            <div className="absolute -top-10 left-0 text-sm font-semibold text-gray-400">📄 Page 2 (Preview)</div>
            <div
              className="relative border border-dashed border-gray-200 bg-white shadow-lg"
              style={{
                width: '210mm',
                height: '297mm',
                padding: '20mm 15mm',
                boxSizing: 'border-box',
              }}
            >
              <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                Additional content will appear here if needed...
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400 opacity-50" />
              <div className="absolute bottom-2 right-4 text-xs font-medium text-gray-300">2</div>
            </div>
            <div className="mt-2 text-center text-xs text-gray-400">A4 (210 × 297 mm) • Empty page</div>
          </div>

          {/* Page 3 - Empty */}
          <div className="relative mx-auto mb-6">
            <div className="absolute -top-10 left-0 text-sm font-semibold text-gray-400">📄 Page 3 (Preview)</div>
            <div
              className="relative border border-dashed border-gray-200 bg-white shadow-lg"
              style={{
                width: '210mm',
                height: '297mm',
                padding: '20mm 15mm',
                boxSizing: 'border-box',
              }}
            >
              <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                Additional content will appear here if needed...
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400 opacity-50" />
              <div className="absolute bottom-2 right-4 text-xs font-medium text-gray-300">3</div>
            </div>
            <div className="mt-2 text-center text-xs text-gray-400">A4 (210 × 297 mm) • Empty page</div>
          </div>
        </>
      )}
    </div>
  );
};
