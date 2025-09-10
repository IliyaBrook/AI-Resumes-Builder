import { createEntityHooks } from '@hooks/document/entity-hooks-factory';

type DeleteSkillParams = {
  skillId: number;
};

const skillHooks = createEntityHooks('skill');

const useDeleteSkill = () => {
  const deleteHook = skillHooks.useDelete<any>();

  return {
    ...deleteHook,
    mutate: ({ skillId }: DeleteSkillParams) => {
      deleteHook.mutate({ id: skillId });
    },
  };
};

export default useDeleteSkill;
