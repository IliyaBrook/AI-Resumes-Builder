import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/hono-rpc";
import { toast } from "@/hooks";
import { useParams } from "next/navigation";

type DeleteEducationParams = {
  educationId: number;
};

const useDeleteEducation = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ educationId }: DeleteEducationParams) => {
      const response = await api.document.education[":educationId"].$delete({
        param: { educationId: educationId.toString() },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Success",
        description: "Education deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete education",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export default useDeleteEducation;
