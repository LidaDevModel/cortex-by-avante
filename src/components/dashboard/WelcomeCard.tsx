"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import { formatHours, remainingHours, type Module } from "@/lib/training-mock";

/**
 * "Welcome to Cortex" — the first-visit card on Home.
 *
 * Onboarding's only acknowledgement was a five-second toast that covered the
 * readiness board. Worse, it was the ONLY moment: Home then rendered exactly
 * as it would on any other day, and nothing in the product ever explained the
 * four tabs — not a tour, not a coachmark, not a hint. A guard on day one had
 * Home, Chat, Library and Training in front of him and had never been told
 * what any of them were. Chat especially, the product's primary use case, is a
 * speech-bubble icon he has no reason to press.
 *
 * One card answers the four day-one questions — what is this, what do I do,
 * how long will it take, what else is here — for one sentence of cost each. A
 * tour is not warranted for a four-tab app, and a carousel would be worse.
 *
 * Same shape as NewRequirementCard on purpose: both are one-time news about
 * Home's own content, sitting above the board they explain. Divergence between
 * two cards doing the same job is the drift this reuse avoids.
 */
export function WelcomeCard({
  requiredModules,
  role,
  onDismiss,
}: {
  /** Every required module — the plan the card describes. */
  requiredModules: Module[];
  role: string;
  onDismiss: () => void;
}) {
  const count = requiredModules.length;
  // Same helper the readiness board uses, so the card and the board directly
  // beneath it can never quote different totals.
  const timePhrase = formatHours(remainingHours(requiredModules));
  const first = requiredModules[0];

  // Nothing assigned yet: the card would be a welcome with no plan in it, and
  // the board below carries its own empty state. Say nothing rather than
  // welcome someone into an empty screen.
  if (count === 0) return null;

  return (
    <section
      aria-labelledby="welcome-title"
      className="relative overflow-hidden rounded-[12px]"
      style={{
        background: "var(--doc-callout-bg), var(--surface-raised)",
        border: "1px solid var(--doc-callout-border)",
        boxShadow: "var(--card-glow-shadow)",
        animation: "msg-in 200ms ease-out both",
      }}
    >
      <div className="relative flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge tone="primary" className="font-semibold">
            First visit
          </Badge>
          {timePhrase && (
            <span className="type-meta italic text-muted-foreground">
              {timePhrase}
            </span>
          )}
        </div>

        <div className="relative flex items-center gap-4 min-w-0">
          {/* ModuleIllustration directly, not ModuleIcon — that wrapper's
              ambient glow is sized for a 40px row and paints a visible band
              inside a card this tall. Same note as NewRequirementCard. */}
          {first && (
            <ModuleIllustration
              category={first.category}
              width={48}
              height={48}
              className="shrink-0 flex"
            />
          )}
          <div className="relative z-10 flex flex-col gap-1.5 min-w-0">
            {/* NOT "Welcome to Cortex, {name}" — that is the page greeting
                directly above, and saying it twice on one screen wastes the
                card's title on a line already read. The title carries the
                day-one instruction instead; the greeting carries the welcome. */}
            <h2 id="welcome-title" className="type-h2 font-semibold text-foreground">
              Start here
            </h2>
            <span className="type-meta text-muted-foreground">
              {count} {count === 1 ? "module" : "modules"} required for {role} · any order
            </span>
          </div>
        </div>

        {/* What clearance means, then what else is here. Two sentences, in the
            order the questions arrive. */}
        <p className="relative z-10 type-body text-foreground">
          Your training is below. Once you&apos;re certified in{" "}
          {count === 1 ? "it" : `all ${count}`} you&apos;re cleared for duty.
          <span className="text-muted-foreground">
            {" "}You can ask Cortex anything at any time — it answers from Avante&apos;s own
            protocols and guidelines.
          </span>
        </p>

        <div className="relative z-10 flex items-center gap-5 flex-wrap">
          {first && (
            <Button asChild size="cta" onClick={onDismiss}>
              <Link href={`/training/modules/${first.id}`}>
                Start first module
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </Button>
          )}
          {/* "Explore first" rather than "Not now": nothing is being deferred,
              they are choosing to look around, which is a legitimate day-one
              move and the reason the Chat line above is there. */}
          <button
            type="button"
            onClick={onDismiss}
            className="type-meta font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-[4px] px-1"
          >
            Explore first
          </button>
        </div>
      </div>
    </section>
  );
}
