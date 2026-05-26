'use client';
import { useCreateDocument } from '@/hooks';
import { FileText, Loader, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

const AddResume = () => {
  const router = useRouter();
  const { isPending, mutate } = useCreateDocument();
  const onCreate = useCallback(() => {
    mutate(
      {
        title: 'Untitled Resume',
      },
      {
        onSuccess: response => {
          const documentId = response.data.documentId;
          const locale = response.data.locale;
          router.push(`/dashboard/document/${documentId}/${locale}/edit`);
        },
      }
    );
  }, [mutate, router]);
  return (
    <React.Fragment>
      <div role="button" className="w-full max-w-[218.4px] cursor-pointer p-[2px]" onClick={onCreate}>
        <div className="hover:border-primary dark:bg-secondary flex h-[218.4px] w-full max-w-full flex-col items-center justify-center gap-2 rounded-lg border bg-white py-24 transition hover:shadow">
          <span>
            <Plus size="30px" />
          </span>
          <p className="text-sm font-semibold">Blank Resume</p>
        </div>
      </div>
      {isPending && (
        <div className="fixed top-0 right-0 left-0 z-[9999] flex h-full w-full flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur">
          <Loader size="35px" className="animate-spin" />
          <div className="flex items-center gap-2">
            <FileText />
            Creating Blank Resume...
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default AddResume;
