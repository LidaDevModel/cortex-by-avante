"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import { getRequirementState, type Module } from "@/lib/training-mock";

/**
 * "Your requirements changed" — the one-time notice on Home when a module has
 * been added to the learner's required set since they last looked.
 *
 * This is the only place in the product where something the user EARNED is
 * removed by someone else's action, so the not-cleared state must not be
 * presented as their baseline. The card names the external cause, states the
 * cost to get back, and keeps the certifications they already hold in view —
 * turning a loss into one new item.
 *
 * A card, not a banner: banners are for ambient conditions that are true
 * everywhere (offline), this is one-time news about Home's own content. Sits
 * above the readiness board — it explains the board directly beneath it, and
 * carries the same ambient glow shadow, because for this one visit it IS the
 * hero of the screen.
 *
 * Hierarchy is deliberate: the eyebrow says what kind of news, the MODULE NAME
 * is the title (it is the subject), the facts sit on one scannable meta line,
 * and the reassurance gets its own line rather than being buried in a run-on
 * paragraph.
 */
export function NewRequirementCard({
  modules,
  requiredModules,
  role,
  wasCleared,
  onDismiss,
}: {
  /** The newly-required modules the learner hasn't been told about. */
  modules: Module[];
  /** Every required module — for the "still stand" count. */
  requiredModules: Module[];
  role: string;
  /** True when every OTHER requirement is certified (they were cleared). */
  wasCleared: boolean;
  onDismiss: () => void;
}) {
  if (modules.length === 0) return null;

  const first = modules[0];
  const multiple = modules.length > 1;

  // Same expression the readiness board uses, so the two counts can never
  // disagree on screen.
  const certifiedCount = requiredModules.filter(
    (m) => getRequirementState(m) === "certified"
  ).length;

  const chapters = modules.reduce((sum, m) => sum + m.chapters, 0);
  const hours = modules.reduce((sum, m) => sum + m.hours, 0);
  const timePhrase = hours <= 1 ? "about an hour" : `about ${hours} hours`;

  const added = new Date(first.assignedDate);
  const isToday = added.toDateString() === new Date().toDateString();
  const addedPhrase = isToday
    ? "Added today"
    : `Added ${added.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;

  const title = multiple
    ? `${modules.length} new required modules`
    : first.title;

  // The reassurance line — the whole point of the card.
  const reassurance = wasCleared
    ? multiple
      ? `Finish ${multiple ? "them" : "it"} and you're cleared for duty again.`
      : "Finish it and you're cleared for duty again."
    : `Added to your required training for ${role}.`;

  return (
    <section
      aria-labelledby="new-requirement-title"
      className="relative overflow-hidden rounded-[12px]"
      style={{
        // The card's SURFACE carries the notice, not a stripe: the document
        // callout tint layered over the raised surface (same layering idiom as
        // `.canvas-glow`). Reads as highlighted rather than alarming, and the
        // token is defined in both modes — unlike --card-glow-shadow, which is
        // `none` in dark and would leave dark mode undifferentiated.
        background: "var(--doc-callout-bg), var(--surface-raised)",
        border: "1px solid var(--doc-callout-border)",
        boxShadow: "var(--card-glow-shadow)",
        animation: "msg-in 200ms ease-out both",
      }}
    >
      <div className="relative flex flex-col gap-5 p-6">
        {/* Kind marker — a badge, the app's established way of labelling what
            something IS. A distinct object the eye catches, where small-caps
            text alone reads as another widget heading. */}
        <Badge tone="primary" className="self-start font-semibold">
          {multiple ? "New requirements" : "New requirement"}
        </Badge>

        {/* Subject: the module itself. Illustration + name + facts — the same
            shape as a readiness-board row, so it reads as the module it is.
            ModuleIllustration directly, NOT ModuleIcon: that wrapper's ambient
            glow is sized so its hard edge falls outside a 40px row's clip — on
            a card this tall the edge lands inside and paints a visible band. */}
        <div className="relative flex items-center gap-4 min-w-0">
          <ModuleIllustration
            category={first.category}
            width={48}
            height={48}
            className="shrink-0 flex"
          />
          <div className="relative z-10 flex flex-col gap-1.5 min-w-0">
            <h2
              id="new-requirement-title"
              className="text-[20px] leading-[28px] font-semibold text-foreground"
            >
              {title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] leading-[18px] text-muted-foreground">
                {addedPhrase} · {chapters} chapters
              </span>
              <Badge tone="primary" icon={<Clock size={12} strokeWidth={2} />}>
                {timePhrase}
              </Badge>
            </div>
          </div>
        </div>

        {/* Reassurance — its own line, the emotional work of the card */}
        <p className="relative z-10 text-[15px] leading-[24px] text-foreground">
          {reassurance}
          {certifiedCount > 0 && (
            <span className="text-muted-foreground">
              {" "}Your {certifiedCount} completed requirement
              {certifiedCount === 1 ? "" : "s"} still count
              {certifiedCount === 1 ? "s" : ""}.
            </span>
          )}
        </p>

        {/* Primary left-aligned with the tertiary beside it — matches the
            readiness board's row actions rather than a modal footer. */}
        <div className="relative z-10 flex items-center gap-5 flex-wrap">
          <Link
            href={`/training/modules/${first.id}`}
            className="inline-flex items-center justify-center gap-1.5 h-[40px] px-5 rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Start module
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="text-[13px] leading-[20px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-[4px] px-1"
          >
            Not now
          </button>
        </div>
      </div>
    </section>
  );
}
