import { Skeleton } from './ui/skeleton';

const PersonalInfoLoader = () => {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <div>
        <Skeleton className="mb-1 h-4 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div>
        <Skeleton className="mb-1 h-4 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="col-span-2">
        <Skeleton className="mb-1 h-4 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="col-span-2">
        <Skeleton className="mb-1 h-4 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="col-span-2">
        <Skeleton className="mb-1 h-4 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="col-span-2">
        <Skeleton className="mb-1 h-4 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="col-span-2">
        <Skeleton className="mb-1 h-4 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
      <Skeleton className="col-span-2 mt-4 h-10 w-32" />
    </div>
  );
};

export default PersonalInfoLoader;
