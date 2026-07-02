import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const navBtn = "h-8 w-8 flex items-center justify-center rounded-[6px] border border-border text-[13px] leading-[20px] transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-raised)]";

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-[12px] leading-[16px] text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={navBtn}
          style={{ color: "var(--muted-foreground)" }}
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="h-8 w-8 flex items-center justify-center text-[13px] text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className="h-8 w-8 flex items-center justify-center rounded-[6px] border text-[13px] leading-[20px] font-medium transition-colors duration-100"
              style={
                p === page
                  ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)", background: "transparent" }
              }
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={navBtn}
          style={{ color: "var(--muted-foreground)" }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
