"use client";

import Link from "next/link";
import { CheckCircle2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { showToast } from "@/components/ui/toast";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useFlags, resolveFlag, type FlagStatus } from "@/lib/flags-store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Open reads as caution (warning); resolved as positive (success). */
function FlagPill({ status }: { status: FlagStatus }) {
  const open = status === "open";
  return (
    <span
      className="inline-flex items-center px-2 py-[2px] rounded-[6px] text-[12px] leading-[16px] font-medium"
      style={
        open
          ? { background: "color-mix(in srgb, var(--warning) 14%, transparent)", color: "var(--warning)" }
          : { background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" }
      }
    >
      {open ? "Open" : "Resolved"}
    </span>
  );
}

export default function AdminFlaggedPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const flags = useFlags();

  // Open flags first, then newest first within each group.
  const sorted = [...flags].sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    return a.date > b.date ? -1 : 1;
  });

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Reports" }, { label: "Flagged responses" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Flagged responses</h1>
            <p className="text-[14px] leading-[20px] text-muted-foreground">Answers staff reported as wrong or incomplete. Review the content, update it if needed, then resolve.</p>
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-[12px] p-10 text-center bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              <p className="text-[14px] leading-[20px] text-muted-foreground">No flagged responses. Reports from the AI chat will appear here.</p>
            </div>
          ) : (
            sorted.map((f) => (
              <section key={f.id} className="rounded-[12px] p-4 sm:p-5 flex flex-col gap-3 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FlagPill status={f.status} />
                    <span className="text-[12px] leading-[16px] font-medium px-2 py-[2px] rounded-full border border-border text-muted-foreground">{f.reason}</span>
                  </div>
                  <span className="text-[12px] leading-[16px] text-muted-foreground">Flagged by {f.flaggedBy} · {formatDate(f.date)}</span>
                </div>

                <p className="text-[15px] leading-[24px] font-semibold text-foreground">“{f.question}”</p>
                <p className="text-[14px] leading-[22px] text-muted-foreground">{f.answer}</p>
                {f.note && <p className="text-[13px] leading-[20px] italic text-muted-foreground">Note: {f.note}</p>}

                {f.status === "open" ? (
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href="/admin/content"
                      className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] text-[13px] font-semibold border border-primary text-primary transition-opacity duration-100 hover:opacity-70"
                    >
                      <Pencil size={14} strokeWidth={1.5} /> Review content
                    </Link>
                    <button
                      onClick={() => { resolveFlag(f.id); showToast({ title: "Flag resolved" }); }}
                      className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] text-[13px] font-semibold bg-primary text-primary-foreground transition-opacity duration-100 hover:opacity-90"
                    >
                      <CheckCircle2 size={14} strokeWidth={1.5} /> Mark as resolved
                    </button>
                  </div>
                ) : (
                  <p className="text-[12px] leading-[16px] text-muted-foreground">Resolved by {f.resolvedBy} · {f.resolvedDate ? formatDate(f.resolvedDate) : ""}</p>
                )}
              </section>
            ))
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
