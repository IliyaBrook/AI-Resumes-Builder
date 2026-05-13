import { SkillType } from '@/types/resume.type';
import { createEntityHooks } from '@/hooks';

type UpdateSkillParams = {
  skillId: number;
  data: Partial<Omit<SkillType, 'id'>>;
};

const skillHooks = createEntityHooks('skill');

const useUpdateSkill = () => {
  const updateHook = skillHooks.useUpdate<any>();

  return {
    ...updateHook,
    mutate: ({ skillId, data }: UpdateSkillParams) => {
      const transformedData = {
        ...data,
        hideRating: data.hideRating ? 1 : 0,
        name: data.name || undefined,
        category: data.category || undefined,
      };
      updateHook.mutate({ id: skillId, data: transformedData });
    },
  };
};

export default useUpdateSkill;
