import PersonalInfo from "@/components/preview/PersonalInfoPreview";
import SummaryPreview from "@/components/preview/SummaryPreview";
import ExperiencePreview from "@/components/preview/ExperiencePreview";
import EducationPreview from "@/components/preview/EducationPreview";
import SkillPreview from "@/components/preview/SkillPreview";
import ProjectPreview from "@/components/preview/ProjectPreview";
import LanguagePreview from "@/components/preview/LanguagePreview";

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
  "personal-info": PersonalInfo,
  summary: SummaryPreview,
  experience: ExperiencePreview,
  education: EducationPreview,
  projects: ProjectPreview,
  skills: SkillPreview,
  languages: LanguagePreview,
} as const;

export const ALL_AVAILABLE_PAGES = Object.keys(SECTION_COMPONENTS) as Array<
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
