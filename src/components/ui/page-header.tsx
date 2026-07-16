"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsBell } from "@/components/notifications-bell";
import { useMobileNavVisible } from "@/hooks/use-mobile-nav";
import { cn } from "@/lib/utils";

/* ─── PageHeader ────────────────────────────────────────────────────────────
   Top bar: SidebarTrigger + breadcrumb.
   Pass `crumbs` as an array of { label, href? }. The last item is the current
   page (no href, bold foreground). All preceding items are muted links.
─────────────────────────────────────────────────────────────────────────── */

type Crumb = { label: string; href?: string };

export function PageHeader({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  // The breadcrumb is a desktop pattern. On phones the screen name lives in the
  // page body (its big title / detail-header), so the top bar shows only the
  // bell — and collapses entirely on focused-task screens (where the bell also
  // hides), so there's no empty strip. Desktop keeps the full breadcrumb.
  const browse = useMobileNavVisible();

  // Deep paths collapse the middle behind an expandable ellipsis, keeping the
  // root and the current page. Only worth it with ≥2 hidden middles, so we
  // collapse at 4+ crumbs. The trail re-collapses whenever the route changes.
  const [expanded, setExpanded] = useState(false);
  const trailKey = crumbs.map((c) => c.label).join(" / ");
  useEffect(() => setExpanded(false), [trailKey]);

  const collapsed = !expanded && crumbs.length >= 4;
  const shown: (Crumb | "ellipsis")[] = collapsed
    ? [crumbs[0], "ellipsis", crumbs[crumbs.length - 1]]
    : crumbs;

  const renderCrumb = (crumb: Crumb, isLast: boolean) =>
    isLast || !crumb.href ? (
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
    );

  return (
    <header
      className={cn(
        "relative z-10 flex items-center gap-2 px-4 h-14 shrink-0 bg-surface",
        !browse && "max-md:hidden",
        className
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <div className="hidden md:flex items-center gap-1.5 text-[14px] leading-[20px] min-w-0">
        {shown.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <ChevronRight
                size={14}
                strokeWidth={1.5}
                className="shrink-0 text-muted-foreground opacity-60"
              />
            )}
            {item === "ellipsis" ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                aria-label="Show full path"
                className="shrink-0 px-0.5 text-muted-foreground hover:text-foreground transition-colors duration-100 cursor-pointer"
              >
                …
              </button>
            ) : (
              renderCrumb(item, i === shown.length - 1)
            )}
          </span>
        ))}
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
