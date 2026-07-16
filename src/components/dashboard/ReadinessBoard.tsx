"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ModuleIcon } from "@/components/training/ModuleIcon";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";
import {
  type Module,
  type ModuleCategory,
  type RequirementState,
  getRequirementState,
} from "@/lib/training-mock";

// Action-priority order (approved): quickest win first, certified next, then
// what's still incomplete. Lower = higher up the board.
const STATE_ORDER: Record<RequirementState, number> = {
  "ready-to-certify": 0,
  certified: 1,
  "in-progress": 2,
  "not-started": 3,
};

/** The single most-actionable required module — gets the emphasized primary
    action (von Restorff + goal gradient). Prefers a one-click certification,
    then the closest-to-done in-progress module, then the first not-started. */
function pickPrimary(modules: Module[]): string | null {
  const ready = modules.filter((m) => getRequirementState(m) === "ready-to-certify");
  if (ready.length) return ready[0].id;
  const inProgress = modules
    .filter((m) => getRequirementState(m) === "in-progress")
    .sort((a, b) => b.progress - a.progress);
  if (inProgress.length) return inProgress[0].id;
  const notStarted = modules.filter((m) => getRequirementState(m) === "not-started");
  if (notStarted.length) return notStarted[0].id;
  return null;
}

function Tile({ state, category, delayMs = 0 }: { state: RequirementState; category: ModuleCategory; delayMs?: number }) {
  // Certified keeps the status check tile (a done-glyph, not a letter avatar);
  // every other row shows its real module illustration.
  if (state === "certified") {
    return (
      <span
        className="flex items-center justify-center w-10 h-10 rounded-[10px] shrink-0"
        // Pops in to coincide with its segment filling — the board "settles in".
        style={{ background: "var(--primary)", animation: `check-pop 250ms cubic-bezier(0.32,0.72,0,1) ${delayMs}ms both` }}
      >
        <Check size={18} strokeWidth={2.5} style={{ color: "var(--primary-foreground)" }} />
      </span>
    );
  }
  return <ModuleIcon category={category} size={40} />;
}

function RequirementRow({ module: m, isPrimary, index }: { module: Module; isPrimary: boolean; index: number }) {
  const state = getRequirementState(m);
  const detailHref = `/training/modules/${m.id}`;
  const examHref = `/training/modules/${m.id}/exam`;

  const highlight = isPrimary && state !== "certified";
  // In-progress and not-started rows are whole-surface links to the module;
  // certified rows are whole-surface links to the certification detail page
  // (Home → readiness board entry point). Both get the Quick-practice hover
  // (lift + shadow in light; background step in dark). The ready-to-certify row
  // keeps its own "Get certified" button, so it is not a stretched link.
  const clickable = state === "in-progress" || state === "not-started";
  const navigates = clickable || state === "certified";
  const rowHref =
    state === "certified"
      ? `/profile/certifications/${m.id}?from=${encodeURIComponent("/dashboard")}`
      : detailHref;

  return (
    <li
      // Default rows separate by tone, not outline: one step ABOVE the board in
      // both modes (light: surface on surface-raised; dark: the lighter hover
      // token — dark surfaces elevate by lightness, so stepping down would read
      // as recessed wells while every other dashboard chip reads raised).
      className={cn(
        "relative overflow-hidden flex flex-wrap items-center gap-3 rounded-[10px] p-3",
        navigates
          ? "group cursor-pointer transition-[translate,scale,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] dark:hover:shadow-none dark:hover:bg-surface-chip-hover"
          : "transition-colors duration-150",
        !highlight && "bg-surface-lifted"
      )}
      style={
        highlight
          ? {
              background: "color-mix(in srgb, var(--primary) 8%, transparent)",
              border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
            }
          : state === "certified"
          ? {
              // Done-tint layered OVER the lifted base (backgroundImage sits on
              // the class bg-color) so certified rows share the chips' luminance.
              backgroundImage:
                "linear-gradient(color-mix(in srgb, var(--primary) 6%, transparent), color-mix(in srgb, var(--primary) 6%, transparent))",
              border: "1px solid transparent",
            }
          : { border: "1px solid transparent" }
      }
    >
      {/* Stretched link — makes the whole row clickable. In-progress/not-started
          go to the module; certified goes to the certification detail page. The
          ready-to-certify row is excluded (it owns a "Get certified" button, so
          a stretched link would nest interactives). */}
      {navigates && (
        <Link
          href={rowHref}
          aria-label={
            state === "certified"
              ? `View ${m.title} certification`
              : `${state === "in-progress" ? "Continue" : "Start"} ${m.title}`
          }
          className="absolute inset-0 z-20 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      )}

      <Tile state={state} category={m.category} delayMs={index * 80} />

      <div className="relative z-10 flex flex-col gap-1 min-w-0 flex-1">
        <span
          className="text-[14px] leading-[20px] font-semibold truncate"
          style={{ color: "var(--foreground)" }}
        >
          {m.title}
        </span>

        {state === "ready-to-certify" && (
          <span className="text-[12px] leading-[16px] font-medium">
            <span style={{ color: "var(--primary)" }}>Completed</span>
            <span className="text-muted-foreground"> · Not yet certified</span>
          </span>
        )}
        {state === "certified" && (
          <span className="text-[12px] leading-[16px] font-medium" style={{ color: "var(--primary)" }}>
            Completed · Certified
          </span>
        )}
        {state === "in-progress" && (
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex-1 max-w-[180px]">
              <ProgressBar value={m.progress} />
            </div>
            <span className="text-[12px] leading-[16px] text-muted-foreground tabular-nums shrink-0">
              {m.progress}%
            </span>
          </div>
        )}
        {state === "not-started" && (
          <span className="text-[12px] leading-[16px] text-muted-foreground">
            Not yet started · {m.chapters} chapters
          </span>
        )}
      </div>

      {/* Right-side action. Only the quickest win (ready-to-certify) keeps a
          real button; every other row uses the quiet ghost-arrow affordance,
          matching the Quick practice cards. Certified rows show their score. */}
      {state === "certified" ? (
        <span
          className="relative z-10 text-[15px] leading-[20px] font-bold tabular-nums shrink-0"
          style={{ color: "var(--primary)" }}
        >
          {m.certification!.score}%
        </span>
      ) : state === "ready-to-certify" ? (
        <Link
          href={examHref}
          className="relative z-10 w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 h-[36px] px-4 rounded-[8px] text-[13px] font-semibold transition-opacity duration-100 hover:opacity-90"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          Get certified
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      ) : (
        <span
          aria-hidden
          className="relative z-10 shrink-0 flex items-center justify-center w-10 h-10 text-muted-foreground transition-colors duration-150 group-hover:text-foreground"
        >
          <ArrowRight
            size={18}
            strokeWidth={1.5}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </span>
      )}
    </li>
  );
}

/** Ring progress — the certified share as a percentage. The arc sweeps from 0
    on mount; the centre reads the same percentage. Tokens only. */
function ProgressDonut({ value, label, ariaLabel }: { value: number; label: string; ariaLabel: string }) {
  const size = 76;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, Math.max(0, value / 100)));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={ariaLabel}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 400ms ease-out" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold tabular-nums text-foreground">
        {label}
      </span>
    </div>
  );
}

/**
 * Shift-readiness board — the dashboard hero in State A (not cleared).
 * Readiness tracks *certifications earned* across the role's required modules,
 * in any order. Each row shows its two-stage requirement state, and exactly one
 * row carries the emphasized primary action (the quickest win where one exists).
 */
export function ReadinessBoard({
  requiredModules,
  role,
}: {
  requiredModules: Module[];
  role: string;
}) {
  const certifiedCount = requiredModules.filter(
    (m) => getRequirementState(m) === "certified"
  ).length;
  const total = requiredModules.length;
  const remaining = total - certifiedCount;
  const primaryId = pickPrimary(requiredModules);

  const pct = total ? Math.round((certifiedCount / total) * 100) : 0;
  const shownPct = useCountUp(pct);
  const [segmentsLive, setSegmentsLive] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setSegmentsLive(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const ordered = [...requiredModules].sort(
    (a, b) => STATE_ORDER[getRequirementState(a)] - STATE_ORDER[getRequirementState(b)]
  );
  // Actionable rows stay visible; certified (done) rows collapse behind an
  // expander so the board leads with what's left to do.
  const activeRows = ordered.filter((m) => getRequirementState(m) !== "certified");
  const certifiedRows = ordered.filter((m) => getRequirementState(m) === "certified");

  return (
    <section
      className="rounded-[12px] p-6 flex flex-col gap-5"
      // Signature ambient glow shadow (light mode; token resolves to none in dark)
      // marks this as THE hero card without adding chrome.
      style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", boxShadow: "var(--card-glow-shadow)" }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">
            Required for {role}
          </h2>
          <span
            className="shrink-0 text-[12px] leading-[16px] font-medium px-2.5 py-1 rounded-full"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            Any order
          </span>
        </div>

        {/* Ring + progress summary — the ring reads the certified percentage;
            the count line keeps the exact "N certified · M to go". */}
        <div className="flex items-center gap-4">
          <ProgressDonut
            value={segmentsLive ? pct : 0}
            label={`${shownPct}%`}
            ariaLabel={`${certifiedCount} of ${total} required certifications complete`}
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-[13px] leading-[18px] text-muted-foreground tabular-nums">
              {certifiedCount} certified · {remaining} to go
            </p>
            <h3 className="text-[18px] leading-[24px] font-semibold text-foreground">
              Shift readiness
            </h3>
            <p className="text-[13px] leading-[18px] text-muted-foreground">
              Earn every required certification to be cleared for duty.
            </p>
          </div>
        </div>
      </div>

      {/* Requirement rows */}
      <div className="flex flex-col gap-2">
        {/* Always visible: what's left to do. Two columns on desktop (auto rows),
            single column on mobile. The row UI itself is unchanged. */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {activeRows.map((m, i) => (
            <RequirementRow key={m.id} module={m} index={i} isPrimary={m.id === primaryId} />
          ))}
        </ul>

        {/* Done: certified rows, collapsed by default behind an expander */}
        {certifiedRows.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-1.5 w-full h-11 px-3 rounded-[8px] text-muted-foreground transition-colors duration-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <span className="text-[13px] leading-[18px] font-medium">
                  {certifiedRows.length} certified
                </span>
                <ChevronDown size={16} strokeWidth={2} className="shrink-0 group-data-[state=open]:hidden" />
                <ChevronUp size={16} strokeWidth={2} className="hidden shrink-0 group-data-[state=open]:block" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                {certifiedRows.map((m, i) => (
                  <RequirementRow key={m.id} module={m} index={i} isPrimary={false} />
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </section>
  );
}
