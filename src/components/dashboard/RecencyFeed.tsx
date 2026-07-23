"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { RequiredPill } from "@/components/training/ModuleCard";
import { ModuleIcon } from "@/components/training/ModuleIcon";
import { FileIllustration } from "@/components/library/RecentlyViewedCard";
import { useTheme } from "@/components/theme-context";
import { Segmented } from "@/components/ui/segmented";
import { daysSince } from "@/lib/utils";
import { type LibraryDoc } from "@/lib/library-mock";
import { getLearnerRecent, useLibrary } from "@/lib/content-store";
import { useCurrentRole } from "@/lib/current-role";
import { type Module } from "@/lib/training-mock";
import { getLearnerRecentModules } from "@/lib/training-store";

const RECENCY_DAYS = 14;

type Filter = "all" | "modules" | "documents";

type Row =
  | { kind: "doc"; key: string; sortDays: number; doc: LibraryDoc }
  | { kind: "module"; key: string; sortDays: number; module: Module };

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "modules", label: "Modules" },
  { value: "documents", label: "Documents" },
];

function DocRow({ doc }: { doc: LibraryDoc }) {
  // The library's own document illustration (doc-on-tray), scaled to row size.
  // `group` wires up its built-in hover state (page tilt), same as in Library.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { isDark } = useTheme();
  const shadowOpacity = isDark ? 0.16 : 0.07;

  return (
    <Link
      href={`/library/files/${doc.id}`}
      // Spaced chip carrying the shared item hover (lift + shadow in light;
      // background step in dark), matching the readiness/quick-practice lists.
      className="group relative flex items-center gap-3 rounded-[10px] p-3 bg-surface-lifted transition-[translate,scale,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] dark:hover:shadow-none dark:hover:bg-surface-chip-hover"
    >
      <span className="shrink-0" style={{ width: 40 }}>
        <FileIllustration uid={uid} shadowOpacity={shadowOpacity} />
      </span>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="text-[14px] leading-[20px] font-medium truncate" style={{ color: "var(--foreground)" }}>
          {doc.name}
        </span>
        <span className="text-[12px] leading-[16px] text-muted-foreground">Document · {doc.content}</span>
      </span>
    </Link>
  );
}

function ModuleRow({ module: m }: { module: Module }) {
  return (
    <Link
      href={`/training/modules/${m.id}`}
      className="relative overflow-hidden flex items-center gap-3 rounded-[10px] p-3 bg-surface-lifted transition-[translate,scale,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] dark:hover:shadow-none dark:hover:bg-surface-chip-hover"
    >
      <ModuleIcon category={m.category} size={36} />
      <span className="relative z-10 flex flex-col min-w-0 flex-1">
        <span className="text-[14px] leading-[20px] font-medium truncate" style={{ color: "var(--foreground)" }}>
          {m.title}
        </span>
        <span className="text-[12px] leading-[16px] text-muted-foreground">
          {m.chapters} chapters · {m.hours}h
        </span>
      </span>
      <span className="relative z-10 shrink-0 flex">
        <RequiredPill required={m.required} />
      </span>
    </Link>
  );
}

/**
 * New for your role — a pure recency feed of documents and newly-assigned
 * modules from the last 14 days, most recent first. The readiness board remains
 * the source of truth for "what's missing for readiness"; this is just what's
 * new. The filter is an informational content-type split (All / Modules /
 * Documents, defaults to All); module rows still show their Required/Optional
 * pill for context, but requirement status is not a filter.
 */
export function RecencyFeed() {
  const [filter, setFilter] = useState<Filter>("all");
  const role = useCurrentRole();
  useLibrary(); // reflect published/edited docs in the recency feed

  const rows: Row[] = [
    ...getLearnerRecent(role, RECENCY_DAYS).map((doc) => ({
      kind: "doc" as const,
      key: `doc-${doc.id}`,
      sortDays: daysSince(doc.lastModified),
      doc,
    })),
    ...getLearnerRecentModules(role, RECENCY_DAYS).map((m) => ({
      kind: "module" as const,
      key: `mod-${m.id}`,
      sortDays: daysSince(m.assignedDate),
      module: m,
    })),
  ].sort((a, b) => a.sortDays - b.sortDays);

  if (rows.length === 0) return null;

  const filtered = rows.filter((r) => {
    if (filter === "all") return true;
    return filter === "modules" ? r.kind === "module" : r.kind === "doc";
  });

  return (
    <section
      className="h-full rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">New for your role</h2>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Filter by type" />
      </div>

      {filtered.length > 0 ? (
        // Spaced chips (no connecting wrapper) so each row can lift with its own
        // shadow on hover — same item treatment as the other dashboard widgets.
        <div className="flex flex-col gap-2">
          {filtered.map((r) =>
            r.kind === "doc" ? <DocRow key={r.key} doc={r.doc} /> : <ModuleRow key={r.key} module={r.module} />
          )}
        </div>
      ) : (
        <p className="py-6 text-center text-[13px] leading-[20px] text-muted-foreground">
          Nothing new in this category.
        </p>
      )}
    </section>
  );
}
