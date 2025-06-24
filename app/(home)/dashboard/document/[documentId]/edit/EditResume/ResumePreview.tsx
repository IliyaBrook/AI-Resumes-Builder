'use client';
import { DEFAULT_PAGES_ORDER, SECTION_COMPONENTS, syncPagesOrder, type SectionKey } from '@/constant/resume-sections';

//hooks
import { useUpdateDocument, useGetDocumentById } from '@/hooks';
import { cn } from '@/lib/utils';
// components
import { Button } from '@/components';
import { MoveDown, MoveUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

const RESUME_STYLES = `
  #resume-preview-id ul, #resume-preview-id ol {
    list-style: none;
    padding-left: 0;
    margin-left: 0;
  }
  #resume-preview-id ul li {
    list-style-type: none;
  }
 
  #resume-preview-id ol li {
    counter-increment: item;
  }
  #resume-preview-id ol li::before {
    content: counter(item) ". ";
    font-size: 1.1em;
    margin-right: 6px;
    color: #333;
  }
  #resume-preview-id ol {
    counter-reset: item;
  }
  @media print {
    #resume-preview-id ul {
      list-style-position: inside;
      padding-left: 18px;
      margin-left: 0;
    }
    #resume-preview-id li {
      // list-style-type: disc;
      margin-left: 0;
      padding-left: 0;
    }
  }
`;

function normalizeResumeData(data: any) {
  if (!data) return data;
  if (data.projectsSectionTitle === null) {
    const { projectsSectionTitle, ...rest } = data;
    void projectsSectionTitle;
    return rest;
  }
  return data;
}

const ResumePreview = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const { mutate: updateDocument } = useUpdateDocument();
  const fixedResumeInfo = normalizeResumeData(data?.data);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<string[]>(fixedResumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER);

  React.useEffect(() => {
    if (fixedResumeInfo?.pagesOrder) {
      const currentPagesOrder = fixedResumeInfo.pagesOrder;
      const syncedOrder = syncPagesOrder(currentPagesOrder);

      if (JSON.stringify(currentPagesOrder) !== JSON.stringify(syncedOrder)) {
        updateDocument({
          pagesOrder: syncedOrder,
        });
        setCurrentOrder(syncedOrder);
      } else {
        setCurrentOrder(currentPagesOrder);
      }
    }
  }, [fixedResumeInfo?.pagesOrder, updateDocument]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSection(null);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedSection(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updatePagesOrder = (newOrder: string[]) => {
    updateDocument({
      pagesOrder: newOrder,
    });
    setCurrentOrder(newOrder);
  };

  const moveSection = (direction: 'up' | 'down') => {
    if (!selectedSection) return;

    const currentIndex = currentOrder.indexOf(selectedSection);
    if (currentIndex === -1) return;

    const newOrder = [...currentOrder];

    if (direction === 'up' && currentIndex > 0) {
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
    } else if (direction === 'down' && currentIndex < newOrder.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    } else {
      return;
    }

    updatePagesOrder(newOrder);
  };

  const canMoveUp = selectedSection && currentOrder.indexOf(selectedSection) > 0;
  const canMoveDown = selectedSection && currentOrder.indexOf(selectedSection) < currentOrder.length - 1;

  const renderSection = (sectionKey: string) => {
    const Component = SECTION_COMPONENTS[sectionKey as SectionKey];
    if (!Component) return null;

    const isSelected = selectedSection === sectionKey;

    return (
      <div
        key={sectionKey}
        className={cn(
          'section-wrapper relative cursor-pointer rounded-md transition-all duration-200',
          isSelected && 'bg-blue-50 p-2 ring-2 ring-blue-500 ring-opacity-50 dark:bg-blue-950 dark:ring-blue-400'
        )}
        onClick={e => {
          e.stopPropagation();
          setSelectedSection(selectedSection === sectionKey ? null : sectionKey);
        }}
        title={`Click to select "${sectionKey}" section`}
      >
        <Component isLoading={isLoading} resumeInfo={fixedResumeInfo} />

        {isSelected && (
          <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-md border bg-white p-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className={cn(
                'size-6 hover:bg-gray-100 dark:hover:bg-gray-700',
                !canMoveUp && 'cursor-not-allowed opacity-50'
              )}
              onClick={e => {
                e.stopPropagation();
                moveSection('up');
              }}
              disabled={!canMoveUp}
              title="Move section up"
            >
              <MoveUp size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className={cn(
                'size-6 hover:bg-gray-100 dark:hover:bg-gray-700',
                !canMoveDown && 'cursor-not-allowed opacity-50'
              )}
              onClick={e => {
                e.stopPropagation();
                moveSection('down');
              }}
              disabled={!canMoveDown}
              title="Move section down"
            >
              <MoveDown size={14} />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      id="resume-preview-id"
      className={cn(
        `relative h-full w-full flex-[1.02] bg-white px-10 py-4 !font-open-sans shadow-lg dark:border dark:border-x-gray-800 dark:border-b-gray-800 dark:bg-card`
      )}
      style={{
        borderTop: `13px solid ${fixedResumeInfo?.themeColor}`,
      }}
      onClick={() => setSelectedSection(null)}
    >
      <style dangerouslySetInnerHTML={{ __html: RESUME_STYLES }} />

      {selectedSection && (
        <div className="absolute left-4 top-4 z-10 rounded-md bg-white px-2 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-800">
          Selected section: {selectedSection} (ESC to cancel)
        </div>
      )}

      {currentOrder.map(renderSection)}
    </div>
  );
};

export default ResumePreview;
