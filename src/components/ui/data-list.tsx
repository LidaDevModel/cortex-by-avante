"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DataList — one column definition per list, two renderings.
 *
 * WHY. Every admin list used to declare its rows TWICE: a `hidden md:block`
 * table of columns and an `md:hidden` stack of cards. Ten row trees for five
 * lists, so every change had to be made in two places — and they had already
 * drifted: sorting existed only in the desktop tree, so a phone could not sort
 * at all; the Modules list quietly dropped its Roles column; and the cards
 * joined their values with "·" and no labels, so a bare date could be created,
 * modified or last-active and you had to know which.
 *
 * A column now says once what it is, how to read it, whether it sorts, and
 * where it lands on a card. Both renderings read that. The mobile labels ARE
 * the column labels, sort reads the same definition at both widths, and
 * dropping a column becomes an explicit `mobile: "hidden"` next to a reason
 * rather than an omission nobody notices.
 *
 * TWO RENDERINGS, NOT ONE RESTYLED. Desktop is a real `<table>` with `<thead>`
 * and `<th scope="col">`. A card has no rows and no columns, so it is a `<ul>`
 * of `<li>` with label-and-value pairs — putting `role="table"` on cards would
 * describe them as something they are not.
 */

/* ─── Column widths ───────────────────────────────────────────────────────
   A NAMED SET, not free strings. The lists had grown 100 / 104 / 112 / 116 /
   150px — the same ungoverned drift just removed from the container widths.
   In `rem` so a column follows the reader's text size, like the type scale. */
export const COL_WIDTH = {
  /** A short label or a single badge. */
  narrow: "7rem",
  /** A formatted date. */
  date: "8rem",
  /** A longer marker — two badges side by side. */
  wide: "10rem",
} as const;

export type ColWidth = keyof typeof COL_WIDTH;

/** Where a column lands on a card. */
export type MobileSlot =
  /** The card's heading — the thing you scan for. Exactly one per list. */
  | "identity"
  /** A label-and-value pair in the card body. */
  | "pair"
  /** A badge at the card's trailing edge. */
  | "trailing"
  /** Deliberately omitted. Record why, next to it. */
  | "hidden";

export type Column<T> = {
  /** Stable id — sort state and React keys. */
  key: string;
  /** The `<th>` text AND the label of the mobile pair. */
  label: string;
  /** Omit on the identity column, which absorbs the remaining width. */
  width?: ColWidth;
  /** Presence makes the column sortable, at BOTH widths. */
  sortValue?: (row: T) => string | number | null | undefined;
  /**
   * How to WORD the two directions where there is no arrow to read — the
   * mobile sort menu. "A–Z" is meaningless for a date and "oldest first" is
   * meaningless for a name, so the column says which it is. Defaults to text.
   */
  sortKind?: "text" | "date" | "number";
  render: (row: T) => React.ReactNode;
  mobile: MobileSlot;
  /** Only when the card needs something other than `render`. */
  mobileRender?: (row: T) => React.ReactNode;
};

export type SortState = { key: string; dir: "asc" | "desc" };

/**
 * Wrap every column list in this. It asserts the one structural rule at MODULE
 * LOAD — so a bad definition throws on import in development, rather than
 * being discovered on a phone.
 */
export function defineColumns<T>(columns: Column<T>[]): Column<T>[] {
  if (process.env.NODE_ENV !== "production") {
    const identity = columns.filter((c) => c.mobile === "identity");
    if (identity.length !== 1) {
      throw new Error(
        `DataList: a column list needs exactly one { mobile: "identity" } column — ` +
          `found ${identity.length}` +
          (identity.length ? ` (${identity.map((c) => c.key).join(", ")})` : "") +
          `. The identity column is the card's heading; without exactly one, a card ` +
          `has no title or two.`
      );
    }
    const dupes = columns.map((c) => c.key).filter((k, i, a) => a.indexOf(k) !== i);
    if (dupes.length) {
      throw new Error(`DataList: duplicate column keys — ${[...new Set(dupes)].join(", ")}`);
    }
  }
  return columns;
}

/**
 * The one comparator. Its null policy is stated HERE and never per column:
 * an empty value sorts LAST in both directions. Reversing the direction must
 * not float the blanks to the top — "no date" is not "the earliest date", and
 * a list of unknowns is never the answer someone was looking for.
 */
export function sortRows<T>(rows: T[], columns: Column<T>[], sort: SortState): T[] {
  const col = columns.find((c) => c.key === sort.key);
  if (!col?.sortValue) return rows;
  const read = col.sortValue;
  const isEmpty = (v: unknown) => v === null || v === undefined || v === "";
  const mul = sort.dir === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const av = read(a);
    const bv = read(b);
    const ae = isEmpty(av);
    const be = isEmpty(bv);
    // Empty always last, whichever way the arrow points.
    if (ae && be) return 0;
    if (ae) return 1;
    if (be) return -1;
    if (typeof av === "number" && typeof bv === "number") return mul * (av - bv);
    return mul * String(av).localeCompare(String(bv));
  });
}

/* ─── Desktop: a real table ───────────────────────────────────────────────── */

function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  if (dir === "asc") return <ArrowUp size={11} strokeWidth={2} />;
  if (dir === "desc") return <ArrowDown size={11} strokeWidth={2} />;
  return <ArrowUpDown size={11} strokeWidth={2} className="opacity-40" />;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  rowHref,
  sort,
  onSort,
  rowStyle,
  actions,
  className,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** The row's destination. The identity cell holds the real link. */
  rowHref?: (row: T) => string;
  sort?: SortState;
  onSort?: (key: string) => void;
  rowStyle?: (i: number) => React.CSSProperties | undefined;
  /** A control, not a column — no label, no sort, no mobile pair. */
  actions?: (row: T) => React.ReactNode;
  className?: string;
}) {
  const identityKey = columns.find((c) => c.mobile === "identity")?.key;

  return (
    <div className={cn("rounded-[12px] border border-border overflow-hidden bg-[var(--surface)]", className)}>
      <table className="w-full border-collapse text-left">
        <colgroup>
          {columns.map((c) => (
            <col
              key={c.key}
              style={
                c.width
                  ? { width: COL_WIDTH[c.width] }
                  : /* The identity column absorbs the slack, but stops: a name
                       stretched across 900px is not more readable. Surplus
                       beyond this goes to the spacer column below. */
                    { minWidth: "16rem", maxWidth: "32rem" }
              }
            />
          ))}
          {actions && <col style={{ width: "3rem" }} />}
          {/* Unnamed spacer — no header, no content. It takes whatever the
              container has beyond the columns' own needs, so a wide table
              reads as content on the left with room on the right. */}
          <col />
        </colgroup>
        <thead>
          <tr className="bg-[var(--surface-raised)] border-b border-border">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                aria-sort={
                  c.sortValue
                    ? sort?.key === c.key
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
                className="px-4 py-[10px] type-caption font-semibold text-muted-foreground uppercase tracking-wide"
              >
                {c.sortValue && onSort ? (
                  <button
                    onClick={() => onSort(c.key)}
                    /* `uppercase` repeated on the button: Tailwind's preflight
                       sets `button { text-transform: none }`, so a sortable
                       header rendered in sentence case next to its uppercase
                       siblings. */
                    className="flex items-center gap-1 uppercase hover:text-foreground transition-colors duration-100"
                  >
                    {c.label}
                    <SortIcon dir={sort?.key === c.key ? sort.dir : null} />
                  </button>
                ) : (
                  c.label
                )}
              </th>
            ))}
            {actions && (
              <th scope="col" className="px-4 py-[10px]">
                <span className="sr-only">Actions</span>
              </th>
            )}
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row)}
              style={rowStyle?.(i)}
              className={cn(
                "border-b border-border last:border-b-0 transition-colors duration-100",
                rowHref && "cursor-pointer hover:bg-[var(--surface-raised)]"
              )}
              /* No `role="button"` on a <tr> — that would break the table
                 semantics this rendering exists for. The click is a mouse
                 convenience; the identity cell's link is what a keyboard and a
                 screen reader use. */
              onClick={rowHref ? () => window.location.assign(rowHref(row)) : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 align-middle type-meta">
                  {c.key === identityKey && rowHref ? (
                    <Link
                      href={rowHref(row)}
                      className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.render(row)}
                    </Link>
                  ) : (
                    c.render(row)
                  )}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
                </td>
              )}
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Mobile: a list of records ───────────────────────────────────────────── */

export function DataCards<T>({
  rows,
  columns,
  rowKey,
  rowHref,
  rowStyle,
  actions,
  label,
  className,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string;
  rowStyle?: (i: number) => React.CSSProperties | undefined;
  actions?: (row: T) => React.ReactNode;
  /** Names the list for assistive tech — "People", "Modules". */
  label: string;
  className?: string;
}) {
  const identity = columns.find((c) => c.mobile === "identity")!;
  const pairs = columns.filter((c) => c.mobile === "pair");
  const trailing = columns.filter((c) => c.mobile === "trailing");
  const cell = (c: Column<T>, row: T) => (c.mobileRender ? c.mobileRender(row) : c.render(row));

  return (
    <ul
      aria-label={label}
      className={cn("rounded-[12px] border border-border overflow-hidden bg-[var(--surface)]", className)}
    >
      {rows.map((row, i) => (
        <li
          key={rowKey(row)}
          style={rowStyle?.(i)}
          className="border-b border-border last:border-b-0"
        >
          <div className="flex items-start gap-3 px-4 py-3">
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              {rowHref ? (
                <Link
                  href={rowHref(row)}
                  className="block min-w-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {cell(identity, row)}
                </Link>
              ) : (
                cell(identity, row)
              )}

              {/* Label-and-value pairs. A description list is what this is:
                  each label names the value under it, which is the thing the
                  "·"-joined meta line could not do. */}
              {/* A two-column grid, so every label starts at one x and every
                  value at another. Stacked flex rows put each pair at its own
                  indent, which read as a ragged list rather than a record. */}
              {pairs.length > 0 && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 min-w-0">
                  {pairs.map((c) => {
                    const value = cell(c, row);
                    if (value == null || value === false) return null;
                    return (
                      <div key={c.key} className="grid grid-cols-subgrid col-span-2 items-baseline min-w-0">
                        <dt className="type-caption text-muted-foreground">{c.label}</dt>
                        <dd className="type-caption font-medium text-foreground min-w-0 truncate">{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </div>

            {(trailing.length > 0 || actions) && (
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                {trailing.map((c) => {
                  const value = cell(c, row);
                  // `mobileRender` returning null is how a column opts out of
                  // the card — an em-dash badge at a card's edge is noise.
                  if (value == null || value === false) return null;
                  return <div key={c.key}>{value}</div>;
                })}
                {actions?.(row)}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
