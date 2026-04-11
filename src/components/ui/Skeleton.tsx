interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`rounded-lg animate-shimmer ${className}`} />;
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-64">
      <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center justify-center gap-6 py-6 px-4">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-12 rounded-md" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-10 w-16 rounded-lg" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-12 rounded-md" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <div className="px-4 pb-4 grid grid-cols-3 gap-2">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
      <div className="mt-auto border-t border-gray-100">
        <Skeleton className="h-12 rounded-none" />
      </div>
    </div>
  );
}

export function ScoreboardSkeleton() {
  return (
    <div className="flex gap-3 items-end">
      <Skeleton className="h-14 w-16 rounded-xl" />
      <Skeleton className="h-16 w-18 rounded-xl" />
      <Skeleton className="h-14 w-16 rounded-xl" />
    </div>
  );
}

export function QuestionCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}
