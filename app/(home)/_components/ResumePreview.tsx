"use client";
import React from "react";
import { cn } from "@/lib/utils";
import PersonalInfo from "@/components/preview/PersonalInfo";
import SummaryPreview from "@/components/preview/SummaryPreview";
import ExperiencePreview from "@/components/preview/ExperiencePreview";
import EducationPreview from "@/components/preview/EducationPreview";
import SkillPreview from "@/components/preview/SkillPreview";
import ProjectPreview from "@/components/preview/ProjectPreview";
import useGetDocument from "@/features/document/use-get-document-by-id";
import { useParams } from "next/navigation";

const RESUME_STYLES = `
  #resume-preview-id ul, #resume-preview-id ol {
    list-style: none;
    padding-left: 0;
    margin-left: 0;
  }
  #resume-preview-id ul li {
    list-style-type: none;
  }
 
  #resume-preview-id ol li {
    counter-increment: item;
  }
  #resume-preview-id ol li::before {
    content: counter(item) ". ";
    font-size: 1.1em;
    margin-right: 6px;
    color: #333;
  }
  #resume-preview-id ol {
    counter-reset: item;
  }
  @media print {
    #resume-preview-id ul {
      list-style-position: inside;
      padding-left: 18px;
      margin-left: 0;
    }
    #resume-preview-id li {
      // list-style-type: disc;
      margin-left: 0;
      padding-left: 0;
    }
  }
`;

function normalizeResumeData(data: any) {
  if (!data) return data;
  if (data.projectsSectionTitle === null) {
    const { projectsSectionTitle, ...rest } = data;
    return rest;
  }
  return data;
}

const ResumePreview = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocument(documentId);
  const fixedResumeInfo = normalizeResumeData(data?.data);

  return (
    <div
      id="resume-preview-id"
      className={cn(`
        shadow-lg bg-white w-full flex-[1.02]
        h-full px-10 py-4 !font-open-sans
        dark:border dark:bg-card 
        dark:border-b-gray-800 
        dark:border-x-gray-800
        `)}
      style={{
        borderTop: `13px solid ${fixedResumeInfo?.themeColor}`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: RESUME_STYLES }} />
      <PersonalInfo isLoading={isLoading} resumeInfo={fixedResumeInfo} />
      <SummaryPreview isLoading={isLoading} resumeInfo={fixedResumeInfo} />
      <ExperiencePreview isLoading={isLoading} resumeInfo={fixedResumeInfo} />
      <EducationPreview isLoading={isLoading} resumeInfo={fixedResumeInfo} />
      <ProjectPreview isLoading={isLoading} resumeInfo={fixedResumeInfo} />
      <SkillPreview isLoading={isLoading} resumeInfo={fixedResumeInfo} />
    </div>
  );
};

export default ResumePreview;
