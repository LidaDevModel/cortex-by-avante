"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Menu } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { NotificationsBell } from "@/components/notifications-bell";
import { useMobileNavVisible } from "@/hooks/use-mobile-nav";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
import { cn } from "@/lib/utils";

/* ─── PageHeader ────────────────────────────────────────────────────────────
   Top bar: SidebarTrigger + breadcrumb.
   Pass `crumbs` as an array of { label, href? }. The last item is the current
   page (no href, bold foreground). All preceding items are muted links.
─────────────────────────────────────────────────────────────────────────── */

type Crumb = { label: string; href?: string };

export function PageHeader({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  // The breadcrumb stays from 768 up — including the tablet band, where the
  // nav is a drawer or pill but there is ample width and the admin IA runs
  // three levels deep, so the trail is the only orientation cue left. Below
  // 768 the screen name lives in the page body instead, and the bar collapses
  // entirely on focused-task screens (where the bell also hides).
  const browse = useMobileNavVisible();
  const { toggleSidebar } = useSidebar();
  // The mobile burger opens the Manage drawer — only a cleared admin has one.
  const canManage = useManageAccess();

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
          // The last crumb must be the one that gives way, so it gets
          // `min-w-0 truncate` and NOT `shrink-0` — the two together cancel
          // out, which is why a long title used to push the notifications bell
          // off the right edge instead of truncating itself.
          isLast
            ? "min-w-0 font-medium text-foreground truncate"
            : "shrink-0 text-muted-foreground"
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
        !browse && "max-lg:hidden",
        className
      )}
    >
      {/* Sidebar widths: the collapse toggle. Below the nav breakpoint (tablet
          and phone): admins get a burger that opens the nav drawer; field
          agents keep a quiet header (the floating pill is their nav), so no
          trigger there. See use-nav-shape for why the boundary is 1024. */}
      <SidebarTrigger className="-ml-1 max-lg:hidden" />
      {canManage && (
        <button
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="lg:hidden -ml-1 w-11 h-11 flex items-center justify-center rounded-lg text-foreground hover:bg-foreground/5 transition-colors duration-100"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      )}
      <div className="hidden md:flex flex-1 items-center gap-1.5 type-label min-w-0">
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
      <div className="ml-auto shrink-0 flex items-center">
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
        className="flex items-center gap-1.5 w-fit type-meta text-muted-foreground hover:text-foreground transition-colors duration-100"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        <span>{backLabel}</span>
      </Link>
      <h1 className="type-h1 font-bold text-foreground">{title}</h1>
      {meta && (
        <p className="type-meta text-muted-foreground">{meta}</p>
      )}
    </div>
  );
}
