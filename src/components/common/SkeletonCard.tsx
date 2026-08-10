export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-gray-200 mt-0.5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="w-16 h-5 bg-gray-100 rounded-full shrink-0" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
