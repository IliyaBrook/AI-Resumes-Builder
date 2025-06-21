"use client";
import { AlertCircle } from "lucide-react";
import React, { useCallback } from "react";
import ResumeTitle from "./ResumeTitle";
import useUpdateDocument from "@/features/document/use-update-document";
import useGetDocument from "@/features/document/use-get-document-by-id";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import ThemeColor from "./ThemeColor";
import PreviewModal from "./PreviewModal";
import { Download } from "./";
import MoreOption from "./MoreOption";

const TopSection = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocument(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo, isPending } = useUpdateDocument();

  const handleTitle = useCallback(
    (title: string) => {
      if (title === "Untitled Resume" && !title) return;
      setResumeInfo(
        { title },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Title updated successfully",
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update the title",
              variant: "destructive",
            });
          },
        }
      );
    },
    [setResumeInfo]
  );
  return (
    <>
      {resumeInfo?.status === "archived" && (
        <div
          className="
            absolute z-[9] inset-0 h-6 top-0
            bg-rose-500 text-center
            text-base p-2 text-white
            flex items-center gap-x-2 
            justify-center font-medium
            "
        >
          <AlertCircle size="16px" />
          This resume is in the trash bin
        </div>
      )}
      <div
        className="
          w-full flex items-center justify-between
          border-b pb-3
          "
      >
        <div className="flex items-center gap-2">
          <ResumeTitle
            isLoading={isLoading || isPending}
            initialTitle={resumeInfo?.title || ""}
            status={resumeInfo?.status}
            onSave={(value) => handleTitle(value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {}
          <ThemeColor />

          {}
          <PreviewModal />

          {}
          <Download
            title={resumeInfo?.title || "Unititled Resume"}
            status={resumeInfo?.status}
            isLoading={isLoading}
          />
          <MoreOption />
        </div>
      </div>
    </>
  );
};

export default TopSection;
