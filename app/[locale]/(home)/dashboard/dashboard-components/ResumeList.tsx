'use client';
import { useGetDocuments } from '@/hooks';
import { Loader, RotateCw } from 'lucide-react';
import React, { Fragment, useCallback, useEffect } from 'react';
import { ResumeItem } from '@/app/[locale]/(home)/dashboard';
import { DocumentType } from '@/types';

const ResumeList = () => {
  const { data, isLoading, isError, refetch } = useGetDocuments();
  const resumes = data?.data ?? [];

  useEffect(() => {
    void refetch();
  }, [refetch]);

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
        <div className="mx-5 flex items-center">
          <Loader className="size-10 animate-spin text-black dark:text-white" />
        </div>
      ) : isError ? (
        <div className="mx-5 flex flex-col items-center">
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
