import { toast } from '@/hooks/use-toast'
import { api } from '@/lib/hono-rpc'
import { SkillType } from '@/types/resume.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export type UpdateSkillParams = {
  skillId: number;
  data: Partial<Omit<SkillType, "id">>;
};

const useUpdateSkill = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  return useMutation({
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
};

export default useUpdateSkill; 