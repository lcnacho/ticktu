export function EventListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/4 rounded bg-gray-200" />
            </div>
            <div className="h-5 w-20 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
