'use client';

import { api } from '@/lib/hono-rpc';
import { useBaseQuery } from '@/hooks';

const useGetDocumentById = (documentId: string, isPublic: boolean = false) => {
  return useBaseQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const endpoint = !isPublic
        ? api.document[':documentId']
        : api.document.public.doc[':documentId'];

      const response = await endpoint.$get({
        param: {
          documentId: documentId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get document');
      }

      const { data, success } = await response.json();
      return {
        data,
        success,
      };
    },
    retry: isPublic ? false : 3,
  });
};

export default useGetDocumentById;
