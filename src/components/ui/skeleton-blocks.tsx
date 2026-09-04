import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/*
 * Shared skeleton SHAPES, so the eight screens that show one do not each
 * invent their own. VISION: "a Skeleton layout that mirrors the real content's
 * shape, not spinners" — these are the four shapes the product actually has.
 *
 * Library and Training-modules keep their bespoke skeletons: those mirror a
 * card carousel and a module-illustration row, shapes nothing else repeats.
 *
 * Widths are deliberately uneven. A stack of identical full-width bars reads
 * as a loading GRAPHIC; lines of varying length read as text that has not
 * arrived, which is what these stand in for.
 */

/** Paragraph-shaped lines. The last one is short, the way a paragraph ends. */
export function SkeletonLines({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          className="h-4 rounded"
          style={{ width: i === count - 1 ? "48%" : i % 3 === 1 ? "88%" : "100%" }}
        />
      ))}
    </div>
  );
}

/** A dashboard widget card: heading, a few lines, and a control. */
export function SkeletonCard({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div
      className={cn("rounded-[12px] p-5 flex flex-col gap-4 bg-surface-raised", className)}
      style={{ border: "1px solid var(--border)" }}
    >
      <Skeleton className="h-4 w-32 rounded" />
      <SkeletonLines count={lines} />
      <Skeleton className="h-11 w-36 rounded-[8px]" />
    </div>
  );
}

/**
 * The admin list shape: a toolbar (search + filters), a run of rows, and the
 * pagination strip. Every admin list is this, so every admin list can share it.
 */
export function SkeletonList({ rows = 6, filters = 2 }: { rows?: number; filters?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-12 flex-1 min-w-[200px] rounded-[8px]" />
        {Array.from({ length: filters }, (_, i) => (
          <Skeleton key={i} className="h-11 w-32 rounded-[8px]" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-[12px]" />
        ))}
      </div>
      <Skeleton className="h-9 w-48 rounded-[8px] self-center" />
    </div>
  );
}

/** A reading surface: title, then body text. Used by both readers. */
export function SkeletonReader({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Skeleton className="h-7 w-2/3 rounded" />
      <SkeletonLines count={6} />
      <Skeleton className="h-5 w-40 rounded" />
      <SkeletonLines count={5} />
    </div>
  );
}
