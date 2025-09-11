'use client';

import { api } from '@/lib/hono-rpc';
import { useBaseMutation } from '@hooks/document/base-mutation';
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
  direction?: string;
  locale?: string;
  sectionPaddings?: any;
};

type UpdateDocumentResponse = APIResponseType<{ message: string }>;

const useUpdateDocument = () => {
  const param = useParams();
  const documentId = param.documentId as string;

  return useBaseMutation<UpdateDocumentResponse, UpdateDocumentRequest>({
    mutationFn: async json => {
      const response = await api.document.update[':documentId']['$patch']({
        param: {
          documentId: documentId,
        },
        json,
      });
      return await response.json();
    },
    successMessage: 'Document updated successfully',
    errorMessage: 'Failed to update document',
    invalidateQueries: [['document', 'documentId']],
    showSuccessToast: false,
  });
};

export default useUpdateDocument;
