import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, FileText } from "lucide-react";
import React from "react";
import ResumePreview from "./ResumePreview";
import useGetDocument from "@/features/document/use-get-document-by-id";
import { useParams } from "next/navigation";

const PreviewModal = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocument(documentId);
  const resumeInfo = data?.data;

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            disabled={
              isLoading || resumeInfo?.status === "archived" ? true : false
            }
            variant="secondary"
            className="bg-white border gap-1
                   dark:bg-gray-800 !p-2 w-9
                    lg:w-auto lg:p-4"
          >
            <div className="flex items-center gap-1">
              <Eye size="17px" />
              <span className="hidden  lg:flex">Preview</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent
          className="
                   sm:max-w-4xl p-0
                   w-full max-h-[90vh]
                   lg:max-h-[95vh]
                   overflow-y-auto
              
                  "
        >
          <DialogHeader
            className="!pb-0
                  !m-0 sticky top-0
                  backdrop-blur bg-white
                   dark:bg-black/80 z-10
                  "
          >
            <DialogTitle
              className="
                      flex items-center gap-1 text-[20px]
                      pt-2 px-3 font-semibold opacity-100
                      
                      "
            >
              <FileText
                size="20px"
                className="
                          stroke-primary
                          "
              />
              {resumeInfo?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-full px-2 pb-4">
            <ResumePreview />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PreviewModal;
