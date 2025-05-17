import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/hono-rpc";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { EducationType } from "@/types/resume.type";

const useCreateEducation = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Omit<EducationType, "id">) => {
      const response = await (api.document as any)["education/create"].$post({
        json: { ...data, docId: documentId },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Success",
        description: "Education created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create education",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export default useCreateEducation; 