import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/hono-rpc";
import { toast } from "@/hooks";
import { useParams } from "next/navigation";

type DeleteProjectParams = {
  projectId: number;
};

const useDeleteProject = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ projectId }: DeleteProjectParams) => {
      const response = await api.document.project[":projectId"].$delete({
        param: { projectId: projectId.toString() },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export default useDeleteProject;
