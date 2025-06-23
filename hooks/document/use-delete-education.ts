import { createEntityHooks } from './entity-hooks-factory';

type DeleteEducationParams = {
  educationId: number;
};

const educationHooks = createEntityHooks('education');

const useDeleteEducation = () => {
  const deleteHook = educationHooks.useDelete<any>();

  return {
    ...deleteHook,
    mutate: ({ educationId }: DeleteEducationParams) => {
      deleteHook.mutate({ id: educationId });
    },
  };
};

export default useDeleteEducation;
