"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Switch } from "@/components/ui/switch";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import { type ThemePreference, useTheme } from "@/components/theme-context";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useCurrentRole } from "@/lib/current-role";
import {
  type NotificationPrefs,
  getNotificationPrefs,
  setNotificationPref,
  useNotificationsVersion,
} from "@/lib/notifications-mock";

const THEME_OPTIONS: readonly SegmentedOption<ThemePreference>[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

type NotificationRow = { key: keyof NotificationPrefs; label: string; meta: string };

// Everyone has a learning side (admins included, via the Learning group).
const LEARNER_ROWS: NotificationRow[] = [
  {
    key: "assignments",
    label: "New assignments",
    meta: "Modules and documents added for your role",
  },
  {
    key: "practice",
    label: "Practice reminders",
    meta: "A nudge when today's Daily 5 is waiting",
  },
];

// Operational alerts — only relevant to admins.
const ADMIN_ROWS: NotificationRow[] = [
  {
    key: "flags",
    label: "Flagged responses",
    meta: "When a guard flags an AI answer for review",
  },
  {
    key: "invites",
    label: "Pending activations",
    meta: "When an invited user hasn't activated yet",
  },
];

/**
 * Settings — the private account surface (device preferences, notification
 * choices, session). Deliberately separate from /profile, which stays the
 * public showcase colleagues can see.
 */
export default function SettingsPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const { preference, setPreference } = useTheme();
  const role = useCurrentRole();
  // Version subscription re-renders the toggles when prefs change.
  useNotificationsVersion();
  const prefs = getNotificationPrefs();
  const notificationRows = role === "admin" ? [...LEARNER_ROWS, ...ADMIN_ROWS] : LEARNER_ROWS;

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Settings" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
          <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">
            Settings
          </h1>

          {/* Appearance */}
          <section
            className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-5 bg-surface-raised"
            style={{ border: "1px solid var(--border)" }}
          >
            <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Appearance</h2>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-[20px] font-medium text-foreground">Theme</span>
                <span className="text-[12px] leading-[16px] text-muted-foreground">
                  System follows your device. Applies on this device.
                </span>
              </div>
              {/* Shared Segmented primitive — same control as the home feed
                  filter, with icons for this case. */}
              <Segmented
                options={THEME_OPTIONS}
                value={preference}
                onChange={setPreference}
                ariaLabel="Theme"
              />
            </div>
          </section>

          {/* Notifications */}
          <section
            className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-5 bg-surface-raised"
            style={{ border: "1px solid var(--border)" }}
          >
            <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Notifications</h2>
            <div className="flex flex-col gap-1">
              {notificationRows.map((row) => (
                // The whole row is the label, so the full width toggles.
                <label
                  key={row.key}
                  className="flex items-center justify-between gap-4 py-2.5 cursor-pointer"
                >
                  <span className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[14px] leading-[20px] font-medium text-foreground">{row.label}</span>
                    <span className="text-[12px] leading-[16px] text-muted-foreground">{row.meta}</span>
                  </span>
                  <Switch
                    checked={prefs[row.key]}
                    onCheckedChange={(v) => setNotificationPref(row.key, v)}
                    aria-label={row.label}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>
      </ScrollCanvas>
    </div>
  );
}
