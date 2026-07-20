import { cn } from "@/lib/utils";

/**
 * Ring progress indicator with a centred label — the arc sweeps from 0 (or from
 * its previous value) whenever `value` changes. Tokens only: track = --border,
 * arc = --primary. Used by the dashboard readiness board (large, percentage) and
 * the activation stepper (small, step count).
 */
export function ProgressDonut({
  value,
  label,
  ariaLabel,
  size = 76,
  stroke = 8,
  labelClassName = "text-[15px] font-bold",
}: {
  /** 0–100; drives the arc length. */
  value: number;
  /** Centre text (e.g. "33%" or "2 of 3"). */
  label: string;
  ariaLabel: string;
  size?: number;
  stroke?: number;
  /** Size/weight of the centre text — scale it down for small donuts. */
  labelClassName?: string;
}) {
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
          stroke="var(--success)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 400ms ease-out" }}
        />
      </svg>
      <span className={cn("absolute inset-0 flex items-center justify-center tabular-nums text-foreground", labelClassName)}>
        {label}
      </span>
    </div>
  );
}
