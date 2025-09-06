'use client';

import { api } from '@/lib/hono-rpc';
import { useBaseQuery } from '@/hooks';
import { APIResponseType, DocumentType } from '@/types';

const useGetDocuments = (isTrash: boolean = false) => {
  const queryKey = isTrash ? ['trashDocuments'] : ['documents'];

  return useBaseQuery({
    queryKey,
    queryFn: async () => {
      const endpoint = isTrash ? api.document.trash.all : api.document.all;
      const response = await endpoint.$get();

      if (!response.ok) {
        throw new Error('Failed to get documents');
      }

      const { data, success }: APIResponseType<DocumentType[]> = await response.json();
      return { data, success };
    },
  });
};

export default useGetDocuments;
