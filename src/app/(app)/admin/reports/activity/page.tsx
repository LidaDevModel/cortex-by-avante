"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useActivity } from "@/lib/activity-log";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminActivityPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const entries = [...useActivity()].sort((a, b) => (a.ts > b.ts ? -1 : 1));

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Reports" }, { label: "Activity log" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Activity log</h1>
            <p className="text-[14px] leading-[20px] text-muted-foreground">Who did what across content, people, and flagged responses.</p>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-[12px] p-10 text-center bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              <p className="text-[14px] leading-[20px] text-muted-foreground">No activity data yet.</p>
            </div>
          ) : (
            <div className="rounded-[12px] overflow-hidden bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              {entries.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-4 px-4 sm:px-5 py-3 border-b border-border last:border-b-0">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[14px] leading-[20px] text-foreground">{e.action}</span>
                    <span className="text-[12px] leading-[16px] text-muted-foreground">{e.actor}</span>
                  </div>
                  <span className="text-[12px] leading-[16px] text-muted-foreground shrink-0 tabular-nums pt-0.5">{formatWhen(e.ts)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
