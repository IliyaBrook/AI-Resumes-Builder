import React from 'react';
import { Skeleton } from './ui/skeleton';

const SkeletonLoader = () => {
  return (
    <div className="flex flex-col gap-2 pt-3">
      <Skeleton className="mx-auto mb-2 h-6 w-1/2" />
      {[...Array(3)]?.map((_, index) => (
        <div key={index} className="p-2">
          <Skeleton className="mb-1 h-5 w-1/3" />
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="mt-1 h-3 w-full" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
