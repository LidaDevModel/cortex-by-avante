import { Check } from "lucide-react";

/**
 * State B badge — the compact "cleared for shift" marker shown inline beside
 * the dashboard greeting once every required certification is current. The
 * full readiness board collapses to this; the certification detail lives on
 * the shelf below. Dashboard-only (the /chat greeting never shows it).
 */
export function ClearedBadge({ requiredCount }: { requiredCount: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 h-7 pl-1.5 pr-3 rounded-full shrink-0"
      style={{ background: "color-mix(in srgb, var(--accent-subtle) 45%, transparent)" }}
      title={`All ${requiredCount} required certifications are current.`}
    >
      <span
        className="flex items-center justify-center w-4 h-4 rounded-full"
        style={{ background: "var(--primary)" }}
      >
        <Check size={11} strokeWidth={3} style={{ color: "var(--primary-foreground)" }} />
      </span>
      <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--primary)" }}>
        Cleared for duty
      </span>
    </span>
  );
}
