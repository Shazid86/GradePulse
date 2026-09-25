import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading state for the (app) segment (spec §30/§25). */
export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="mx-auto w-full max-w-4xl space-y-6"
    >
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
