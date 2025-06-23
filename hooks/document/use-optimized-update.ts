'use client';

import { useBaseMutation } from './base-mutation';
import { useDataTracking } from './use-data-tracking';
import { useCallback } from 'react';

interface OptimizedUpdateConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[][];
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  initialData?: TVariables;
  showSuccessToast?: boolean;
}

export const useOptimizedUpdate = <TData, TVariables>({
  mutationFn,
  successMessage = 'Updated successfully',
  errorMessage = 'Failed to update',
  invalidateQueries = [],
  onSuccess,
  onError,
  initialData,
  showSuccessToast = true,
}: OptimizedUpdateConfig<TData, TVariables>) => {
  const { originalData, hasChanges, setOriginalData, updateCurrentData, confirmChanges } =
    useDataTracking<TVariables>(initialData);

  const mutation = useBaseMutation<TData, TVariables>({
    mutationFn,
    successMessage,
    errorMessage,
    invalidateQueries,
    enableChangeDetection: true,
    originalData,
    skipNoChangesToast: false,
    showSuccessToast,
    onSuccess: (data, variables) => {
      confirmChanges();
      onSuccess?.(data, variables);
    },
    onError,
  });

  const optimizedMutate = useCallback(
    (data: TVariables) => {
      updateCurrentData(data);
      mutation.mutate(data);
    },
    [mutation, updateCurrentData]
  );

  const optimizedMutateAsync = useCallback(
    (data: TVariables) => {
      updateCurrentData(data);
      return mutation.mutateAsync(data);
    },
    [mutation, updateCurrentData]
  );

  return {
    ...mutation,
    mutate: optimizedMutate,
    mutateAsync: optimizedMutateAsync,
    hasChanges,
    originalData,
    setOriginalData,
    updateCurrentData,
  };
};
