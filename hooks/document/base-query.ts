'use client';

import { useQuery } from '@tanstack/react-query';

interface QueryConfig<TData> {
  queryKey: string[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
  retry?: number | boolean;
  refetchOnWindowFocus?: boolean;
}

export const useBaseQuery = <TData>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  retry = 3,
  refetchOnWindowFocus = false,
}: QueryConfig<TData>) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        console.error(`Query failed for key: ${queryKey.join(', ')}`, error);
        throw error;
      }
    },
    enabled,
    staleTime,
    retry,
    refetchOnWindowFocus,
  });
};
