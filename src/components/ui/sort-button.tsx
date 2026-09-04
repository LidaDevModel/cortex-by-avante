"use client";

import { ArrowDownUp, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Column, SortState } from "@/components/ui/data-list";

/**
 * Sorting, where there is no header row to click.
 *
 * The card rendering has no `<th>`, so sorting used to be simply unavailable
 * on a phone: `onSort` existed only inside the desktop-only tree. Three of the
 * five admin lists were sortable at a desk and not sortable at all on the
 * device the field staff actually carry.
 *
 * It offers every column whose definition carries a `sortValue`, in both
 * directions — so it can never drift from the header row: add a `sortValue`
 * and the option appears here too.
 */
/** Direction wording per kind — "A–Z" says nothing about a date. */
const DIRECTION: Record<"text" | "date" | "number", { asc: string; desc: string }> = {
  text: { asc: "A–Z", desc: "Z–A" },
  date: { asc: "Oldest first", desc: "Newest first" },
  number: { asc: "Lowest first", desc: "Highest first" },
};

export function SortButton<T>({
  columns,
  sort,
  onChange,
  className,
}: {
  columns: Column<T>[];
  sort: SortState;
  onChange: (next: SortState) => void;
  className?: string;
}) {
  const sortable = columns.filter((c) => c.sortValue);
  if (sortable.length === 0) return null;

  const active = sortable.find((c) => c.key === sort.key);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          // 44px floor: this is a primary control on a phone.
          className={
            "flex items-center gap-2 min-h-11 px-3 rounded-[8px] border border-border bg-[var(--surface)] type-meta text-foreground " +
            (className ?? "")
          }
        >
          <ArrowDownUp size={16} strokeWidth={1.5} className="text-muted-foreground" />
          {/* Names the current sort rather than just saying "Sort", so the
              order the list is in is readable without opening anything. */}
          <span className="truncate">
            {active
              ? `${active.label} · ${DIRECTION[active.sortKind ?? "text"][sort.dir]}`
              : "Sort"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {sortable.map((c) =>
          (["asc", "desc"] as const).map((dir) => {
            const isActive = sort.key === c.key && sort.dir === dir;
            return (
              <DropdownMenuItem
                key={`${c.key}-${dir}`}
                onSelect={() => onChange({ key: c.key, dir })}
              >
                <Check
                  size={16}
                  strokeWidth={2}
                  className={isActive ? "text-primary" : "opacity-0"}
                />
                {c.label} · {DIRECTION[c.sortKind ?? "text"][dir]}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
