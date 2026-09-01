"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
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
 * above the readiness board — it explains the board directly beneath it.
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

  const hours = modules.reduce((sum, m) => sum + m.hours, 0);
  const timePhrase = hours <= 1 ? "about an hour" : `about ${hours} hours`;

  const addedOn = new Date(first.assignedDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });

  const title = multiple
    ? `${modules.length} new modules are now required for your role`
    : "A new module is now required for your role";

  const names = multiple
    ? modules.map((m) => m.title).join(", ")
    : first.title;

  return (
    <section
      aria-labelledby="new-requirement-title"
      className="relative overflow-hidden rounded-[12px] p-6 pl-[22px] flex flex-col gap-4 bg-surface-raised"
      style={{ border: "1px solid var(--border)", animation: "msg-in 200ms ease-out both" }}
    >
      {/* Left accent — marks this as a notice rather than a standing widget.
          Same 2px primary accent the selected-item pattern uses. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: "var(--primary)" }}
      />

      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex items-center justify-center w-10 h-10 rounded-[10px] shrink-0 text-primary"
          style={{ background: "color-mix(in srgb, var(--accent-subtle) 45%, transparent)" }}
        >
          <BookOpen size={20} strokeWidth={1.5} />
        </span>

        <div className="flex flex-col gap-1 min-w-0">
          <h2
            id="new-requirement-title"
            className="text-[17px] leading-[24px] font-semibold text-foreground"
          >
            {title}
          </h2>
          <p className="text-[14px] leading-[20px] text-muted-foreground">
            {names} {multiple ? "were" : "was"} added on {addedOn}.{" "}
            {wasCleared
              ? `Finish ${multiple ? "them" : "it"} — ${timePhrase} — and you're cleared for duty again.`
              : `That's ${timePhrase} of reading, added to your required training.`}{" "}
            {certifiedCount > 0 && (
              <>
                Your {certifiedCount} completed requirement
                {certifiedCount === 1 ? "" : "s"} still stand
                {certifiedCount === 1 ? "s" : ""}.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Primary right, tertiary left — VISION's footer rule. The tertiary is a
          muted text link, never a button. */}
      <div className="flex items-center gap-4 flex-wrap pl-[52px] max-sm:pl-0">
        <Link
          href={`/training/modules/${first.id}`}
          className="inline-flex items-center justify-center gap-1.5 h-[36px] px-4 rounded-[8px] text-[13px] font-semibold transition-opacity duration-100 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {multiple ? `Start ${first.title}` : "Start module"}
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[13px] leading-[20px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-[4px]"
        >
          Not now
        </button>
      </div>

      <span className="sr-only">
        Required for {role}. This notice appears once; the module stays on your
        shift-readiness board below.
      </span>
    </section>
  );
}
