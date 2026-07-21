"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useAdminUsers } from "@/lib/admin-store";
import { useLibrary } from "@/lib/content-store";
import { useModules } from "@/lib/training-store";
import { useFlags } from "@/lib/flags-store";
import { ROLE_LABEL } from "@/lib/user-mock";
import { PublishBadge } from "@/components/admin/publish-badge";

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 min-w-[140px] rounded-[12px] p-4 sm:p-5 flex flex-col gap-1 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
      <span className="text-[28px] leading-[34px] font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-[13px] leading-[18px] text-muted-foreground">{label}</span>
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminOverviewPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const users = useAdminUsers();

  // Date meta, set after mount (client clock ≠ prerender clock).
  const [dateMeta, setDateMeta] = useState<string | null>(null);
  useEffect(() => {
    setDateMeta(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const lib = useLibrary();
  const modules = useModules();
  const openFlags = useFlags().filter((f) => f.status === "open").length;

  const active = users.filter((u) => u.status === "active").length;
  const invited = users.filter((u) => u.status === "invited").length;
  const certs = users.reduce((sum, u) => sum + u.certifications, 0);

  // Content publish state across library documents + training modules.
  const allDocs = [...lib.folders.flatMap((f) => f.documents), ...lib.topLevel];
  const publishedCount = allDocs.filter((d) => d.published !== false).length + modules.filter((m) => m.published !== false).length;
  const draftCount = allDocs.filter((d) => d.published === false).length + modules.filter((m) => m.published === false).length;

  const recent = [...users]
    .filter((u) => u.lastActive)
    .sort((a, b) => (b.lastActive! > a.lastActive! ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Overview" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Overview</h1>
            {dateMeta && <p className="text-[13px] leading-[18px] text-muted-foreground">{dateMeta}</p>}
          </div>

          <div className="flex gap-3 flex-wrap">
            <StatCard value={users.length} label="Total staff" />
            <StatCard value={active} label="Active" />
            <StatCard value={invited} label="Pending invites" />
            <StatCard value={certs} label="Certifications held" />
            <StatCard value={openFlags} label="Open flags" />
          </div>

          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Content</h2>
              <Link href="/admin/content" className="text-[13px] leading-[20px] font-medium text-primary hover:opacity-70 transition-opacity duration-100">
                Manage content
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <PublishBadge published />
                <span className="text-[16px] leading-[22px] font-semibold tabular-nums text-foreground">{publishedCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <PublishBadge published={false} />
                <span className="text-[16px] leading-[22px] font-semibold tabular-nums text-foreground">{draftCount}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Recent activity</h2>
              <Link href="/admin/people" className="text-[13px] leading-[20px] font-medium text-primary hover:opacity-70 transition-opacity duration-100">
                View all people
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-[14px] leading-[20px] text-muted-foreground">No activity data yet.</p>
            ) : (
              <div className="flex flex-col">
                {recent.map((u) => (
                  <Link
                    key={u.id}
                    href={`/admin/people/${u.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-b-0 hover:opacity-80 transition-opacity duration-100"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] leading-[18px] font-medium text-foreground truncate">{u.fullName}</span>
                      <span className="text-[12px] leading-[16px] text-muted-foreground truncate">{ROLE_LABEL[u.role]}</span>
                    </div>
                    <span className="text-[12px] leading-[16px] text-muted-foreground shrink-0 tabular-nums">{formatDate(u.lastActive)}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </ScrollCanvas>
    </div>
  );
}
