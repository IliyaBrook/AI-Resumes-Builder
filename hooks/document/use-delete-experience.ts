import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/hono-rpc";
import { toast } from '@/hooks';
import { useParams } from "next/navigation";

export type DeleteExperienceParams = {
  experienceId: number;
};

const useDeleteExperience = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ experienceId }: DeleteExperienceParams) => {
      const response = await api.document.experience[":experienceId"].$delete({
        param: { experienceId: experienceId.toString() },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Success",
        description: "Experience deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export default useDeleteExperience; 