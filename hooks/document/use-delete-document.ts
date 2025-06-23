'use client';

import { api } from '@/lib/hono-rpc';
import { useBaseMutation } from './base-mutation';

const useDeleteDocument = () => {
  return useBaseMutation<any, string>({
    mutationFn: async (documentId: string) => {
      const response = await api.document[':documentId'].$delete({
        param: { documentId },
      });
      return await response.json();
    },
    successMessage: 'Resume deleted successfully',
    errorMessage: 'Failed to delete resume',
    invalidateQueries: [['documents']],
  });
};

export default useDeleteDocument;
