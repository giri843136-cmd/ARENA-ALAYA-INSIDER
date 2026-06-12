export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-[#1F1F1F] rounded animate-pulse" />
      ))}
    </div>
  );
}
