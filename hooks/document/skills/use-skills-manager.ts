import { useMemo, useCallback } from 'react';
import { SkillType } from '@/types/resume.type';
import { useUpdateSkill, useCreateSkill, useDeleteSkill } from './index';

interface UseSkillsManagerOptions {
  skills: SkillType[];
  format: 'default' | 'byCategory';
}

interface UseSkillsManagerReturn {
  sortedSkills: SkillType[];
  skillsByCategory: Record<string, SkillType[]>;
  sortedCategories: string[];
  createSkill: (skill: Omit<SkillType, 'id'>) => Promise<SkillType>;
  updateSkill: (skillId: number, data: Partial<SkillType>) => void;
  deleteSkill: (skillId: number) => void;
  moveSkill: (fromIndex: number, toIndex: number, skills: SkillType[]) => SkillType[];
  moveCategoryUp: (categoryName: string) => void;
  moveCategoryDown: (categoryName: string) => void;
  isLoading: boolean;
}

export const useSkillsManager = ({ skills, format }: UseSkillsManagerOptions): UseSkillsManagerReturn => {
  const { mutate: updateSkillMutation } = useUpdateSkill();
  const { mutateAsync: createSkillMutation, isPending: isCreating } = useCreateSkill();
  const { mutate: deleteSkillMutation, isPending: isDeleting } = useDeleteSkill();

  // Memoize sorted skills for default format
  const sortedSkills = useMemo(() => {
    if (!skills || format !== 'default') return [];
    return skills.slice().sort((a, b) => (a.skillOrder || 0) - (b.skillOrder || 0));
  }, [skills, format]);

  // Memoize skills grouped by category
  const skillsByCategory = useMemo(() => {
    if (!skills || format !== 'byCategory') return {};

    const grouped: Record<string, SkillType[]> = {};
    skills.forEach(skill => {
      const category = skill.category || '';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({
        ...skill,
        hideRating: !!skill.hideRating,
      });
    });

    const sortedGrouped: Record<string, SkillType[]> = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const aMinOrder = Math.min(...grouped[a].map(skill => skill.categoryOrder || 0));
        const bMinOrder = Math.min(...grouped[b].map(skill => skill.categoryOrder || 0));
        return aMinOrder - bMinOrder;
      })
      .forEach(categoryName => {
        sortedGrouped[categoryName] = grouped[categoryName].sort((a, b) => (a.skillOrder || 0) - (b.skillOrder || 0));
      });

    return sortedGrouped;
  }, [skills, format]);

  // Memoize sorted category names
  const sortedCategories = useMemo(() => {
    return Object.keys(skillsByCategory);
  }, [skillsByCategory]);

  // Optimized create function
  const createSkill = useCallback(
    async (skillData: Omit<SkillType, 'id'>) => {
      return await createSkillMutation(skillData);
    },
    [createSkillMutation]
  );

  // Optimized update function
  const updateSkill = useCallback(
    (skillId: number, data: Partial<SkillType>) => {
      updateSkillMutation({ skillId, data });
    },
    [updateSkillMutation]
  );

  // Optimized delete function
  const deleteSkill = useCallback(
    (skillId: number) => {
      deleteSkillMutation({ skillId });
    },
    [deleteSkillMutation]
  );

  // Optimized move skill function
  const moveSkill = useCallback(
    (fromIndex: number, toIndex: number, currentSkills: SkillType[]): SkillType[] => {
      if (toIndex < 0 || toIndex >= currentSkills.length) return currentSkills;

      const newSkills = [...currentSkills];
      const [moved] = newSkills.splice(fromIndex, 1);
      newSkills.splice(toIndex, 0, moved);

      const updatedSkills = newSkills.map((skill, idx) => ({
        ...skill,
        skillOrder: idx,
      }));

      // Update only the skills that changed order
      updatedSkills.forEach((skill, idx) => {
        if (skill.id && skill.skillOrder !== currentSkills.find(s => s.id === skill.id)?.skillOrder) {
          updateSkillMutation({ skillId: skill.id, data: { skillOrder: idx } });
        }
      });

      return updatedSkills;
    },
    [updateSkillMutation]
  );

  // Optimized move category up function
  const moveCategoryUp = useCallback(
    (categoryName: string) => {
      const currentIndex = sortedCategories.indexOf(categoryName);
      if (currentIndex <= 0) return;

      const currentCategorySkills = skillsByCategory[categoryName] || [];
      const targetCategorySkills = skillsByCategory[sortedCategories[currentIndex - 1]] || [];

      if (currentCategorySkills.length === 0 || targetCategorySkills.length === 0) return;

      const targetMinOrder = Math.min(...targetCategorySkills.map(skill => skill.categoryOrder || 0));
      const newCategoryOrder = targetMinOrder - 1;

      currentCategorySkills.forEach(skill => {
        if (skill.id) {
          updateSkillMutation({
            skillId: skill.id,
            data: { categoryOrder: newCategoryOrder },
          });
        }
      });
    },
    [sortedCategories, skillsByCategory, updateSkillMutation]
  );

  // Optimized move category down function
  const moveCategoryDown = useCallback(
    (categoryName: string) => {
      const currentIndex = sortedCategories.indexOf(categoryName);
      if (currentIndex >= sortedCategories.length - 1) return;

      const currentCategorySkills = skillsByCategory[categoryName] || [];
      const targetCategorySkills = skillsByCategory[sortedCategories[currentIndex + 1]] || [];

      if (currentCategorySkills.length === 0 || targetCategorySkills.length === 0) return;

      const targetMaxOrder = Math.max(...targetCategorySkills.map(skill => skill.categoryOrder || 0));
      const newCategoryOrder = targetMaxOrder + 1;

      currentCategorySkills.forEach(skill => {
        if (skill.id) {
          updateSkillMutation({
            skillId: skill.id,
            data: { categoryOrder: newCategoryOrder },
          });
        }
      });
    },
    [sortedCategories, skillsByCategory, updateSkillMutation]
  );

  return {
    sortedSkills,
    skillsByCategory,
    sortedCategories,
    createSkill,
    updateSkill,
    deleteSkill,
    moveSkill,
    moveCategoryUp,
    moveCategoryDown,
    isLoading: isCreating || isDeleting,
  };
};
