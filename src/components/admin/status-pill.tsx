import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { StaffStatus } from "@/lib/user-mock";

/** Staff status badge. Active reads as positive (success), invited as caution
 *  (warning), deactivated as quiet (neutral). Shape + colours from the shared
 *  Badge primitive. */
const MAP: Record<StaffStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "success" },
  invited: { label: "Invited", tone: "warning" },
  deactivated: { label: "Deactivated", tone: "neutral" },
};

export function StatusPill({ status }: { status: StaffStatus }) {
  const { label, tone } = MAP[status];
  return <Badge tone={tone}>{label}</Badge>;
}
