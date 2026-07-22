"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Users, UserCheck, Mail, Award, Flag, ChevronDown, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useAdminUsers } from "@/lib/admin-store";
import { useLibrary } from "@/lib/content-store";
import { useModules } from "@/lib/training-store";
import { useFlags } from "@/lib/flags-store";
import { useActivity } from "@/lib/activity-log";

/** Direction of a stat vs a period ago. `tone` sets the colour semantics:
 *  positive = up is good; negative = up is bad; neutral = no good/bad. */
function TrendBadge({ delta, tone }: { delta: number; tone: "positive" | "negative" | "neutral" }) {
  if (delta === 0) {
    return <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">—</span>;
  }
  const up = delta > 0;
  const good = tone === "neutral" ? null : tone === "positive" ? up : !up;
  const color = good === null ? "var(--muted-foreground)" : good ? "var(--success)" : "var(--destructive)";
  const Arrow = up ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-1 text-[13px] leading-[18px] font-medium tabular-nums" style={{ color }}>
      <Arrow size={15} strokeWidth={2} />
      {Math.abs(delta)}
    </span>
  );
}

function StatCard({ icon: Icon, value, label, delta, tone }: { icon: LucideIcon; value: string | number; label: string; delta?: number; tone?: "positive" | "negative" | "neutral" }) {
  return (
    <div className="flex-1 min-w-[150px] rounded-[12px] p-4 sm:p-5 flex flex-col gap-2 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-1.5">
        <Icon size={15} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
        <span className="text-[13px] leading-[18px] text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[26px] leading-[32px] font-bold tabular-nums text-foreground">{value}</span>
        {delta !== undefined && <TrendBadge delta={delta} tone={tone ?? "neutral"} />}
      </div>
    </div>
  );
}

const PERIOD_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const at = (iso?: string) => (iso ? new Date(iso).getTime() : 0);

export default function AdminHomePage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const users = useAdminUsers();
  const flags = useFlags();
  const activity = useActivity();

  // Date meta + "now", set after mount (client clock ≠ prerender clock).
  const [dateMeta, setDateMeta] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [period, setPeriod] = useState("30");
  useEffect(() => {
    const d = new Date();
    setDateMeta(d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
    setNow(d.getTime());
  }, []);

  const lib = useLibrary();
  const modules = useModules();

  const active = users.filter((u) => u.status === "active").length;
  const invited = users.filter((u) => u.status === "invited").length;
  const certs = users.reduce((sum, u) => sum + u.certifications, 0);
  const openFlags = flags.filter((f) => f.status === "open").length;

  // Content publish state, split by kind — files (library documents) and modules.
  const allDocs = [...lib.folders.flatMap((f) => f.documents), ...lib.topLevel];
  const filesPublished = allDocs.filter((d) => d.published !== false).length;
  const filesDraft = allDocs.filter((d) => d.published === false).length;
  const modulesPublished = modules.filter((m) => m.published !== false).length;
  const modulesDraft = modules.filter((m) => m.published === false).length;

  // Deltas = current value minus the value as of `cutoff` (a period ago), from
  // dated data. Certifications carry no history in the mock, so no badge there.
  const cutoff = now === null ? 0 : now - Number(period) * 86_400_000;
  const known = now !== null;
  const staffThen = users.filter((u) => at(u.memberSince) <= cutoff).length;
  const activeThen = users.filter((u) => u.status === "active" && at(u.memberSince) <= cutoff).length;
  const invitedThen = users.filter((u) => u.status === "invited" && at(u.memberSince) <= cutoff).length;
  const openFlagsThen = flags.filter((f) => at(f.date) <= cutoff && (f.status === "open" || at(f.resolvedDate) > cutoff)).length;

  const recentActivity = [...activity].sort((a, b) => (a.ts > b.ts ? -1 : 1)).slice(0, 5);

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Home" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Home</h1>
            {dateMeta && <p className="text-[13px] leading-[18px] text-muted-foreground">{dateMeta}</p>}
          </div>

          {/* Comparison window for the stat-card trends — link-style dropdown. */}
          <div className="flex justify-end -mb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1 text-[13px] leading-[20px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100">
                  {PERIOD_OPTIONS.find((o) => o.value === period)?.label}
                  <ChevronDown size={14} strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                {PERIOD_OPTIONS.map((o) => (
                  <DropdownMenuItem key={o.value} onSelect={() => setPeriod(o.value)}>{o.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-3 flex-wrap">
            <StatCard icon={Users} value={users.length} label="Total staff" delta={known ? users.length - staffThen : undefined} tone="positive" />
            <StatCard icon={UserCheck} value={active} label="Active" delta={known ? active - activeThen : undefined} tone="positive" />
            <StatCard icon={Mail} value={invited} label="Pending invites" delta={known ? invited - invitedThen : undefined} tone="neutral" />
            <StatCard icon={Award} value={certs} label="Certifications held" />
            <StatCard icon={Flag} value={openFlags} label="Open flags" delta={known ? openFlags - openFlagsThen : undefined} tone="negative" />
          </div>

          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-4 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Content</h2>
              <Link href="/admin/content" className="text-[13px] leading-[20px] font-medium text-primary hover:opacity-70 transition-opacity duration-100">
                Manage content
              </Link>
            </div>
            <Table className="!border-0 !bg-transparent !rounded-none">
              <TableHeader className="!px-0 !bg-transparent">
                <TableHead className="flex-1">Type</TableHead>
                <TableHead className="w-[120px] text-right">Published</TableHead>
                <TableHead className="w-[120px] text-right">Draft</TableHead>
              </TableHeader>
              <TableBody>
                {([
                  { label: "Files", published: filesPublished, draft: filesDraft },
                  { label: "Modules", published: modulesPublished, draft: modulesDraft },
                ]).map((row, i, arr) => (
                  <TableRow key={row.label} className={`!px-0 ${i === arr.length - 1 ? "!border-b-0" : ""}`}>
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
              <Table className="!border-0 !bg-transparent !rounded-none">
                <TableHeader className="!px-0 !bg-transparent">
                  <TableHead className="flex-1">Action</TableHead>
                  <TableHead className="w-[140px]">Admin</TableHead>
                  <TableHead className="w-[120px]">When</TableHead>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((e, i, arr) => (
                    <TableRow key={e.id} className={`!px-0 ${i === arr.length - 1 ? "!border-b-0" : ""}`}>
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
