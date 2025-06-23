// components
import {
  LanguagePreview,
  ProjectPreview,
  SkillPreview,
  EducationPreview,
  ExperiencePreview,
  SummaryPreview,
  PersonalInfoPreview,
} from "@/components";

export const DEFAULT_PAGES_ORDER = [
  "personal-info",
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "languages",
];

export const SECTION_COMPONENTS = {
  "personal-info": PersonalInfoPreview,
  summary: SummaryPreview,
  experience: ExperiencePreview,
  education: EducationPreview,
  projects: ProjectPreview,
  skills: SkillPreview,
  languages: LanguagePreview,
} as const;

const ALL_AVAILABLE_PAGES = Object.keys(SECTION_COMPONENTS) as Array<
  keyof typeof SECTION_COMPONENTS
>;

export function syncPagesOrder(currentOrder: string[]): string[] {
  const missingPages = ALL_AVAILABLE_PAGES.filter(
    (page) => !currentOrder.includes(page)
  );

  if (missingPages.length === 0) {
    return currentOrder;
  }

  return [...currentOrder, ...missingPages];
}

export type SectionKey = keyof typeof SECTION_COMPONENTS;
