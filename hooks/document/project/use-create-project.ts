import { useParams } from 'next/navigation';
import { createEntityHooks } from '@/hooks';
import { ProjectType } from '@/types/resume.type';

const projectHooks = createEntityHooks('project');

const useCreateProject = () => {
  const params = useParams();
  const documentId = params.documentId as string;

  return projectHooks.useCreate<any>((data: Omit<ProjectType, 'id'>) => {
    return {
      ...data,
      docId: documentId,
    };
  });
};

export default useCreateProject;
