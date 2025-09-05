import { useEffect, useRef } from 'react';
import { SkillType } from '@/types/resume.type';
import { useUpdateSkill } from '@/hooks';

interface UseSkillInputHandlerProps {
  debouncedSkillInputs: Record<number, string>;
  debouncedCategoryInputs?: Record<number, string>;
  resumeInfo: any;
}

export const useSkillInputHandler = ({
  debouncedSkillInputs,
  debouncedCategoryInputs,
  resumeInfo,
}: UseSkillInputHandlerProps) => {
  const { mutate: updateSkill } = useUpdateSkill();

  // Use refs to store the previous values to prevent infinite loops
  const prevSkillInputsRef = useRef<Record<number, string>>({});
  const prevCategoryInputsRef = useRef<Record<number, string>>({});
  const pendingUpdatesRef = useRef<Set<string>>(new Set());

  // Handle skill name updates
  useEffect(() => {
    if (!resumeInfo?.skills) return;

    Object.entries(debouncedSkillInputs).forEach(([skillId, name]) => {
      const skillIdNum = Number(skillId);
      const currentSkill = resumeInfo.skills.find((s: SkillType) => s.id === skillIdNum);
      const prevValue = prevSkillInputsRef.current[skillIdNum];
      const updateKey = `name-${skillId}`;

      // Only update if:
      // 1. The debounced value actually changed from what we last processed
      // 2. The skill exists in the database
      // 3. The new name is different from the current database value
      // 4. We're not already processing this update
      if (
        name !== undefined &&
        name !== prevValue &&
        currentSkill &&
        currentSkill.name !== name &&
        name.trim() !== '' &&
        name.trim() !== currentSkill.name?.trim() &&
        !pendingUpdatesRef.current.has(updateKey)
      ) {
        prevSkillInputsRef.current[skillIdNum] = name;
        pendingUpdatesRef.current.add(updateKey);

        // updateSkill({ skillId: skillIdNum, data: { name } });

        // Clear the pending update after a short delay to allow the mutation to complete
        setTimeout(() => {
          pendingUpdatesRef.current.delete(updateKey);
        }, 500);
      }
    });
  }, [debouncedSkillInputs, updateSkill]);

  // Handle category updates (only if debouncedCategoryInputs is provided)
  useEffect(() => {
    if (!debouncedCategoryInputs || !resumeInfo?.skills) return;

    Object.entries(debouncedCategoryInputs).forEach(([skillId, category]) => {
      const skillIdNum = Number(skillId);
      const currentSkill = resumeInfo.skills!.find((s: SkillType) => s.id === skillIdNum);
      const prevValue = prevCategoryInputsRef.current[skillIdNum];
      const updateKey = `category-${skillId}`;

      // Only update if:
      // 1. The debounced value actually changed from what we last processed
      // 2. The skill exists in the database
      // 3. The new category is different from the current database value
      // 4. We're not already processing this update
      if (
        category !== undefined &&
        category !== prevValue &&
        currentSkill &&
        currentSkill.category !== category &&
        category.trim() !== '' &&
        category.trim() !== currentSkill.category?.trim() &&
        !pendingUpdatesRef.current.has(updateKey)
      ) {
        prevCategoryInputsRef.current[skillIdNum] = category;
        pendingUpdatesRef.current.add(updateKey);

        // When moving to a new category, update both category and categoryOrder
        const targetCategorySkills = resumeInfo.skills!.filter((s: SkillType) => s.category === category) || [];
        const newCategoryOrder =
          targetCategorySkills.length > 0
            ? Math.max(...targetCategorySkills.map((s: SkillType) => s.categoryOrder || 0))
            : 0;

        updateSkill({
          skillId: skillIdNum,
          data: {
            category,
            categoryOrder: newCategoryOrder,
          },
        });

        // Clear the pending update after a short delay to allow the mutation to complete
        setTimeout(() => {
          pendingUpdatesRef.current.delete(updateKey);
        }, 500);
      }
    });
  }, [debouncedCategoryInputs, updateSkill]);

  return { updateSkill };
};
