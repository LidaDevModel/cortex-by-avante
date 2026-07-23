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
  return <div className={cn("", className)}>{children}</div>;
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

export function TableFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-[13px] bg-[var(--surface-raised)]", className)}>
      {children}
    </div>
  );
}
