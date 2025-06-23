import { useParams } from 'next/navigation';
import { createEntityHooks } from '@/hooks';
import { SkillType } from '@/types/resume.type';

const skillHooks = createEntityHooks('skill');

const useCreateSkill = () => {
  const params = useParams();
  const documentId = params.documentId as string;

  return skillHooks.useCreate<any>((data: Omit<SkillType, 'id'> & { category?: string }) => ({
    ...data,
    hideRating: data.hideRating ? 1 : 0,
    docId: documentId,
    category: data.category,
  }));
};

export default useCreateSkill;
