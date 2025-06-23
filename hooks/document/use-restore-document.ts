'use client';
import { api } from '@/lib/hono-rpc';
import { useBaseMutation } from './base-mutation';
import { APIResponseType } from '@/types/resume.type';

type RestoreDocumentRequest = {
  documentId: string;
  status?: string;
};

type RestoreDocumentResponse = APIResponseType<{ message: string }>;

const useRestoreDocument = () => {
  return useBaseMutation<RestoreDocumentResponse, RestoreDocumentRequest>({
    mutationFn: async json => {
      const response = await api.document.retore.archive.$patch({
        json: json,
      });
      return await response.json();
    },
    successMessage: 'Document restored successfully',
    errorMessage: 'Failed to restore document',
    invalidateQueries: [['trashDocuments'], ['documents'], ['document']],
  });
};

export default useRestoreDocument;
