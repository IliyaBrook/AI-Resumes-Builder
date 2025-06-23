'use client';

import { useRef, useCallback, useEffect } from 'react';
import { hasDataChanged } from '@/lib/data-compare';

interface UseDataTrackingOptions {
  autoReset?: boolean;
  onDataChange?: (hasChanges: boolean) => void;
}

export const useDataTracking = <T>(initialData?: T, options: UseDataTrackingOptions = {}) => {
  const { autoReset = true, onDataChange } = options;
  const originalDataRef = useRef<T | undefined>(initialData);
  const currentDataRef = useRef<T | undefined>(initialData);
  const hasChangesRef = useRef(false);

  const setOriginalData = useCallback(
    (data: T) => {
      originalDataRef.current = data;
      currentDataRef.current = data;
      hasChangesRef.current = false;
      onDataChange?.(false);
    },
    [onDataChange]
  );

  const updateCurrentData = useCallback(
    (data: T) => {
      currentDataRef.current = data;
      const hasChanges = originalDataRef.current
        ? hasDataChanged(originalDataRef.current, data)
        : false;

      if (hasChanges !== hasChangesRef.current) {
        hasChangesRef.current = hasChanges;
        onDataChange?.(hasChanges);
      }
    },
    [onDataChange]
  );

  const resetChanges = useCallback(() => {
    if (originalDataRef.current) {
      currentDataRef.current = originalDataRef.current;
      hasChangesRef.current = false;
      onDataChange?.(false);
    }
  }, [onDataChange]);

  const confirmChanges = useCallback(() => {
    if (currentDataRef.current) {
      originalDataRef.current = currentDataRef.current;
      hasChangesRef.current = false;
      onDataChange?.(false);
    }
  }, [onDataChange]);

  useEffect(() => {
    if (initialData && autoReset) {
      setOriginalData(initialData);
    }
  }, [initialData, autoReset, setOriginalData]);

  return {
    originalData: originalDataRef.current,
    currentData: currentDataRef.current,
    hasChanges: hasChangesRef.current,
    setOriginalData,
    updateCurrentData,
    resetChanges,
    confirmChanges,
  };
};
