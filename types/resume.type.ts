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
};

export type EducationType = {
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
};

export type SkillType = {
  id?: number;
  docId?: string | null;
  name: string | null;
  rating?: number;
  hideRating?: boolean;
  order?: number;
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

export type StatusType = "archived" | "private" | "public" | undefined;

export type ProjectType = {
  id?: number;
  docId?: string | null;
  name: string;
  url?: string | null;
  description?: string | null;
  order?: number;
  git?: string | null;
};

export type ResumeDataType = {
  id?: number;
  documentId?: string;
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
  updatedAt?: string;
  projectsSectionTitle?: string;
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
};
