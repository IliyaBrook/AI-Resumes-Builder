import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useUpdateDocument from "@/features/document/use-update-document";
import useGetDocument from "@/features/document/use-get-document-by-id";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Loader, MoreHorizontal, Redo, Trash2 } from "lucide-react";
import { StatusType } from "@/types/resume.type";

const MoreOption = () => {
  const router = useRouter();
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocument(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo, isPending } = useUpdateDocument();

  const handleClick = useCallback(
    async (status: StatusType) => {
      if (!resumeInfo) return;
      setResumeInfo(
        {
          status: status,
        },
        {
          onSuccess: () => {
            router.replace(`/dashboard/`);
            toast({
              title: "Success",
              description: `Moved to trash successfully`,
            });
          },
          onError() {
            toast({
              title: "Error",
              description: "Failed to update status",
              variant: "destructive",
            });
          },
        }
      );
    },
    [setResumeInfo, resumeInfo, router]
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white border dark:bg-gray-800"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            {resumeInfo?.status === "archived" ? (
              <Button
                variant="ghost"
                className="gap-1 !py-2 !cursor-pointer"
                disabled={isPending}
                onClick={() => handleClick("private")}
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
                onClick={() => handleClick("archived")}
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
