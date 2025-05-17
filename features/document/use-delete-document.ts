"use client";

import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/hono-rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await api.document[":documentId"].$delete({
        param: { documentId },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Success",
        description: "Resume deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export default useDeleteDocument; 