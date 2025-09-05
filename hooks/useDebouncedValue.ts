import { useEffect, useState } from 'react';

const useDebouncedValue = <T>(value: T, delay: number = 1000): T | undefined => {
  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebouncedValue;
