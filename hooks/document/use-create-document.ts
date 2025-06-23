'use client';
import { toast } from '@/hooks';
import { api } from '@/lib/hono-rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentType, APIResponseType } from '@/types/resume.type';

type CreateDocumentRequest = {
  title: string;
};

type CreateDocumentResponse = APIResponseType<DocumentType & { documentId: string }>;

const useCreateDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateDocumentResponse, Error, CreateDocumentRequest>({
    mutationFn: async json => {
      const response = await api.document.create.$post({ json });
      return await response.json();
    },
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create document',
        variant: 'destructive',
      });
    },
  });

  return mutation;
};

export default useCreateDocument;
