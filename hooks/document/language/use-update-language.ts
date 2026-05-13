import { createEntityHooks } from '@/hooks';

const languageHooks = createEntityHooks('language');

const useUpdateLanguage = () => {
  return languageHooks.useUpdate<any>();
};

export default useUpdateLanguage;
