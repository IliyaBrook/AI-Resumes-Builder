'use client';
import { DEFAULT_PAGES_ORDER, syncPagesOrder } from '@/constant/resume-sections';

//hooks
import { useGetDocumentById, useUpdateDocument } from '@/hooks';
import { cn, normalizeResumeData } from '@/lib/utils';
// components
import { Button } from '@/components';
import { MoveDown, MoveUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { ResumeContent } from '@/shared/ResumeContent';

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

  const renderSectionWrapper = (sectionKey: string, component: React.ReactNode, isSelected: boolean) => {
    const currentIndex = currentOrder.indexOf(sectionKey);
    const canMoveUpLocal = currentIndex > 0;
    const canMoveDownLocal = currentIndex < currentOrder.length - 1;

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
        {component}

        {isSelected && (
          <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-md border bg-white p-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className={cn(
                'size-6 hover:bg-gray-100 dark:hover:bg-gray-700',
                !canMoveUpLocal && 'cursor-not-allowed opacity-50'
              )}
              onClick={e => {
                e.stopPropagation();
                moveSection('up');
              }}
              disabled={!canMoveUpLocal}
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
                !canMoveDownLocal && 'cursor-not-allowed opacity-50'
              )}
              onClick={e => {
                e.stopPropagation();
                moveSection('down');
              }}
              disabled={!canMoveDownLocal}
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
      className="relative h-full w-full flex-[1.02]"
      onClick={() => setSelectedSection(null)}
    >
      {selectedSection && (
        <div className="absolute left-4 top-4 z-10 rounded-md bg-white px-2 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-800">
          Selected section: {selectedSection} (ESC to cancel)
        </div>
      )}

      <ResumeContent
        resumeInfo={fixedResumeInfo}
        pagesOrder={currentOrder}
        themeColor={fixedResumeInfo?.themeColor}
        isLoading={isLoading}
        isInteractive={true}
        selectedSection={selectedSection}
        onSectionClick={sectionKey => setSelectedSection(selectedSection === sectionKey ? null : sectionKey)}
        renderSectionWrapper={renderSectionWrapper}
      />
    </div>
  );
};

export default ResumePreview;
