import { useParams } from 'next/navigation';
import { createEntityHooks } from '@/hooks';
import { LanguageType } from '@/types/resume.type';

const languageHooks = createEntityHooks('language');

const useCreateLanguage = () => {
  const params = useParams();
  const documentId = params.documentId as string;

  return languageHooks.useCreate<any>((data: Omit<LanguageType, 'id'>) => {
    return {
      ...data,
      docId: documentId,
      order: data.order ?? 0,
    };
  });
};

export default useCreateLanguage;
