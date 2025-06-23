import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/hono-rpc";
import { toast } from "@/hooks";
import { useParams } from "next/navigation";

type DeleteSkillParams = {
  skillId: number;
};

const useDeleteSkill = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ skillId }: DeleteSkillParams) => {
      const response = await api.document.skill[":skillId"].$delete({
        param: { skillId: skillId.toString() },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export default useDeleteSkill;
