"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { signOut } from "@/lib/auth-mock";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Switch } from "@/components/ui/switch";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import { type ThemePreference, useTheme } from "@/components/theme-context";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
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
  const router = useRouter();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const { headerClassName, onScroll } = useGlassHeader();
  const { preference, setPreference } = useTheme();
  // Operational alerts only exist once the admin is cleared for duty (Cortex
  // Manage access) — a not-cleared admin is a learner and sees only the learner
  // rows, matching the notifications feed and the rest of Manage.
  const canManage = useManageAccess();
  // Version subscription re-renders the toggles when prefs change.
  useNotificationsVersion();
  const prefs = getNotificationPrefs();
  const notificationRows = canManage ? [...LEARNER_ROWS, ...ADMIN_ROWS] : LEARNER_ROWS;

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Settings" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
          <h1 className="type-h1 font-bold text-foreground">
            Settings
          </h1>

          {/* Appearance */}
          <section
            className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-5 bg-surface-raised"
            style={{ border: "1px solid var(--border)" }}
          >
            <h2 className="type-h2 font-semibold text-foreground">Appearance</h2>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="type-label font-medium text-foreground">Theme</span>
                <span className="type-caption text-muted-foreground">
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
            <h2 className="type-h2 font-semibold text-foreground">Notifications</h2>
            <div className="flex flex-col gap-1">
              {notificationRows.map((row) => (
                // The whole row is the label, so the full width toggles.
                <label
                  key={row.key}
                  className="flex items-center justify-between gap-4 py-2.5 cursor-pointer"
                >
                  <span className="flex flex-col gap-0.5 min-w-0">
                    <span className="type-label font-medium text-foreground">{row.label}</span>
                    <span className="type-caption text-muted-foreground">{row.meta}</span>
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

          {/* Session — VISION defines this screen as "Appearance, Notification
              preferences, and Sign out". Signing out used to be reachable only
              from the sidebar dropdown or the mobile avatar dial, so a user who
              looked where the contract says to look did not find it. Same
              ExitConfirmDialog as both of those, so the confirm reads
              identically wherever it is reached from. */}
          <section
            className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-5 bg-surface-raised"
            style={{ border: "1px solid var(--border)" }}
          >
            <h2 className="type-h2 font-semibold text-foreground">Session</h2>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="type-label font-medium text-foreground">
                  Signed in on this device
                </span>
                <span className="type-caption text-muted-foreground">
                  Sign out if someone else uses this device.
                </span>
              </div>
              <Button
                variant="cta-secondary"
                size="cta"
                className="w-full sm:w-auto"
                onClick={() => setSignOutOpen(true)}
              >
                <LogOut className="size-4" strokeWidth={1.5} />
                Sign out
              </Button>
            </div>
          </section>
        </div>
      </ScrollCanvas>

      <ExitConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You'll need to sign in again to continue."
        exitLabel="Sign out"
        cancelLabel="Stay signed in"
        onExit={() => {
          signOut();
          router.push("/sign-in");
        }}
      />
    </div>
  );
}
