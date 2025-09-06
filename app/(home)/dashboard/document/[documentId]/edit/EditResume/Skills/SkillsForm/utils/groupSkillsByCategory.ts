import { SkillType } from '@/types/resume.type';

export interface GroupedSkills {
  skillsByCategory: Record<string, SkillType[]>;
  sortedCategoryKeys: string[];
}

export const groupSkillsByCategory = (skills: SkillType[]): GroupedSkills => {
  if (!skills || skills.length === 0) {
    return { skillsByCategory: {}, sortedCategoryKeys: [] };
  }

  const grouped: Record<string, SkillType[]> = {};
  skills.forEach((skill: SkillType) => {
    const category = skill.category || '';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({
      ...skill,
      hideRating: !!skill.hideRating,
    });
  });

  const categoryKeys = Object.keys(grouped);
  const sortedKeys = categoryKeys.sort((a, b) => {
    const aMinOrder =
      grouped[a].length > 0 ? Math.min(...grouped[a].map((skill: SkillType) => skill.categoryOrder || 0)) : 0;
    const bMinOrder =
      grouped[b].length > 0 ? Math.min(...grouped[b].map((skill: SkillType) => skill.categoryOrder || 0)) : 0;
    return aMinOrder - bMinOrder;
  });

  const skillsByCategory: Record<string, SkillType[]> = {};
  sortedKeys.forEach(categoryName => {
    skillsByCategory[categoryName] = grouped[categoryName].sort((a, b) => (a.skillOrder || 0) - (b.skillOrder || 0));
  });

  return { skillsByCategory, sortedCategoryKeys: sortedKeys };
};
