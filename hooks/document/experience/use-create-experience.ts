import { useParams } from 'next/navigation';
import { createEntityHooks } from '@/hooks';
import { ExperienceType } from '@/types/resume.type';

const experienceHooks = createEntityHooks('experience');

const useCreateExperience = () => {
  const params = useParams();
  const documentId = params.documentId as string;

  return experienceHooks.useCreate<any>((data: Omit<ExperienceType, 'id'>) => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      ...data,
      startDate: !data.startDate ? today : data.startDate,
      endDate: !data.endDate ? today : data.endDate,
      yearsOnly: data.yearsOnly ?? false,
      docId: documentId,
    };
  });
};

export default useCreateExperience;
