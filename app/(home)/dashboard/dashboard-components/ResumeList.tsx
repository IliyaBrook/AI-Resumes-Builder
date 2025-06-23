'use client';
import { useGetDocuments } from '@/hooks';
import { Loader, RotateCw } from 'lucide-react';
import React, { Fragment, useCallback } from 'react';
import { ResumeItem } from '@/homePageComponents';
import { DocumentType } from '@/types/resume.type';

const ResumeList = () => {
  const { data, isLoading, isError, refetch } = useGetDocuments();
  const resumes = data?.data ?? [];

  const onDuplicate = useCallback(
    async (documentId: string) => {
      try {
        await fetch(`/api/document/${documentId}/duplicate`, {
          method: 'POST',
        });
        void refetch();
      } catch (error) {
        console.error('Failed to duplicate document:', error);
      }
    },
    [refetch]
  );

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleDuplicate = useCallback(
    (documentId: string) => {
      void onDuplicate(documentId);
    },
    [onDuplicate]
  );

  return (
    <Fragment>
      {isLoading ? (
        <div
          className="
    flex items-center mx-5"
        >
          <Loader
            className="animate-spin text-black
     dark:text-white
     size-10
     "
          />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center mx-5">
          <button className="flex items-center gap-1" onClick={handleRefetch}>
            <RotateCw size="1em" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <>
          {resumes?.map((resume: DocumentType) => (
            <ResumeItem
              key={resume.documentId}
              documentId={resume.documentId}
              title={resume.title}
              updatedAt={resume.updatedAt}
              themeColor={resume.themeColor || null}
              thumbnail={resume.thumbnail || null}
              onDuplicate={handleDuplicate}
            />
          ))}
        </>
      )}
    </Fragment>
  );
};

export default ResumeList;
