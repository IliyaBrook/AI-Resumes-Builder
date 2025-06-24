'use client';
// components
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Tooltip } from '@/components';
import { useDeleteDocument } from '@/hooks';
import { format } from 'date-fns';
import { Copy, FileText, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, useMemo, useState } from 'react';

interface PropType {
  documentId: string;
  title: string;
  themeColor: string | null;
  thumbnail: string | null;
  updatedAt: string;
  onDuplicate?: (documentId: string) => void;
}

const ResumeItem: FC<PropType> = ({ documentId, title, themeColor, thumbnail, updatedAt, onDuplicate }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutate: deleteDocument, isPending } = useDeleteDocument();

  const docDate = useMemo(() => {
    if (!updatedAt) return null;
    return format(updatedAt, 'MMM dd,yyyy');
  }, [updatedAt]);

  const gotoDoc = () => {
    router.push(`/dashboard/document/${documentId}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const confirmDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteDocument(documentId, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const cancelDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      <div
        className="h-[220px] w-full max-w-[220px] cursor-pointer rounded-lg border shadow-primary transition-all hover:border-primary hover:shadow-md"
        onClick={gotoDoc}
        style={{ borderColor: themeColor || '' }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-[#fdfdfd] dark:bg-secondary">
          <div className="flex w-full flex-1 px-1 pt-2">
            <div className="flex w-full flex-1 items-center justify-center rounded-t-lg bg-white dark:bg-gray-700">
              {thumbnail ? (
                <div className="relative h-full w-full overflow-hidden rounded-t-lg">
                  <Image
                    fill
                    src={thumbnail}
                    alt={title}
                    className="h-full w-full rounded-t-lg object-cover object-top"
                  />
                </div>
              ) : (
                <FileText size="30px" />
              )}
            </div>
          </div>
          <div className="w-full shrink border-t px-[9px] pb-[9px] pt-2">
            <Tooltip content={title} side="top">
              <h5 className="mb-1 block max-w-full cursor-default truncate text-center text-lg font-bold">{title}</h5>
            </Tooltip>
            <div className="flex items-center justify-center gap-2">
              <span className="whitespace-nowrap text-[12px] font-medium text-muted-foreground">{docDate}</span>
              <button
                className="rounded p-1 text-muted-foreground hover:shadow-[0_0_0_1px_#6b7280]"
                onClick={handleDelete}
              >
                <Trash2 size="20px" />
              </button>
              <button
                className="rounded p-1 text-muted-foreground hover:shadow-[0_0_0_1px_#6b7280]"
                onClick={e => {
                  e.stopPropagation();
                  onDuplicate?.(documentId);
                }}
              >
                <Copy size="20px" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this resume?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeItem;
