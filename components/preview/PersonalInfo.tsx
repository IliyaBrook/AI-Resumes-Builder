"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { INITIAL_THEME_COLOR } from "@/lib/helper";
import { ResumeDataType } from "@/types/resume.type";
import React, { FC } from "react";
import { Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const PersonalInfo: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;

  if (isLoading) {
    return <SkeletonLoader />;
  }
  return (
    <div className="w-full min-h-14">
      <h2
        className="
        font-bold text-2xl text-center mb-1
      "
        style={{
          color: themeColor,
        }}
      >
        {resumeInfo?.personalInfo?.firstName || "First Name"}{" "}
        {resumeInfo?.personalInfo?.lastName || "Last Name"}
      </h2>
      <div className="text-center text-base font-medium mb-2 text-gray-600 w-full">
        <div className="flex justify-center">
          <span className="font-bold">{resumeInfo?.personalInfo?.jobTitle || "Job Title"}</span>
          <span>
            {resumeInfo?.personalInfo?.address && (
              <span className="ml-2 flex items-center hover:text-gray-900 transition-colors !text-[14px]">
                <MapPin size={14} className="opacity-70 shrink-0" />
                <span>{resumeInfo.personalInfo.address}</span>
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-y-1 max-w-[600px] mx-auto pb-3 !text-[13px] text-gray-600">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {resumeInfo?.personalInfo?.phone && (
            <span className="flex items-center gap-1 hover:text-gray-900 transition-colors !text-[13px]">
              <Phone size={14} className="opacity-70 shrink-0" />
              <a href={`tel:${resumeInfo.personalInfo.phone}`} className="hover:underline">{resumeInfo.personalInfo.phone}</a>
            </span>
          )}
          {resumeInfo?.personalInfo?.email && (
            <span className="flex items-center gap-1 hover:text-gray-900 transition-colors !text-[13px]">
              <Mail size={14} className="opacity-70 shrink-0" />
              <a href={`mailto:${resumeInfo.personalInfo.email}`} className="hover:underline">{resumeInfo.personalInfo.email}</a>
            </span>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {resumeInfo?.personalInfo?.github && (
            <span className="flex items-center gap-1 hover:text-gray-900 transition-colors !text-[13px]">
              <Github size={14} className="opacity-70 shrink-0" />
              <a href={resumeInfo.personalInfo.github} target="_blank" rel="noopener noreferrer text-[13px]" className="hover:underline">{resumeInfo.personalInfo.github.replace(/^https?:\/\//, "")}</a>
            </span>
          )}
          {resumeInfo?.personalInfo?.linkedin && (
            <span className="flex items-center gap-1 hover:text-gray-900 transition-colors !text-[13px]">
              <Linkedin size={14} className="opacity-70 shrink-0" />
              <a href={resumeInfo.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">{resumeInfo.personalInfo.linkedin.replace(/^https?:\/\//, "")}</a>
            </span>
          )}
        </div>
      </div>

      <hr
        className="border-[1px] mb-4"
        style={{
          borderColor: themeColor,
        }}
      />
    </div>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="w-full min-h-14">
      <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
      <Skeleton className="h-6 w-1/4 mx-auto mb-2" />
      <Skeleton className="h-6 w-1/3 mx-auto mb-2" />
      <div className="flex justify-between pt-3">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-[1.5] w-full my-2" />
    </div>
  );
};

export default PersonalInfo;
