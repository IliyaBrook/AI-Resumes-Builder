'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks';

export type ImportedWarning = {
  type: 'unsupported_section' | 'uncertain_field' | 'format_issue';
  label: string;
  content: string;
  suggestion?: string | null;
};

export type ImportedPersonalInfo = {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  github?: string | null;
  linkedin?: string | null;
};

export type ImportedExperience = {
  title?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  currentlyWorking?: boolean;
  workSummary?: string | null;
};

export type ImportedEducation = {
  educationType?: 'university' | 'course';
  universityName?: string | null;
  degree?: string | null;
  major?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  currentlyStudying?: boolean;
};

export type ImportedSkill = {
  name: string;
  category?: string | null;
  rating?: number;
};

export type ImportedProject = {
  name: string;
  url?: string | null;
  description?: string | null;
  git?: string | null;
};

export type ImportedLanguage = {
  name: string;
  level?: string | null;
};

export type ImportedResumeData = {
  summary?: string | null;
  armyService?: string | null;
  personalInfo?: ImportedPersonalInfo;
  experiences?: ImportedExperience[];
  educations?: ImportedEducation[];
  skills?: ImportedSkill[];
  projects?: ImportedProject[];
  languages?: ImportedLanguage[];
};

export type ImportedResumeResult = {
  data: ImportedResumeData;
  warnings?: ImportedWarning[];
};

type ParseResponse = {
  success: 'ok' | false;
  data?: ImportedResumeResult;
  message?: string;
};

const useParseResumeFile = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<ImportedResumeResult> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/resume', {
        method: 'POST',
        body: formData,
      });

      const json = (await response.json()) as ParseResponse;

      if (!response.ok || json.success !== 'ok' || !json.data) {
        throw new Error(json.message ?? 'Failed to parse resume');
      }

      return json.data;
    },
    onError: error => {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Could not analyze the file',
        variant: 'destructive',
      });
    },
  });
};

export default useParseResumeFile;
