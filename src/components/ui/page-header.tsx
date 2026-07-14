import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsBell } from "@/components/notifications-bell";
import { cn } from "@/lib/utils";

/* ─── PageHeader ────────────────────────────────────────────────────────────
   Top bar: SidebarTrigger + breadcrumb.
   Pass `crumbs` as an array of { label, href? }. The last item is the current
   page (no href, bold foreground). All preceding items are muted links.
─────────────────────────────────────────────────────────────────────────── */

type Crumb = { label: string; href?: string };

export function PageHeader({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  return (
    <header
      className={cn("relative z-10 flex items-center gap-2 px-4 h-14 shrink-0 bg-surface", className)}
    >
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-1.5 text-[14px] leading-[20px] min-w-0">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <span className="text-muted-foreground shrink-0">/</span>}
              {isLast || !crumb.href ? (
                <span
                  className={cn(
                    "shrink-0",
                    isLast ? "font-medium text-foreground truncate" : "text-muted-foreground"
                  )}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground shrink-0 hover:text-foreground transition-colors duration-100"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
      {/* Actions slot — shell-owned; the bell hides itself on focused-task
          screens (do-not-disturb during exams and reading). */}
      <div className="ml-auto flex items-center">
        <NotificationsBell />
      </div>
    </header>
  );
}

/* ─── DetailHeader ──────────────────────────────────────────────────────────
   In-canvas block: back link + h1 + optional meta line.
   `backHref` and `backLabel` are required. `meta` is optional.
─────────────────────────────────────────────────────────────────────────── */

type DetailHeaderProps = {
  backHref: string;
  backLabel: string;
  title: string;
  meta?: string;
  className?: string;
};

export function DetailHeader({ backHref, backLabel, title, meta, className }: DetailHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Link
        href={backHref}
        className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        <span>{backLabel}</span>
      </Link>
      <h1 className="text-[28px] leading-[36px] font-bold text-foreground">{title}</h1>
      {meta && (
        <p className="text-[13px] leading-[20px] text-muted-foreground">{meta}</p>
      )}
    </div>
  );
}
