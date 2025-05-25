import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/hono-rpc";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { SkillType } from "@/types/resume.type";

export type UpdateSkillParams = {
  skillId: number;
  data: Partial<Omit<SkillType, "id">>;
};

const useUpdateSkill = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ skillId, data }: UpdateSkillParams) => {
      const response = await api.document.skill[":skillId"].$patch({
        param: { skillId: skillId.toString() },
        json: { 
          ...data, 
          hideRating: data.hideRating ? 1 : 0,
          name: data.name || undefined,
          category: data.category || undefined
        },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update skill",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export default useUpdateSkill; 