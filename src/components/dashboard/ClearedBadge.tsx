import { Check, CircleDashed, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * State B badge — the compact "cleared for shift" marker shown inline beside
 * the dashboard greeting once every required certification is current. Also
 * used on the admin person page to show a staff member's shift-readiness.
 *
 * `requiredCount` populates the tooltip when the caller knows it (the learner's
 * own dashboard/profile); omit it on the admin surface, where per-staff
 * required counts aren't loaded, for a generic tooltip.
 */
export function ClearedBadge({
  requiredCount,
  dueCount,
  daysLeft,
}: {
  requiredCount?: number;
  /* Required modules still inside their 14-day window (D11). Clearance holds,
     but something is owed, and a badge that said only "Cleared for duty"
     would be hiding a deadline the guard has to meet. */
  dueCount?: number;
  daysLeft?: number;
}) {
  const owing = (dueCount ?? 0) > 0;

  return (
    <span className="flex items-center gap-2 flex-wrap">
      <Badge
        tone="success"
        className="font-semibold"
        icon={<Check size={13} strokeWidth={2.5} />}
        title={requiredCount != null ? `All ${requiredCount} required certifications are current.` : "Certified in all required modules."}
      >
        Cleared for duty
      </Badge>
      {owing && (
        <Badge
          tone="neutral"
          icon={<Clock size={13} strokeWidth={1.5} />}
          title="Certify before the deadline to stay cleared for duty."
        >
          {dueCount === 1 ? "1 module due" : `${dueCount} modules due`}
          {daysLeft != null && (daysLeft <= 0 ? " today" : daysLeft === 1 ? " tomorrow" : ` in ${daysLeft} days`)}
        </Badge>
      )}
    </span>
  );
}

/**
 * The counterpart to ClearedBadge — a neutral marker for an active field agent
 * who has NOT yet certified in every required module. Neutral (never alarming):
 * a pending state, not an error. Admin person page only.
 */
export function NotClearedBadge() {
  return (
    <Badge tone="neutral" icon={<CircleDashed size={13} strokeWidth={1.5} />} title="Not all required certifications are current.">
      Not shift-ready
    </Badge>
  );
}
