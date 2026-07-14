"use client";

import { Star } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { type CertificationTier, type Module, getTier } from "@/lib/training-mock";

/** Fixed card width in carousel contexts — the shelf's scroll math reads it. */
export const HONOR_CARD_W = 220;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Binary tier badge — Ace (star) at 100, plain Certified otherwise. */
export function TierChip({ tier }: { tier: CertificationTier }) {
  if (tier === "ace") {
    return (
      <span
        className="self-start inline-flex items-center gap-1 text-[12px] leading-[16px] font-semibold px-2.5 py-1 rounded-full"
        style={{ background: "color-mix(in srgb, var(--accent-subtle) 45%, transparent)", color: "var(--primary)" }}
      >
        <Star size={12} strokeWidth={2} fill="currentColor" />
        Ace
      </span>
    );
  }
  return (
    <span
      className="self-start inline-flex items-center text-[12px] leading-[16px] font-medium px-2.5 py-1 rounded-full"
      style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)", color: "var(--primary)" }}
    >
      Certified
    </span>
  );
}

/**
 * The certification honor card — tier chip, counting score, module title,
 * issue date. The same artifact everywhere a certification appears (dashboard
 * shelf, profile showcase) so a certification reads as one persistent object.
 */
export function HonorCard({
  module: m,
  carousel,
  start,
  index,
}: {
  module: Module;
  /** Fixed-width snap item (carousel) vs fluid grid cell. */
  carousel: boolean;
  /** Starts the count-up + entrance (usually "scrolled into view"). */
  start: boolean;
  /** Stagger position for the entrance animation. */
  index: number;
}) {
  const tier = getTier(m)!;
  const score = useCountUp(m.certification!.score, start);
  return (
    <div
      className={`flex flex-col gap-3 rounded-[12px] p-4 bg-surface-chip ${carousel ? "snap-start shrink-0" : "w-full"}`}
      style={{
        border: "1px solid transparent",
        width: carousel ? HONOR_CARD_W : undefined,
        // Cards settle in staggered once the container scrolls into view.
        animation: start ? `msg-in 200ms ease-out ${index * 60}ms both` : undefined,
      }}
    >
      <TierChip tier={tier} />
      <div className="flex flex-col gap-0.5">
        <span className="text-[32px] leading-[36px] font-bold tabular-nums text-foreground">{score}%</span>
        <span className="text-[15px] leading-[20px] font-semibold text-foreground truncate">{m.title}</span>
      </div>
      <span className="text-[12px] leading-[16px] text-muted-foreground">Certified {formatDate(m.certification!.date)}</span>
    </div>
  );
}
