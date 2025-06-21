import { toast } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export type DeleteLanguageParams = {
  languageId: number;
};

const useDeleteLanguage = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ languageId }: DeleteLanguageParams) => {
      const response = await fetch(`/api/document/language/${languageId}`, {
        method: 'DELETE',
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Success",
        description: "Language deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete language",
        variant: "destructive",
      });
    },
  });
};

export default useDeleteLanguage; 