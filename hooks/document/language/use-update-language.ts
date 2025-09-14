import { createEntityHooks } from '@/hooks';
import { LanguageType } from '@/types/resume.type';

const languageHooks = createEntityHooks('language');

const useUpdateLanguage = () => {
  return languageHooks.useUpdate<any>();
};

export default useUpdateLanguage;
