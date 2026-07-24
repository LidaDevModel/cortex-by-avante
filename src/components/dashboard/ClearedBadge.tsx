import { Check, CircleDashed } from "lucide-react";
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
export function ClearedBadge({ requiredCount }: { requiredCount?: number }) {
  return (
    <Badge
      tone="success"
      className="font-semibold"
      icon={<Check size={13} strokeWidth={2.5} />}
      title={requiredCount != null ? `All ${requiredCount} required certifications are current.` : "Certified in all required modules."}
    >
      Cleared for duty
    </Badge>
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
