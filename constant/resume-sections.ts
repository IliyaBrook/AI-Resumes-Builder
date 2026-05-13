import { LanguagePreview } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/Language';
import { ProjectPreview } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/Project';
import { SkillPreview } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/Skills';
import { EducationPreview } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/Education';
import { ExperiencePreview } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/Experience';
import { SummaryPreview } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/Summary';
import { PersonalInfoPreview } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/PersonalInfo';
import { ArmyPreview } from '@/app/(home)/dashboard/document/[documentId]/[locale]/edit/EditResume/Army';
import { DEFAULT_PAGES_ORDER } from './default-pages-order';

export { DEFAULT_PAGES_ORDER };

export const SECTION_COMPONENTS = {
  'personal-info': PersonalInfoPreview,
  summary: SummaryPreview,
  experience: ExperiencePreview,
  education: EducationPreview,
  projects: ProjectPreview,
  skills: SkillPreview,
  languages: LanguagePreview,
  army: ArmyPreview,
} as const;

const ALL_AVAILABLE_PAGES = Object.keys(SECTION_COMPONENTS) as Array<keyof typeof SECTION_COMPONENTS>;

export function syncPagesOrder(currentOrder: string[]): string[] {
  const missingPages = ALL_AVAILABLE_PAGES.filter(page => !currentOrder.includes(page));

  if (missingPages.length === 0) {
    return currentOrder;
  }

  return [...currentOrder, ...missingPages];
}

export type SectionKey = keyof typeof SECTION_COMPONENTS;
