import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc" | null;

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-[12px] border border-border overflow-hidden bg-[var(--surface)]", className)}>
      {children}
    </div>
  );
}

export function TableHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-[10px] bg-[var(--surface-raised)] border-b border-border", className)}>
      {children}
    </div>
  );
}

export function TableHead({
  className,
  style,
  children,
  sortDir,
  onSort,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  sortDir?: SortDir;
  onSort?: () => void;
}) {
  if (onSort) {
    return (
      <button
        onClick={onSort}
        style={style}
        className={cn(
          "flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors duration-100",
          className
        )}
      >
        {children}
        {sortDir === "asc" ? (
          <ArrowUp size={11} strokeWidth={2} />
        ) : sortDir === "desc" ? (
          <ArrowDown size={11} strokeWidth={2} />
        ) : (
          <ArrowUpDown size={11} strokeWidth={2} className="opacity-40" />
        )}
      </button>
    );
  }
  return (
    <span style={style} className={cn("text-[11px] font-semibold text-muted-foreground uppercase tracking-wide", className)}>
      {children}
    </span>
  );
}

export function TableBody({ className, children }: { className?: string; children: React.ReactNode }) {
  // Drop the last row's bottom border so it doesn't double up with the Table
  // container's own bottom border. Targets the last direct child, so a wrapped
  // row (e.g. an expandable section followed by a footer) keeps its divider.
  return <div className={cn("[&>*:last-child]:border-b-0", className)}>{children}</div>;
}

export function TableRow({
  className,
  onClick,
  style,
  children,
}: {
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        // min-h matches a row carrying a 32px actions button (10px padding each
        // side) so tables without one don't render shorter rows.
        "flex items-center gap-2 px-4 py-[10px] min-h-[52px] border-b border-border transition-colors duration-100",
        onClick && "cursor-pointer hover:bg-[color-mix(in_srgb,var(--surface-raised)_60%,transparent)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TableCell({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <span className={cn("text-[14px] text-foreground", className)} style={style}>
      {children}
    </span>
  );
}

/**
 * One muted meta line inside a `TableCard` — the collapsed row's secondary text
 * (e.g. "Wrong info · David · 15 Jul"). Truncates so it never wraps the card.
 * Pass more than one for a two-line meta block (the People card stacks email
 * over role · last active).
 */
export function TableCardMeta({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("block text-[12px] leading-[16px] font-[500] text-muted-foreground truncate", className)}>
      {children}
    </span>
  );
}

/**
 * The collapsed form of a table row below `md`. Fixed-width columns don't shrink
 * gracefully on a phone — they squish, wrap, and truncate — so every table pairs
 * a full-column `<Table className="hidden md:block">` with a `<Table
 * className="md:hidden">` of these cards. A card stacks a leading icon/avatar, a
 * primary title over a muted meta line (`TableCardMeta`), and a trailing slot
 * (status badge, score, or an actions menu). The whole card is the tap target,
 * mirroring the desktop row's click.
 */
export function TableCard({
  onClick,
  style,
  className,
  leading,
  title,
  meta,
  trailing,
}: {
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  leading?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <TableRow onClick={onClick} style={style} className={cn("gap-3 py-3 items-start", className)}>
      {leading}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-[14px] leading-[20px] font-medium text-foreground truncate">{title}</span>
        {meta}
      </div>
      {trailing != null && <div className="shrink-0 flex items-start gap-2">{trailing}</div>}
    </TableRow>
  );
}

export function TableFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-[13px] bg-[var(--surface-raised)]", className)}>
      {children}
    </div>
  );
}
