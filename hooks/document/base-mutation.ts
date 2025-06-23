'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks';
import { useParams } from 'next/navigation';
import { hasDataChanged, getChangedFields } from '@/lib/data-compare';

interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[][];
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  enableChangeDetection?: boolean;
  originalData?: any;
  skipNoChangesToast?: boolean;
  showSuccessToast?: boolean;
}

export const useBaseMutation = <TData, TVariables>({
  mutationFn,
  successMessage = 'Operation completed successfully',
  errorMessage = 'Operation failed',
  invalidateQueries = [],
  onSuccess,
  onError,
  enableChangeDetection = false,
  originalData,
  skipNoChangesToast = false,
  showSuccessToast = true,
}: MutationConfig<TData, TVariables>) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const documentId = params.documentId as string;

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (enableChangeDetection && originalData) {
        const changed = hasDataChanged(originalData, variables);

        if (!changed) {
          if (!skipNoChangesToast) {
            toast({
              title: 'No changes',
              description: 'No changes were made to save',
              variant: 'default',
            });
          }
          throw new Error('NO_CHANGES');
        }

        const changedFields = getChangedFields(originalData, variables);
        if (changedFields && typeof variables === 'object') {
          return mutationFn(changedFields as TVariables);
        }
      }

      return mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({
          queryKey: queryKey.includes('documentId')
            ? queryKey.map(key => (key === 'documentId' ? documentId : key))
            : queryKey,
        });
      });

      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }

      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      if (error.message === 'NO_CHANGES') {
        return;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      onError?.(error, variables);
    },
  });
};
