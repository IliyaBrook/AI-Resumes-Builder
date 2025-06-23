'use client';

import { toast } from '@/hooks';
import { api } from '@/lib/hono-rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  APIResponseType,
  ExperienceType,
  EducationType,
  SkillType,
  ProjectType,
  LanguageType,
} from '@/types/resume.type';

type PersonalInfoUpdateType = {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  github?: string | null;
  linkedin?: string | null;
};

type UpdateDocumentRequest = {
  title?: string;
  status?: string;
  summary?: string;
  thumbnail?: string;
  themeColor?: string;
  currentPosition?: number;
  personalInfo?: PersonalInfoUpdateType;
  experience?: ExperienceType[];
  education?: EducationType[];
  skills?: SkillType[];
  projects?: ProjectType[];
  languages?: LanguageType[];
  projectsSectionTitle?: string;
  languagesSectionTitle?: string;
  skillsDisplayFormat?: string;
  personalInfoDisplayFormat?: string;
  pagesOrder?: string[];
};

type UpdateDocumentResponse = APIResponseType<{ message: string }>;

const useUpdateDocument = () => {
  const param = useParams();
  const queryClient = useQueryClient();
  const documentId = param.documentId as string;

  return useMutation<UpdateDocumentResponse, Error, UpdateDocumentRequest>({
    mutationFn: async json => {
      const response = await api.document.update[':documentId']['$patch']({
        param: {
          documentId: documentId,
        },
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['document', documentId],
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive',
      });
    },
  });
};

export default useUpdateDocument;
