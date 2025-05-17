import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/hono-rpc";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { SkillType } from "@/types/resume.type";

const useCreateSkill = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Omit<SkillType, "id">) => {
      const response = await (api.document as any)["skill/create"].$post({
        json: { ...data, hideRating: data.hideRating ? 1 : 0, docId: documentId },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Success",
        description: "Skill created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create skill",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export default useCreateSkill; 