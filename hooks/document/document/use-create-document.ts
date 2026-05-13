'use client';
import { api } from '@/lib/hono-rpc';
import { useBaseMutation } from '@/hooks';
import { DocumentType, APIResponseType } from '@/types/resume.type';

type CreateDocumentRequest = {
  title: string;
};

type CreateDocumentResponse = APIResponseType<DocumentType & { documentId: string }>;

const useCreateDocument = () => {
  return useBaseMutation<CreateDocumentResponse, CreateDocumentRequest>({
    mutationFn: async json => {
      const response = await api.document.create.$post({ json });
      return await response.json();
    },
    successMessage: 'Document created successfully',
    errorMessage: 'Failed to create document',
    invalidateQueries: [['documents']],
  });
};

export default useCreateDocument;
