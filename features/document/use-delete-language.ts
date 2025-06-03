import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/hono-rpc";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";

export type DeleteLanguageParams = {
  languageId: number;
};

const useDeleteLanguage = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ languageId }: DeleteLanguageParams) => {
      // TODO: Fix API endpoint path when language routes are properly configured
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

  return mutation;
};

export default useDeleteLanguage; 