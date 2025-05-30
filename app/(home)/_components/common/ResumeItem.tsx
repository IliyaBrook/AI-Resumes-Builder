import { format } from "date-fns";
import { FileText, Trash2, Copy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useCallback, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useDeleteDocument from "@/features/document/use-delete-document";

interface PropType {
  documentId: string;
  title: string;
  themeColor: string | null;
  thumbnail: string | null;
  updatedAt: string;
  onDuplicate?: (documentId: string) => void;
}

const ResumeItem: FC<PropType> = ({
  documentId,
  title,
  themeColor,
  thumbnail,
  updatedAt,
  onDuplicate
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutate: deleteDocument, isPending } = useDeleteDocument();

  const docDate = useMemo(() => {
    if (!updatedAt) return null;
    const formattedDate = format(updatedAt, "MMM dd,yyyy");
    return formattedDate;
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
        className="
        cursor-pointer max-w-[164px] w-full
        border 
        rounded-lg transition-all h-[197px]
        hover:border-primary
        hover:shadow-md
        shadow-primary
        "
        onClick={gotoDoc}
        style={{ borderColor: themeColor || "" }}
      >
        <div
          className="flex flex-col w-full 
          h-full items-center rounded-lg
          justify-center bg-[#fdfdfd] 
          dark:bg-secondary"
        >
          <div
            className="w-full flex flex-1 px-1
         pt-2"
          >
            <div
              className="w-full flex flex-1 bg-white
          dark:bg-gray-700
          rounded-t-lg justify-center
           items-center
          "
            >
              {thumbnail ? (
                <div
                  className="
              relative w-full h-full 
              rounded-t-lg
              overflow-hidden
              "
                >
                  <Image
                    fill
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full
                  object-cover
                  object-top rounded-t-lg
                                  "
                  />
                </div>
              ) : (
                <FileText size="30px" />
              )}
            </div>
          </div>

          {/* {Body Content} */}
          <div
            className="shrink w-full border-t pt-2 
              pb-[9px]
              px-[9px]
        "
          >
            <div
              className="flex items-center 
          justify-between"
            >
              <h5
                className="
                      font-semibold text-sm mb-[2px]
                      truncate block
                      "
              >
                {title}
              </h5>
              <div className="flex items-center gap-1">
                <button
                  className="text-muted-foreground rounded hover:shadow-[0_0_0_1px_#6b7280] p-1"
                  onClick={handleDelete}
                >
                  <Trash2 size="20px" />
                </button>
                <button
                  className="text-muted-foreground rounded hover:shadow-[0_0_0_1px_#6b7280] p-1"
                  onClick={e => { e.stopPropagation(); onDuplicate && onDuplicate(documentId); }}
                >
                  <Copy size="20px" />
                </button>
              </div>
            </div>
            <div
              className="flex items-center
          !text-[12px] font-medium 
          text-muted-foreground
          "
            >
              <span>{docDate}</span>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this resume?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeItem;
