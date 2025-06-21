"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useGetDocument from "@/features/document/use-get-document-by-id";
import { useParams } from "next/navigation";
import useUpdateDocument from "@/features/document/use-update-document";
import { generateThumbnail } from "@/lib/helper";
// page components
import {
  EducationForm,
  ExperienceForm,
  LanguageForm,
  PersonalInfoForm,
  ProjectForm,
  SkillsForm,
  SummaryForm,
} from "./";

const ResumeForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocument(documentId);
  const resumeInfo = data?.data;
  const [activeFormIndex, setActiveFormIndex] = useState(1);
  const { mutate: setResumeInfo } = useUpdateDocument();

  const handleNext = () => {
    const newIndex = activeFormIndex + 1;
    setActiveFormIndex(newIndex);
  };

  useEffect(() => {
    if (!resumeInfo || resumeInfo.thumbnail) return;
    (async () => {
      const thumbnail = await generateThumbnail();
      if (thumbnail) {
        setResumeInfo({ thumbnail });
      }
    })();
  }, [resumeInfo, setResumeInfo]);

  return (
    <div
      className="flex-1 w-full lg:sticky
  lg:top-16
  "
    >
      <div
        className="shadow-md rounded-md bg-white
      !border-t-primary !border-t-4 
      dark:bg-card dark:border
      dark:border-gray-800
      "
      >
        <div
          className="
        flex items-center gap-1
        px-3 justify-end
        border-b py-[7px] min-h-10
        "
        >
          {activeFormIndex > 1 && (
            <Button
              variant="outline"
              size="default"
              className="!px-2 !py-1 !h-auto"
              onClick={() => setActiveFormIndex(activeFormIndex - 1)}
            >
              <ArrowLeft size="16px" />
              Previous
            </Button>
          )}

          <Button
            variant="outline"
            size="default"
            className="!px-2 !py-1 !h-auto"
            disabled={
              activeFormIndex === 7 || resumeInfo?.status === "archived"
            }
            onClick={handleNext}
          >
            Next
            <ArrowRight size="16px" />
          </Button>
        </div>
        <div className="px-5 py-3 pb-5">
          {activeFormIndex === 1 && <PersonalInfoForm />}
          {activeFormIndex === 2 && <SummaryForm />}
          {activeFormIndex === 3 && <ExperienceForm />}
          {activeFormIndex === 4 && <EducationForm />}
          {activeFormIndex === 5 && <ProjectForm />}
          {activeFormIndex === 6 && <SkillsForm />}
          {activeFormIndex === 7 && <LanguageForm />}
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;
