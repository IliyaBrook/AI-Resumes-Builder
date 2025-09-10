import { createEntityHooks } from '@hooks/document/entity-hooks-factory';

type DeleteExperienceParams = {
  experienceId: number;
};

const experienceHooks = createEntityHooks('experience');

const useDeleteExperience = () => {
  const deleteHook = experienceHooks.useDelete<any>();

  return {
    ...deleteHook,
    mutate: ({ experienceId }: DeleteExperienceParams) => {
      deleteHook.mutate({ id: experienceId });
    },
  };
};

export default useDeleteExperience;
