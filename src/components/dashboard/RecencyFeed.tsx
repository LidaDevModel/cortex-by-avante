"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { RequiredPill } from "@/components/training/ModuleCard";
import { ModuleIcon } from "@/components/training/ModuleIcon";
import { FileIllustration } from "@/components/library/RecentlyViewedCard";
import { useTheme } from "@/components/theme-context";
import { Segmented } from "@/components/ui/segmented";
import { daysSince } from "@/lib/utils";
import { type LibraryDoc, getRecentDocuments } from "@/lib/library-mock";
import { type Module, getRecentModules } from "@/lib/training-mock";

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
      // No bloom on doc rows, so the bg does the work: the chip tone matches the
      // bloomed module rows' effective luminance. Hover steps once more.
      className="group flex items-center gap-3 px-4 py-3 border-t border-border first:border-t-0 bg-surface-chip transition-[background-color,scale] duration-100 hover:bg-surface-chip-hover active:scale-[0.99]"
    >
      <span className="shrink-0" style={{ width: 40 }}>
        <FileIllustration uid={uid} shadowOpacity={shadowOpacity} />
      </span>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="text-[14px] leading-[20px] font-medium truncate" style={{ color: "var(--primary)" }}>
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
      className="relative overflow-hidden flex items-center gap-3 px-4 py-3 border-t border-border first:border-t-0 transition-[background-color,scale] duration-100 hover:bg-surface-chip-hover dark:hover:bg-surface-chip active:scale-[0.99]"
    >
      <ModuleIcon category={m.category} size={36} />
      <span className="relative z-10 flex flex-col min-w-0 flex-1">
        <span className="text-[14px] leading-[20px] font-medium truncate" style={{ color: "var(--primary)" }}>
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

  const rows: Row[] = [
    ...getRecentDocuments(RECENCY_DAYS).map((doc) => ({
      kind: "doc" as const,
      key: `doc-${doc.id}`,
      sortDays: daysSince(doc.lastModified),
      doc,
    })),
    ...getRecentModules(RECENCY_DAYS).map((m) => ({
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
        // In-card list block on the lifted tone; hairline dividers keep the list
        // structure; row hover steps once more (raised in light, --accent in dark).
        <div className="flex flex-col rounded-[12px] overflow-hidden bg-surface-lifted">
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
