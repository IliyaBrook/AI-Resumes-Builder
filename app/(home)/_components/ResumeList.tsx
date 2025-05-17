"use client";
import useGetDocuments from "@/features/document/use-get-document";
import { Loader, RotateCw } from "lucide-react";
import React, { Fragment, useCallback } from "react";
import ResumeItem from "./common/ResumeItem";

const ResumeList = () => {
  const { data, isLoading, isError, refetch } = useGetDocuments();
  const resumes = data?.data ?? [];

  const onDuplicate = useCallback(
    async (documentId: string) => {
      await fetch(`/api/document/${documentId}/duplicate`, {
        method: "POST",
      });
      refetch();
    },
    [refetch]
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
          <button className="flex items-center gap-1" onClick={() => refetch()}>
            <RotateCw size="1em" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <>
          {resumes?.map((resume) => (
            <ResumeItem
              key={resume.documentId}
              documentId={resume.documentId}
              title={resume.title}
              updatedAt={resume.updatedAt}
              themeColor={resume.themeColor}
              thumbnail={resume.thumbnail}
              onDuplicate={onDuplicate}
            />
          ))}
        </>
      )}
    </Fragment>
  );
};

export default ResumeList;
