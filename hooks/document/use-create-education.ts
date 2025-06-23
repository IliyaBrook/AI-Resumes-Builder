import { useParams } from 'next/navigation';
import { createEntityHooks } from './entity-hooks-factory';
import { EducationType } from '@/types/resume.type';

const educationHooks = createEntityHooks('education');

const useCreateEducation = () => {
  const params = useParams();
  const documentId = params.documentId as string;

  return educationHooks.useCreate<any>((data: Omit<EducationType, 'id'>) => ({
    ...data,
    docId: documentId,
  }));
};

export default useCreateEducation;
