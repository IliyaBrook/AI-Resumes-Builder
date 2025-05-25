import { Skeleton } from "../ui/skeleton";

const PersonalInfoSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-2 mt-5 gap-3">
      {}
      <div>
        <Skeleton className="h-4 w-1/3 mb-1" /> {}
        <Skeleton className="h-9 w-full" /> {}
      </div>
      <div>
        <Skeleton className="h-4 w-1/3 mb-1" /> {}
        <Skeleton className="h-9 w-full" /> {}
      </div>
      <div className="col-span-2">
        <Skeleton className="h-4 w-1/3 mb-1" /> {}
        <Skeleton className="h-9 w-full" /> {}
      </div>
      <div className="col-span-2">
        <Skeleton className="h-4 w-1/3 mb-1" /> {}
        <Skeleton className="h-9 w-full" /> {}
      </div>
      <div className="col-span-2">
        <Skeleton className="h-4 w-1/3 mb-1" /> {}
        <Skeleton className="h-9 w-full" /> {}
      </div>
      <div className="col-span-2">
        <Skeleton className="h-4 w-1/3 mb-1" /> {}
        <Skeleton className="h-9 w-full" /> {}
      </div>
      <div className="col-span-2">
        <Skeleton className="h-4 w-1/3 mb-1" /> {}
        <Skeleton className="h-9 w-full" /> {}
      </div>
      <Skeleton className="h-10 w-32 mt-4 col-span-2" /> {}
    </div>
  );
};

export default PersonalInfoSkeletonLoader;
