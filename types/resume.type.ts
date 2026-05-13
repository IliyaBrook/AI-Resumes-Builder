export type DocumentType = {
  id?: number;
  documentId: string;
  title: string;
  status: StatusType;
  thumbnail?: string | null;
  personalInfo?: PersonalInfoType | null;
  themeColor?: string | null;
  currentPosition?: number | null;
  summary: string | null;
  experiences?: ExperienceType[] | null;
  educations?: EducationType[] | null;
  skills?: SkillType[] | null;
  projects?: ProjectType[] | null;
  languages?: LanguageType[] | null;
  armyService?: string | null;
  createdAt?: string;
  updatedAt: string;
  projectsSectionTitle?: string;
  languagesSectionTitle?: string;
  skillsDisplayFormat?: string;
  personalInfoDisplayFormat?: string;
  pagesOrder?: string[] | null;
  direction?: string | null;
  locale?: string | null;
  sectionPaddings?: SectionPaddingsType | null;
};

export type SectionPaddingsType = {
  personalInfo?: PaddingType;
  summary?: PaddingType;
  experience?: PaddingType;
  education?: PaddingType;
  skills?: PaddingType;
  projects?: PaddingType;
  languages?: PaddingType;
  army?: PaddingType;
};

export type PaddingType = {
  paddingTop?: number;
  paddingBottom?: number;
};

export type ExperienceType = {
  id?: number;
  docId?: string | null;
  title: string | null;
  companyName: string | null;
  city: string | null;
  state: string | null;
  startDate: string | null;
  endDate?: string | null;
  currentlyWorking: boolean;
  workSummary: string | null;
  yearsOnly?: boolean;
  order?: number;
  paddingTop?: number;
  paddingBottom?: number;
};

export type EducationType = {
  id?: number;
  docId?: string | null;
  educationType?: 'university' | 'course';
  universityName: string | null;
  startDate: string | null;
  endDate: string | null;
  degree: string | null;
  major: string | null;
  description: string | null;
  currentlyStudying?: boolean;
  skipDates?: boolean;
  yearsOnly?: boolean;
  hideDates?: boolean;
  order?: number;
};

export type SkillType = {
  id?: number;
  docId?: string | null;
  name: string | null;
  rating?: number;
  hideRating?: boolean;
  skillOrder?: number;
  categoryOrder?: number;
  category?: string;
};

export type SkillCategoryType = {
  id?: number;
  docId?: string | null;
  name: string;
  displayOrder: number;
};

export type PersonalInfoType = {
  id?: number;
  docId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  github?: string | null;
  linkedin?: string | null;
};

export type StatusType = 'archived' | 'private' | 'public' | undefined;

export type ProjectType = {
  id?: number;
  docId?: string | null;
  name: string;
  url?: string | null;
  description?: string | null;
  order?: number;
  git?: string | null;
};

export type LanguageType = {
  id?: number;
  docId?: string | null;
  name: string;
  level?: string | null;
  order?: number;
  tempId?: string;
};

export type Education = {
  id?: number;
  docId?: string | null;
  universityName: string | null;
  startDate: string | null;
  endDate: string | null;
  degree: string | null;
  major: string | null;
  description: string | null;
  currentlyStudying?: boolean;
  skipDates?: boolean;
  yearsOnly?: boolean;
};

export type AIGeneratedSummariesType = {
  fresher: string;
  mid: string;
  experienced: string;
};

export type AIResultObjectType = {
  workSummary?: string;
  html?: string;
  experience?: string[];
  fresher?: string;
  mid?: string;
  experienced?: string;
};

export type ParsedAIResult = AIGeneratedSummariesType | string;

export type APIResponseType<T> = {
  data: T;
  message?: string;
  success?: boolean;
};
