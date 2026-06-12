export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-[#EFE7DE] rounded ${className}`} 
      aria-hidden="true" 
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl border border-[#E4DDD5] bg-white overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function EditorialCardSkeleton() {
  return (
    <div className="rounded-3xl border border-[#E4DDD5] bg-white overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-7 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4"><Skeleton className="h-4 w-full" /></td>
      ))}
    </tr>
  );
}
