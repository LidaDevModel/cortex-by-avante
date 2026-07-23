"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Pencil, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/not-found-state";
import { BackLink } from "@/components/admin/back-link";
import { resolveBack } from "@/lib/admin-nav";
import { showToast } from "@/components/ui/toast";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useFlags, resolveFlag, type FlagStatus } from "@/lib/flags-store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function FlagPill({ status, pop = false }: { status: FlagStatus; pop?: boolean }) {
  const open = status === "open";
  const tone = open
    ? { background: "color-mix(in srgb, var(--warning) 14%, transparent)", color: "var(--warning)" }
    : { background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" };
  return (
    <span
      className="inline-flex items-center px-2 py-[2px] rounded-[6px] text-[12px] leading-[16px] font-medium"
      // A tasteful peak-end beat: the pill pops when the flag is just resolved.
      style={pop ? { ...tone, animation: "check-pop 280ms cubic-bezier(0.32,0.72,0,1) both" } : tone}
    >
      {open ? "Open" : "Resolved"}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="text-[14px] leading-[22px] text-foreground">{children}</div>
    </div>
  );
}

export default function AdminFlagDetailPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const back = resolveBack(useSearchParams().get("return"), { href: "/admin/reports/flagged", label: "Back to flagged responses" });
  const [justResolved, setJustResolved] = useState(false);
  const flag = useFlags().find((f) => f.id === id);

  if (!flag) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
        <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Flagged responses", href: "/admin/reports/flagged" }, { label: "Not found" }]} className={headerClassName} />
        <NotFoundState title="Flag not found" description="This flagged response may have been removed." actionLabel="Back to flagged responses" actionHref="/admin/reports/flagged" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Flagged responses", href: "/admin/reports/flagged" }, { label: "Response" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[720px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <BackLink href={back.href} label={back.label} />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Flagged response</h1>
              <FlagPill status={flag.status} pop={justResolved} />
            </div>
            <div className="flex items-center gap-2">
              <Button size="cta" variant="outline" onClick={() => router.push(flag.source ? `/admin/content/${flag.source.docId}?return=${encodeURIComponent(`/admin/reports/flagged/${flag.id}`)}` : "/admin/content")}>
                <Pencil size={16} strokeWidth={1.5} /> Review content
              </Button>
              {flag.status === "open" && (
                <Button size="cta" onClick={() => { resolveFlag(flag.id); setJustResolved(true); showToast({ title: "Flag resolved" }); }}>
                  <CheckCircle2 size={16} strokeWidth={1.5} /> Mark as resolved
                </Button>
              )}
            </div>
          </div>

          {/* The incident */}
          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-5 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <Field label="Question"><span className="font-medium">“{flag.question}”</span></Field>
            <Field label="Answer">{flag.answer}</Field>
            {flag.note && <Field label="Note from staff"><span className="italic text-muted-foreground">{flag.note}</span></Field>}
          </section>

          {/* Details */}
          <section className="rounded-[12px] p-4 sm:p-6 grid grid-cols-2 gap-5 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <Field label="Reason">{flag.reason}</Field>
            <Field label="Based on">{flag.source?.label ?? "Not grounded in a document"}</Field>
            <Field label="Flagged by">{flag.flaggedBy} · {formatDate(flag.date)}</Field>
            {flag.status === "resolved" && (
              <Field label="Resolved by">{flag.resolvedBy} · {flag.resolvedDate ? formatDate(flag.resolvedDate) : ""}</Field>
            )}
          </section>
        </div>
      </ScrollCanvas>
    </div>
  );
}
