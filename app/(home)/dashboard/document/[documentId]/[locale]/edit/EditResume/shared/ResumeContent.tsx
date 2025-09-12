'use client';
import React, { useState, useRef, useLayoutEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGetDocumentById } from '@/hooks';
import { DEFAULT_PAGES_ORDER, SECTION_COMPONENTS, type SectionKey } from '@/constant/resume-sections';
import { cn, normalizeResumeData } from '@/lib/utils';
import { DocumentType } from '@/types';
import RESUME_STYLES from './resume-styles.css?inline';
import { ResumeContentBase } from './ResumeContentBase';
import { pagePreviewStyles } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/shared/styles';

// A4 page height in millimeters
// Using mm for exact print correspondence
const PAGE_CONTENT_HEIGHT_MM = 297; // A4 height in mm

interface PageInfo {
  pageNumber: number;
  content: React.ReactNode;
  isLastPage?: boolean;
}

interface ResumeContentProps {
  // Direct data props (used when fetchDataIndependently is false)
  resumeInfo?: DocumentType;
  pagesOrder?: string[];
  themeColor?: string;
  isLoading?: boolean;

  // Common props
  isPdfMode?: boolean;
  isInteractive?: boolean;
  selectedSection?: string | null;
  onSectionClick?: (sectionKey: string) => void;
  renderSectionWrapper?: (sectionKey: string, component: React.ReactNode, isSelected: boolean) => React.ReactNode;

  // Control whether to fetch data independently
  fetchDataIndependently?: boolean;

  // PDF-specific props (for no hooks PDF export)
  isPdfExport?: boolean;

  // Paged preview mode
  isPagedPreview?: boolean;
}

export const ResumeContent: React.FC<ResumeContentProps> = ({
  resumeInfo: propsResumeInfo,
  pagesOrder: propsPagesOrder,
  themeColor: propsThemeColor,
  isLoading: propsIsLoading,
  isPdfMode = false,
  isInteractive = false,
  selectedSection = null,
  onSectionClick,
  renderSectionWrapper,
  fetchDataIndependently = false,
  isPdfExport = false,
  isPagedPreview = false,
}) => {
  // Hooks must be called unconditionally
  const param = useParams();
  const documentId = param?.documentId as string;
  const shouldFetch = fetchDataIndependently && !!documentId;
  const { data, isLoading: dataIsLoading } = useGetDocumentById(shouldFetch ? documentId : 'disabled');

  // For PDF export without fetching
  if (isPdfExport && propsResumeInfo && propsPagesOrder && propsThemeColor) {
    const paddingKeyMap: Record<string, keyof NonNullable<DocumentType['sectionPaddings']>> = {
      'personal-info': 'personalInfo',
      summary: 'summary',
      experience: 'experience',
      education: 'education',
      projects: 'projects',
      skills: 'skills',
      languages: 'languages',
    } as const;

    return (
      <div id="resume-content" className="w-full">
        {propsPagesOrder.map(sectionKey => {
          const Component = SECTION_COMPONENTS[sectionKey as SectionKey];
          if (!Component) return null;

          const paddingKey = paddingKeyMap[sectionKey];
          const sectionPadding = propsResumeInfo?.sectionPaddings?.[paddingKey];
          const paddingTop = sectionPadding?.paddingTop || 0;
          const paddingBottom = sectionPadding?.paddingBottom || 0;

          return (
            <div key={sectionKey}>
              <div
                style={{
                  paddingTop: `${(paddingTop * 0.264583).toFixed(2)}mm`,
                }}
              />
              <Component resumeInfo={propsResumeInfo} isLoading={false} isInteractive={false} />
              <div
                style={{
                  paddingBottom: `${(paddingBottom * 0.264583).toFixed(2)}mm`,
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Determine which data to use
  const documentData = shouldFetch ? (data?.data as DocumentType) : null;
  const resumeInfo = shouldFetch ? normalizeResumeData(documentData) : propsResumeInfo;
  const pagesOrder = shouldFetch
    ? resumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER
    : propsPagesOrder || DEFAULT_PAGES_ORDER;
  const themeColor = shouldFetch ? resumeInfo?.themeColor || '#3b82f6' : propsThemeColor || '#3b82f6';
  const isLoading = shouldFetch ? dataIsLoading : propsIsLoading || false;

  if (!resumeInfo && !fetchDataIndependently) {
    return null;
  }

  // For paged preview mode
  if (isPagedPreview && resumeInfo && onSectionClick && renderSectionWrapper) {
    return (
      <PagedResumeContent
        resumeInfo={resumeInfo}
        pagesOrder={pagesOrder}
        themeColor={themeColor}
        isLoading={isLoading}
        selectedSection={selectedSection}
        onSectionClick={onSectionClick}
        renderSectionWrapper={renderSectionWrapper}
      />
    );
  }

  return (
    <div
      id="resume-content"
      className={cn(
        'relative h-full w-full bg-white px-10 py-4 !font-open-sans',
        isPdfMode && 'pdf-mode',
        !isPdfMode && 'shadow-lg dark:border dark:border-x-gray-800 dark:border-b-gray-800 dark:bg-card'
      )}
      style={{
        borderTop: `13px solid ${themeColor}`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: RESUME_STYLES }} />
      <ResumeContentBase
        resumeInfo={resumeInfo}
        pagesOrder={pagesOrder}
        themeColor={themeColor}
        isLoading={isLoading}
        isInteractive={isInteractive}
        selectedSection={selectedSection}
        onSectionClick={onSectionClick}
        renderSectionWrapper={renderSectionWrapper}
      />
    </div>
  );
};

// Paged Resume Content Component (formerly ResumeContentPaged.tsx)
interface PagedResumeContentProps {
  resumeInfo: DocumentType;
  pagesOrder: string[];
  themeColor: string;
  isLoading: boolean;
  selectedSection: string | null;
  onSectionClick: (sectionKey: string) => void;
  renderSectionWrapper: (sectionKey: string, component: React.ReactNode, isSelected: boolean) => React.ReactNode;
}

const PagedResumeContent: React.FC<PagedResumeContentProps> = ({
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
      // Convert px to mm for comparison: 1 px = 0.264583 mm
      const contentHeightMm = contentHeight * 0.264583;
      const needsMultiplePages = contentHeightMm > PAGE_CONTENT_HEIGHT_MM;

      const pagesNeeded = Math.ceil(contentHeightMm / PAGE_CONTENT_HEIGHT_MM);

      const newPages: PageInfo[] = [];

      for (let i = 0; i < Math.min(pagesNeeded, 3); i++) {
        newPages.push({
          pageNumber: i + 1,
          content: (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: `${PAGE_CONTENT_HEIGHT_MM}mm`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: `-${i * PAGE_CONTENT_HEIGHT_MM + 6.5}mm`,
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
                />
              </div>
            </div>
          ),
          isLastPage: i === pagesNeeded - 1,
        });
      }

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
          isLastPage: true,
        };
      }

      setPages(newPages);
    }
  }, [resumeInfo, pagesOrder, themeColor, isLoading, selectedSection, onSectionClick, renderSectionWrapper]);

  const renderPage = (page: PageInfo, index: number) => {
    return (
      <div key={`page-${page.pageNumber}`} className="relative mx-auto mb-6">
        <div className="absolute -top-10 left-0 flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-700">📄 Page {page.pageNumber}</div>
        </div>
        {index === 0 && (
          <div
            style={{
              borderTop: `13px solid ${resumeInfo.themeColor}`,
            }}
          />
        )}
        <div {...pagePreviewStyles}>
          <div className="h-full w-full overflow-hidden">{page.content}</div>

          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r opacity-75" />

          <div className="absolute bottom-2 right-4 text-xs font-medium text-gray-400">{page.pageNumber}</div>
        </div>

        <div className="text-center text-xs text-gray-500">
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
          <div className="relative mx-auto mb-6">
            <div className="absolute -top-10 left-0 text-sm font-semibold text-gray-400">📄 Page 2 (Preview)</div>
            <div {...pagePreviewStyles}>
              <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                Additional content will appear here if needed...
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400 opacity-50" />
              <div className="absolute bottom-2 right-4 text-xs font-medium text-gray-300">2</div>
            </div>
            <div className="mt-2 text-center text-xs text-gray-400">A4 (210 × 297 mm) • Empty page</div>
          </div>

          <div className="relative mx-auto mb-6">
            <div className="absolute -top-10 left-0 text-sm font-semibold text-gray-400">📄 Page 3 (Preview)</div>
            <div {...pagePreviewStyles}>
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

// Backward compatibility export
export const ResumeContentIndependent: React.FC<Omit<ResumeContentProps, 'fetchDataIndependently'>> = props => {
  return <ResumeContent {...props} fetchDataIndependently={true} />;
};
