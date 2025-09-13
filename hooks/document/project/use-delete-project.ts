import { createEntityHooks } from '@/hooks';

type DeleteProjectParams = {
  projectId: number;
};

const projectHooks = createEntityHooks('project');

const useDeleteProject = () => {
  const deleteHook = projectHooks.useDelete<any>();

  return {
    ...deleteHook,
    mutate: ({ projectId }: DeleteProjectParams) => {
      deleteHook.mutate({ id: projectId });
    },
  };
};

export default useDeleteProject;
