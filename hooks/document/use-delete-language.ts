import { useBaseMutation } from './base-mutation';

type DeleteLanguageParams = {
  languageId: number;
};

const useDeleteLanguage = () => {
  const deleteHook = useBaseMutation<any, { languageId: number }>({
    mutationFn: async ({ languageId }) => {
      const response = await fetch(`/api/document/language/${languageId}`, {
        method: 'DELETE',
      });
      return await response.json();
    },
    successMessage: 'Language deleted successfully',
    errorMessage: 'Failed to delete language',
    invalidateQueries: [['document', 'documentId']],
  });

  return {
    ...deleteHook,
    mutate: ({ languageId }: DeleteLanguageParams) => {
      deleteHook.mutate({ languageId });
    },
  };
};

export default useDeleteLanguage;
