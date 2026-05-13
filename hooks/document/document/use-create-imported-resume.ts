'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks';
import { api } from '@/lib/hono-rpc';
// noinspection ES6PreferShortImport
import type {
  ImportedEducation,
  ImportedExperience,
  ImportedLanguage,
  ImportedPersonalInfo,
  ImportedProject,
  ImportedSkill,
} from './use-parse-resume-file';

type CreateImportedResumeInput = {
  title: string;
  summary?: string | null;
  armyService?: string | null;
  personalInfo?: ImportedPersonalInfo;
  experiences?: ImportedExperience[];
  educations?: ImportedEducation[];
  skills?: ImportedSkill[];
  projects?: ImportedProject[];
  languages?: ImportedLanguage[];
};

type CreateImportedResumeResult = {
  documentId: string;
  locale?: string | null;
};

const sanitizeDate = (value?: string | null): string | null => {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
};

const mapExperiences = (experiences?: ImportedExperience[]) =>
  experiences?.map((exp, index) => ({
    title: exp.title ?? null,
    companyName: exp.companyName ?? null,
    city: exp.city ?? null,
    state: exp.state ?? null,
    startDate: sanitizeDate(exp.startDate),
    endDate: sanitizeDate(exp.endDate),
    currentlyWorking: Boolean(exp.currentlyWorking),
    workSummary: exp.workSummary ?? null,
    order: index,
  })) ?? [];

const mapEducations = (educations?: ImportedEducation[]) =>
  educations?.map((edu, index) => ({
    educationType: edu.educationType ?? 'university',
    universityName: edu.universityName ?? null,
    degree: edu.degree ?? null,
    major: edu.major ?? null,
    description: edu.description ?? null,
    startDate: sanitizeDate(edu.startDate),
    endDate: sanitizeDate(edu.endDate),
    currentlyStudying: Boolean(edu.currentlyStudying),
    order: index,
  })) ?? [];

const mapSkills = (skills?: ImportedSkill[]) => {
  if (!skills?.length) return [];
  const categoryOrderMap = new Map<string, number>();
  return skills.map((skill, index) => {
    const category = skill.category?.trim() || '';
    if (!categoryOrderMap.has(category)) {
      categoryOrderMap.set(category, categoryOrderMap.size);
    }
    return {
      name: skill.name,
      rating: typeof skill.rating === 'number' ? skill.rating : 4,
      category,
      skillOrder: index,
      categoryOrder: categoryOrderMap.get(category) ?? 0,
    };
  });
};

const mapProjects = (projects?: ImportedProject[]) =>
  projects?.map((project, index) => ({
    name: project.name,
    url: project.url ?? null,
    description: project.description ?? null,
    git: project.git ?? null,
    order: index,
  })) ?? [];

const mapLanguages = (languages?: ImportedLanguage[]) =>
  languages?.map((lang, index) => ({
    name: lang.name,
    level: lang.level ?? null,
    order: index,
  })) ?? [];

const mapPersonalInfo = (info?: ImportedPersonalInfo) => {
  if (!info) return undefined;
  return {
    firstName: info.firstName ?? null,
    lastName: info.lastName ?? null,
    jobTitle: info.jobTitle ?? null,
    address: info.address ?? null,
    phone: info.phone ?? null,
    email: info.email ?? null,
    github: info.github ?? null,
    linkedin: info.linkedin ?? null,
  };
};

const useCreateImportedResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateImportedResumeInput): Promise<CreateImportedResumeResult> => {
      const createResponse = await api.document.create.$post({ json: { title: input.title } });
      const createJson = (await createResponse.json()) as {
        success?: string | boolean;
        data?: { documentId: string; locale?: string | null };
      };

      if (!createResponse.ok || createJson.success !== 'ok' || !createJson.data?.documentId) {
        throw new Error('Failed to create resume');
      }

      const documentId = createJson.data.documentId;
      const locale = createJson.data.locale ?? null;

      const updatePayload = {
        summary: input.summary ?? undefined,
        armyService: input.armyService ?? undefined,
        personalInfo: mapPersonalInfo(input.personalInfo),
        experience: mapExperiences(input.experiences),
        education: mapEducations(input.educations),
        skills: mapSkills(input.skills),
        projects: mapProjects(input.projects),
        languages: mapLanguages(input.languages),
      };

      const updateResponse = await api.document.update[':documentId'].$patch({
        param: { documentId },
        json: updatePayload,
      });

      if (!updateResponse.ok) {
        const message = await updateResponse.text();
        throw new Error(`Failed to populate resume data: ${message}`);
      }

      return { documentId, locale };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] }).catch(error => {
        console.error('Error invalidating documents query:', error);
      });
      toast({
        title: 'Resume imported',
        description: 'Your resume has been created from the uploaded file',
      });
    },
    onError: error => {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Could not create the imported resume',
        variant: 'destructive',
      });
    },
  });
};

export default useCreateImportedResume;
