"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flag, Mail, FileText,
  CheckCircle2, ArrowUpRight, Plus, type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { RadialStat } from "@/components/admin/radial-stat";
import { NewContentDialog } from "@/components/admin/NewContentDialog";
import { LockGate } from "@/components/admin/lock-gate";
import { useAdminUnlocked } from "@/hooks/use-admin-unlocked";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useEntranceOnce, useRowStagger } from "@/hooks/use-entrance";
import { useAdminUsers } from "@/lib/admin-store";
import { useLibrary } from "@/lib/content-store";
import { useModules } from "@/lib/training-store";
import { useFlags } from "@/lib/flags-store";
import { useActivity } from "@/lib/activity-log";
import { withReturn } from "@/lib/admin-nav";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminHomePage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const router = useRouter();
  // Stat numbers count up once per session on the first visit to Home.
  const animateStats = useEntranceOnce("admin-home-stats");
  // Row cascade — shared with every list table, one key per Home table.
  const attnRow = useRowStagger("home-attention");
  const activityRow = useRowStagger("home-activity");
  const users = useAdminUsers();
  const flags = useFlags();
  const activity = useActivity();
  const [newContentOpen, setNewContentOpen] = useState(false);
  const unlocked = useAdminUnlocked();

  // Date meta, set after mount (client clock ≠ prerender clock).
  const [dateMeta, setDateMeta] = useState<string | null>(null);
  useEffect(() => {
    setDateMeta(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const lib = useLibrary();
  const modules = useModules();

  /* ─── Team pulse ─── */
  const active = users.filter((u) => u.status === "active").length;
  const ready = users.filter((u) => u.status === "active" && u.shiftReady).length;
  const requiredCerts = users.reduce((s, u) => s + u.certs.filter((c) => c.required).length, 0);
  const optionalCerts = users.reduce((s, u) => s + u.certs.filter((c) => !c.required).length, 0);

  /* ─── Needs attention ─── */
  const openFlags = flags.filter((f) => f.status === "open").length;
  const resolvedFlags = flags.filter((f) => f.status === "resolved").length;
  const invited = users.filter((u) => u.status === "invited").length;
  const allDocs = [...lib.folders.flatMap((f) => f.documents), ...lib.topLevel];
  const filesPublished = allDocs.filter((d) => d.published !== false).length;
  const filesDraft = allDocs.filter((d) => d.published === false).length;
  const modulesPublished = modules.filter((m) => m.published !== false).length;
  const modulesDraft = modules.filter((m) => m.published === false).length;
  const drafts = filesDraft + modulesDraft;

  const attention: { icon: LucideIcon; text: string; href: string }[] = [
    ...(openFlags > 0 ? [{ icon: Flag, text: `${openFlags} flagged response${openFlags === 1 ? "" : "s"} to review`, href: "/admin/reports/flagged" }] : []),
    ...(invited > 0 ? [{ icon: Mail, text: `${invited} invite${invited === 1 ? "" : "s"} waiting for activation`, href: "/admin/people" }] : []),
    ...(drafts > 0 ? [{ icon: FileText, text: `${drafts} draft${drafts === 1 ? "" : "s"} not published yet`, href: "/admin/content" }] : []),
  ];

  const recentActivity = [...activity].sort((a, b) => (a.ts > b.ts ? -1 : 1)).slice(0, 5);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Home" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          {/* Title + the actions admins repeat daily */}
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Home</h1>
              {dateMeta && <p className="text-[13px] leading-[18px] text-muted-foreground">{dateMeta}</p>}
            </div>
          </div>

          {/* Needs attention — only items with an action, each linking to its fix.
              Carries the readiness card's glow: it is this screen's hero. */}
          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)", boxShadow: "var(--card-glow-shadow)" }}>
            <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Needs attention</h2>
            {attention.length === 0 ? (
              <div className="flex items-center gap-2.5 py-2">
                <CheckCircle2 size={16} strokeWidth={1.5} style={{ color: "var(--success)" }} />
                <span className="text-[14px] leading-[20px] text-muted-foreground">All clear — nothing needs your review.</span>
              </div>
            ) : (
              <Table>
                <TableBody>
                  {attention.map((item, i) => (
                    <TableRow key={item.href} onClick={() => router.push(item.href)} style={attnRow(i)}>
                      <TableCell className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
                          <span className="text-[14px] leading-[20px] font-medium text-foreground truncate">{item.text}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-8 flex items-center justify-end">
                        <ArrowUpRight size={16} strokeWidth={1.5} className="text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          {/* Team pulse — point-in-time snapshot of the workforce. The readiness
              donut merges active + shift-ready; certifications held sits beside it. */}
          <div className="flex gap-6 flex-wrap">
            <RadialStat
              title="Team readiness"
              href="/admin/people"
              total={users.length}
              centerLabel="staff"
              animate={animateStats}
              series={[
                { label: "Active", value: active, color: "var(--match-pair-2-border)" },
                { label: "Shift-ready", value: ready, color: "var(--success)" },
              ]}
            />
            <RadialStat
              title="Certifications held"
              href="/admin/people"
              total={requiredCerts + optionalCerts}
              centerLabel="certs"
              animate={animateStats}
              series={[
                { label: "Required", value: requiredCerts, color: "var(--success)" },
                { label: "Optional", value: optionalCerts, color: "var(--match-pair-2-border)" },
              ]}
            />
            <RadialStat
              title="Flagged responses"
              href="/admin/reports/flagged"
              total={openFlags + resolvedFlags}
              centerLabel="flags"
              animate={animateStats}
              series={[
                { label: "Open", value: openFlags, color: "var(--match-pair-2-border)" },
                { label: "Resolved", value: resolvedFlags, color: "var(--success)" },
              ]}
            />
          </div>

          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Content</h2>
              <LockGate locked={!unlocked}>
                <Button size="cta" variant="outline" onClick={() => setNewContentOpen(true)}>
                  <Plus size={16} strokeWidth={1.5} /> Add content
                </Button>
              </LockGate>
            </div>
            {/* One small table per content type — each headed by a link to its
                list, with the published/draft split below. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { label: "Files", published: filesPublished, draft: filesDraft, href: "/admin/content" },
                { label: "Modules", published: modulesPublished, draft: modulesDraft, href: "/admin/content/training" },
              ]).map((t) => (
                <div key={t.label} className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push(t.href)}
                    className="group flex items-center justify-between gap-2 text-left cursor-pointer"
                  >
                    <span className="text-[14px] leading-[20px] font-semibold text-foreground">{t.label}</span>
                    <ArrowUpRight size={16} strokeWidth={1.5} className="text-muted-foreground transition-colors duration-100 group-hover:text-foreground" />
                  </button>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="flex-1 min-w-0 text-muted-foreground">Published</TableCell>
                        <TableCell className="w-16 text-right tabular-nums text-foreground">{t.published}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex-1 min-w-0 text-muted-foreground">Draft</TableCell>
                        <TableCell className="w-16 text-right tabular-nums text-foreground">{t.draft}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </section>

          {/* Recent activity — the last five admin actions, straight from the log. */}
          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Recent activity</h2>
              <Link href="/admin/reports/activity" className="text-[13px] leading-[20px] font-medium text-primary hover:opacity-70 transition-opacity duration-100">
                View all
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-[14px] leading-[20px] text-muted-foreground">No activity data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableHead className="flex-1">Action</TableHead>
                  <TableHead className="w-[140px]">Admin</TableHead>
                  <TableHead className="w-[120px]">When</TableHead>
                  <TableHead className="w-8"><span className="sr-only">Open</span></TableHead>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((e, i) => (
                    <TableRow key={e.id} onClick={e.href ? () => router.push(withReturn(e.href!, "/admin")) : undefined} style={activityRow(i)}>
                      <TableCell className="flex-1 min-w-0"><span className="block truncate">{e.action}</span></TableCell>
                      <TableCell className="w-[140px] min-w-0 text-muted-foreground"><span className="block truncate">{e.actor}</span></TableCell>
                      <TableCell className="w-[120px] text-muted-foreground tabular-nums">{formatWhen(e.ts)}</TableCell>
                      <TableCell className="w-8 flex items-center justify-end">
                        {e.href && <ArrowUpRight size={16} strokeWidth={1.5} className="text-muted-foreground" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      </ScrollCanvas>

      <NewContentDialog
        open={newContentOpen}
        onOpenChange={setNewContentOpen}
        onChoose={(kind) => router.push(kind === "file" ? "/admin/content?new=1" : "/admin/content/training?new=1")}
      />
    </div>
  );
}
