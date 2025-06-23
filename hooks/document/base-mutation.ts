'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks';
import { useParams } from 'next/navigation';

interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[][];
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export const useBaseMutation = <TData, TVariables>({
  mutationFn,
  successMessage = 'Operation completed successfully',
  errorMessage = 'Operation failed',
  invalidateQueries = [],
  onSuccess,
  onError,
}: MutationConfig<TData, TVariables>) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const documentId = params.documentId as string;

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({
          queryKey: queryKey.includes('documentId')
            ? queryKey.map(key => (key === 'documentId' ? documentId : key))
            : queryKey,
        });
      });

      toast({
        title: 'Success',
        description: successMessage,
      });

      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      onError?.(error, variables);
    },
  });
};
