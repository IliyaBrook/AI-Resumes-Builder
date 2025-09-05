import { SkillType } from '@/types';

export const getCategoryOrdersForSwap = (
  currentCategorySkills: SkillType[],
  skillsByCategory: Record<string, SkillType[]>,
  targetCategoryName: string
): { currentCategoryOrder: number; targetCategoryOrder: number } | null => {
  const targetCategorySkills = skillsByCategory[targetCategoryName] || [];

  if (currentCategorySkills.length === 0 || targetCategorySkills.length === 0) {
    return null;
  }

  const currentCategoryOrder = Math.min(...currentCategorySkills.map((skill: SkillType) => skill.categoryOrder || 0));
  const targetCategoryOrder = Math.min(...targetCategorySkills.map((skill: SkillType) => skill.categoryOrder || 0));

  return { currentCategoryOrder, targetCategoryOrder };
};
