import type { StaffStatus } from "@/lib/user-mock";

/** Staff status pill. Active reads as positive (success), invited as caution
 *  (warning), deactivated as quiet (muted). All from existing tokens. */
const STYLE: Record<StaffStatus, { label: string; bg: string; color: string }> = {
  active: { label: "Active", bg: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" },
  invited: { label: "Invited", bg: "color-mix(in srgb, var(--warning) 14%, transparent)", color: "var(--warning)" },
  deactivated: { label: "Deactivated", bg: "var(--surface-chip)", color: "var(--muted-foreground)" },
};

export function StatusPill({ status }: { status: StaffStatus }) {
  const s = STYLE[status];
  return (
    <span
      className="inline-flex items-center px-2 py-[2px] rounded-[6px] text-[12px] leading-[16px] font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
