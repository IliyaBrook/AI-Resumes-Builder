import { SkillType } from '@/types';
import React from 'react';

export const swapCategoryOrders = (
  currentCategorySkills: SkillType[],
  skillsByCategory: Record<string, SkillType[]>,
  targetCategoryName: string,
  categoryName: string,
  currentCategoryOrder: number,
  targetCategoryOrder: number,
  updateSkill: (params: { skillId: number; data: any }) => void,
  setLocalSkillsData: React.Dispatch<React.SetStateAction<SkillType[]>>
) => {
  currentCategorySkills.forEach((skill: SkillType) => {
    if (skill.id) {
      updateSkill({
        skillId: skill.id,
        data: { categoryOrder: targetCategoryOrder },
      });
    }
  });

  const targetCategorySkills = skillsByCategory[targetCategoryName] || [];
  targetCategorySkills.forEach((skill: SkillType) => {
    if (skill.id) {
      updateSkill({
        skillId: skill.id,
        data: { categoryOrder: currentCategoryOrder },
      });
    }
  });

  setLocalSkillsData(prev => {
    return prev.map(skill => {
      if (skill.category === categoryName) {
        return { ...skill, categoryOrder: targetCategoryOrder };
      } else if (skill.category === targetCategoryName) {
        return { ...skill, categoryOrder: currentCategoryOrder };
      }
      return skill;
    });
  });
};
