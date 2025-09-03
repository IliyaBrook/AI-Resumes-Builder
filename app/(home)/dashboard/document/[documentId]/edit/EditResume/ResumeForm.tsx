'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useParams } from 'next/navigation';
//hooks
import { useUpdateDocument, useGetDocumentById, useFirstRender } from '@/hooks';
import { generateThumbnail } from '@/lib/helper';
// page components
import {
  EducationForm,
  ExperienceForm,
  LanguageForm,
  PersonalInfoForm,
  ProjectForm,
  SkillsForm,
  SummaryForm,
} from '@/editResume';

const ResumeForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const [activeFormIndex, setActiveFormIndex] = useState(1);
  const { mutate: setResumeInfo } = useUpdateDocument();
  const { firstRender } = useFirstRender();

  const resumeInfo = data?.data;
  const thumbnail = resumeInfo?.thumbnail;

  const handleNext = () => {
    const newIndex = activeFormIndex + 1;
    setActiveFormIndex(newIndex);
  };

  useEffect(() => {
    const generateAndSetThumbnail = async () => {
      try {
        const thumbnail = await generateThumbnail();
        if (thumbnail) {
          setResumeInfo({ thumbnail });
        }
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    };

    if (resumeInfo && firstRender === 'notFirstRender') {
      void generateAndSetThumbnail();
    }
    if (resumeInfo && !thumbnail && firstRender === 'firstRender') {
      void generateAndSetThumbnail();
    }
  }, [resumeInfo, setResumeInfo]);

  return (
    <div className="w-full flex-1 lg:sticky lg:top-16">
      <div className="rounded-md !border-t-4 !border-t-primary bg-white shadow-md dark:border dark:border-gray-800 dark:bg-card">
        <div className="flex min-h-10 items-center justify-end gap-1 border-b px-3 py-[7px]">
          {activeFormIndex > 1 && (
            <Button
              variant="outline"
              size="default"
              className="!h-auto !px-2 !py-1"
              onClick={() => setActiveFormIndex(activeFormIndex - 1)}
            >
              <ArrowLeft size="16px" />
              Previous
            </Button>
          )}

          <Button
            variant="outline"
            size="default"
            className="!h-auto !px-2 !py-1"
            disabled={activeFormIndex === 7 || resumeInfo?.status === 'archived'}
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
