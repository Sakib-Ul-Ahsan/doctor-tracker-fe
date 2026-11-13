import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 6, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex items-center gap-4 px-4 py-4">
          {Array.from({ length: columns }).map((__, colIdx) => (
            <Skeleton
              key={colIdx}
              className={colIdx === 0 ? "h-4 w-36" : "h-4 flex-1"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

