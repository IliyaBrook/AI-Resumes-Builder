import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/hono-rpc";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { ExperienceType } from "@/types/resume.type";

const useCreateExperience = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Omit<ExperienceType, "id">) => {
      const today = new Date().toISOString().slice(0, 10);
      const sanitized = {
        ...data,
        startDate: !data.startDate ? today : data.startDate,
        endDate: !data.endDate ? today : data.endDate,
        yearsOnly: data.yearsOnly ?? false,
      };
      const response = await (api.document as any)["experience/create"].$post({
        json: { ...sanitized, docId: documentId },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Success",
        description: "Experience created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create experience",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export default useCreateExperience; 