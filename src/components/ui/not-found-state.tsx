import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full-height "we couldn't find this" state for detail routes reached with a
 * bad/stale id — always offers a way back to the parent list instead of
 * stranding the user (a field guard who followed a dead link mid-shift needs
 * an exit, not a full stop). Plain, no-blame copy (VISION error tone).
 */
export function NotFoundState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-raised text-muted-foreground">
        <SearchX size={22} strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-[16px] leading-[24px] font-semibold text-foreground">{title}</p>
        <p className="text-[14px] leading-[20px] text-muted-foreground max-w-[320px]">{description}</p>
      </div>
      <Button asChild variant="outline" className="mt-1">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
