'use client';
// components
import { Button, Input, Popover, PopoverContent, PopoverTrigger, Skeleton } from '@/components';
//hooks
import { toast, useGetDocuments, useRestoreDocument } from '@/hooks';
import { format } from 'date-fns';
import { Dot, FileText, Loader, Search, Trash2, Undo } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { DocumentType } from '@/types';

const TrashListBox = () => {
  const router = useRouter();
  const { data, isLoading } = useGetDocuments(true);
  const { mutateAsync, isPending } = useRestoreDocument();

  const resumes = data?.data ?? [];
  const [search, setSearch] = useState('');

  const filteredDocuments = resumes?.filter((doc: DocumentType) => {
    return doc.title?.toLowerCase()?.includes(search?.toLowerCase());
  });

  const onClick = (docId: string) => {
    router.push(`/dashboard/document/${docId}/edit`);
  };

  const onRestore = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, docId: string, status: string) => {
    event.stopPropagation();
    void mutateAsync(
      {
        documentId: docId,
        status: status,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: `Restore document successfully`,
          });
        },
        onError: error => {
          toast({
            title: 'Error',
            description: 'Failed to restore document',
            variant: 'destructive',
          });
          console.error('Failed to restore document:', error);
        },
      }
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="items-center gap-[2px] text-[15px]" variant="outline">
          <Trash2 size="15px" />
          <span>All Trash</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[22rem] bg-background !px-2" align="end" alignOffset={0} forceMount>
        {isLoading ? (
          <div className="flex w-full flex-col gap-2 pt-3">
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
          </div>
        ) : (
          <div className="text-sm">
            <div className="flex items-center gap-x-1 p-2">
              <Search className="h-4 w-4" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-7 bg-secondary px-2"
                placeholder="Filter by resume title"
              />
            </div>
            <div className="mt-2 px-1 pb-1">
              <p className="hidden text-center text-xs text-muted-foreground last:block">No documents found</p>

              {filteredDocuments?.map((doc: DocumentType) => (
                <div
                  key={doc.id}
                  role="button"
                  onClick={() => onClick(doc.documentId)}
                  className="flex w-full items-center justify-between rounded-s px-1 py-1 text-sm hover:bg-primary/5"
                >
                  <div className="flex items-start gap-1">
                    <FileText size="15px" className="mt-[3px]" />
                    <div className="flex flex-col">
                      <h5 className="block w-[200px] truncate text-sm font-semibold">{doc.title}</h5>
                      <div className="flex items-center !text-[12px]">
                        <span className="flex items-center gap-[2px] capitalize">{doc.status}</span>
                        <Dot size="15px" />
                        <span className="items-center">{doc.updatedAt && format(doc.updatedAt, 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      role="button"
                      onClick={e => onRestore(e, doc.documentId, doc.status || 'private')}
                      className="flex h-6 w-6 items-center justify-center rounded-sm hover:bg-neutral-200 dark:hover:bg-gray-700"
                    >
                      {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Undo className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default TrashListBox;
