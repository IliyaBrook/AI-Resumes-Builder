'use client';
// components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from '@/components';
// hooks
import { useUpdateDocument, useGetDocumentById, toast } from '@/hooks';
import { StatusType } from '@/types/resume.type';
import { Loader, MoreHorizontal, Redo, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

const MoreOption = () => {
  const router = useRouter();
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo, isPending } = useUpdateDocument();

  const handleClick = useCallback(
    (status: StatusType) => {
      if (!resumeInfo) return;
      setResumeInfo(
        {
          status: status,
        },
        {
          onSuccess: () => {
            router.replace(`/dashboard/`);
            toast({
              title: 'Success',
              description: `Moved to trash successfully`,
            });
          },
          onError() {
            toast({
              title: 'Error',
              description: 'Failed to update status',
              variant: 'destructive',
            });
          },
        }
      );
    },
    [setResumeInfo, resumeInfo, router]
  );

  const handleRestore = useCallback(() => {
    handleClick('private');
  }, [handleClick]);

  const handleArchive = useCallback(() => {
    handleClick('archived');
  }, [handleClick]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="bg-white border dark:bg-gray-800">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            {resumeInfo?.status === 'archived' ? (
              <Button
                variant="ghost"
                className="gap-1 !py-2 !cursor-pointer"
                disabled={isPending}
                onClick={handleRestore}
              >
                <Redo size="15px" />
                Retore resume
                {isPending && <Loader size="15px" className="animate-spin" />}
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="gap-1  !py-2 !cursor-pointer"
                disabled={isPending}
                onClick={handleArchive}
              >
                <Trash2 size="15px" />
                Move to Trash
                {isPending && <Loader size="15px" className="animate-spin" />}
              </Button>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default MoreOption;
