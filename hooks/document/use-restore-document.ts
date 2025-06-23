'use client';
import { api } from '@/lib/hono-rpc';
import { toast } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIResponseType } from '@/types/resume.type';

type RestoreDocumentRequest = {
  documentId: string;
  status?: string;
};

type RestoreDocumentResponse = APIResponseType<{ message: string }>;

const useRestoreDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<RestoreDocumentResponse, Error, RestoreDocumentRequest>({
    mutationFn: async json => {
      const response = await api.document.retore.archive.$patch({
        json: json,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive',
      });
    },
  });
};

export default useRestoreDocument;
