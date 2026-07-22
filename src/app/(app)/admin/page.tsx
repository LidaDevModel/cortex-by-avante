"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCheck, ShieldCheck, Award, Flag, Mail, FileText,
  CheckCircle2, ChevronRight, UserPlus, FilePlus2, BookOpen, type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useAdminUsers } from "@/lib/admin-store";
import { useLibrary } from "@/lib/content-store";
import { useModules } from "@/lib/training-store";
import { useFlags } from "@/lib/flags-store";
import { useActivity } from "@/lib/activity-log";

function StatCard({ icon: Icon, value, label }: { icon: LucideIcon; value: string | number; label: string }) {
  return (
    <div className="flex-1 min-w-[150px] rounded-[12px] p-4 sm:p-5 flex flex-col gap-2 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-1.5">
        <Icon size={15} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
        <span className="text-[13px] leading-[18px] text-muted-foreground">{label}</span>
      </div>
      <span className="text-[26px] leading-[32px] font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminHomePage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const router = useRouter();
  const users = useAdminUsers();
  const flags = useFlags();
  const activity = useActivity();

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
  const certs = users.reduce((sum, u) => sum + u.certifications, 0);

  /* ─── Needs attention ─── */
  const openFlags = flags.filter((f) => f.status === "open").length;
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
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="cta" variant="outline" asChild>
                <Link href="/admin/people?invite=1"><UserPlus size={16} strokeWidth={1.5} /> Invite user</Link>
              </Button>
              <Button size="cta" variant="outline" asChild>
                <Link href="/admin/content?new=1"><FilePlus2 size={16} strokeWidth={1.5} /> New document</Link>
              </Button>
              <Button size="cta" variant="outline" asChild>
                <Link href="/admin/content/training?new=1"><BookOpen size={16} strokeWidth={1.5} /> New module</Link>
              </Button>
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
                  {attention.map((item) => (
                    <TableRow key={item.href} onClick={() => router.push(item.href)}>
                      <TableCell className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
                          <span className="text-[14px] leading-[20px] font-medium text-foreground truncate">{item.text}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-8">
                        <ChevronRight size={15} strokeWidth={1.5} className="text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          {/* Team pulse — point-in-time snapshot of the workforce. */}
          <div className="flex gap-3 flex-wrap">
            <StatCard icon={UserCheck} value={`${active}/${users.length}`} label="Active staff" />
            <StatCard icon={ShieldCheck} value={`${ready}/${active}`} label="Shift-ready staff" />
            <StatCard icon={Award} value={certs} label="Certifications held" />
          </div>

          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Content</h2>
              <Link href="/admin/content" className="text-[13px] leading-[20px] font-medium text-primary hover:opacity-70 transition-opacity duration-100">
                Manage content
              </Link>
            </div>
            <Table>
              <TableHeader>
                <TableHead className="flex-1">Type</TableHead>
                <TableHead className="w-[120px] text-right">Published</TableHead>
                <TableHead className="w-[120px] text-right">Draft</TableHead>
              </TableHeader>
              <TableBody>
                {([
                  { label: "Files", published: filesPublished, draft: filesDraft },
                  { label: "Modules", published: modulesPublished, draft: modulesDraft },
                ]).map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="flex-1 min-w-0 font-medium">{row.label}</TableCell>
                    <TableCell className="w-[120px] text-right tabular-nums text-foreground">{row.published}</TableCell>
                    <TableCell className="w-[120px] text-right tabular-nums text-foreground">{row.draft}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          {/* Recent activity — the last five admin actions, straight from the log. */}
          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Recent activity</h2>
              <Link href="/admin/reports/activity" className="text-[13px] leading-[20px] font-medium text-primary hover:opacity-70 transition-opacity duration-100">
                View activity log
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
                </TableHeader>
                <TableBody>
                  {recentActivity.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="flex-1 min-w-0"><span className="block truncate">{e.action}</span></TableCell>
                      <TableCell className="w-[140px] min-w-0 text-muted-foreground"><span className="block truncate">{e.actor}</span></TableCell>
                      <TableCell className="w-[120px] text-muted-foreground tabular-nums">{formatWhen(e.ts)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      </ScrollCanvas>
    </div>
  );
}
