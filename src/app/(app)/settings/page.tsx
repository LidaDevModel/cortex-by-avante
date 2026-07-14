"use client";

import { Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-context";
import { useGlassHeader } from "@/hooks/use-glass-header";
import {
  type NotificationPrefs,
  getNotificationPrefs,
  setNotificationPref,
  useNotificationsVersion,
} from "@/lib/notifications-mock";

const NOTIFICATION_ROWS: { key: keyof NotificationPrefs; label: string; meta: string }[] = [
  {
    key: "assignments",
    label: "New assignments",
    meta: "Modules and documents added for your role",
  },
  {
    key: "certifications",
    label: "Certification reminders",
    meta: "When a certification is close to expiry",
  },
  {
    key: "practice",
    label: "Practice reminders",
    meta: "A nudge when today's Daily 5 is waiting",
  },
];

/**
 * Settings — the private account surface (device preferences, notification
 * choices, session). Deliberately separate from /profile, which stays the
 * public showcase colleagues can see.
 */
export default function SettingsPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const { isDark, setDark } = useTheme();
  // Version subscription re-renders the toggles when prefs change.
  useNotificationsVersion();
  const prefs = getNotificationPrefs();

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
                <span className="text-[12px] leading-[16px] text-muted-foreground">Applies on this device.</span>
              </div>
              {/* Same segmented recipe as the recency feed's filter */}
              <div className="inline-flex gap-0.5 p-0.5 rounded-[8px] bg-surface border border-border">
                {([
                  { dark: false, label: "Light", icon: Sun },
                  { dark: true, label: "Dark", icon: Moon },
                ] as const).map((o) => {
                  const active = isDark === o.dark;
                  return (
                    <button
                      key={o.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDark(o.dark)}
                      className={`inline-flex items-center gap-1.5 px-4 h-10 rounded-[6px] text-[13px] font-medium transition-[background-color,color] duration-150 ${
                        active
                          ? "bg-surface-lifted text-foreground shadow-[var(--shadow-thumb)] dark:shadow-none"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <o.icon size={14} strokeWidth={1.5} />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section
            className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-5 bg-surface-raised"
            style={{ border: "1px solid var(--border)" }}
          >
            <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Notifications</h2>
            <div className="flex flex-col gap-1">
              {NOTIFICATION_ROWS.map((row) => (
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
