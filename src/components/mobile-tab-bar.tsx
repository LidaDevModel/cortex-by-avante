"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MessageCircle, Library, BookOpen, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMobileNavVisible } from "@/hooks/use-mobile-nav";
import { getAuthProfile } from "@/lib/auth-mock";
import { USER } from "@/lib/user-mock";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", icon: House, href: "/dashboard" },
  { label: "Chat", icon: MessageCircle, href: "/chat" },
  { label: "Library", icon: Library, href: "/library" },
];

/* Speed dials — the cluster's disclosure idiom. Training is the only tab with
   children; the satellite avatar is the account menu (mirrors the desktop
   sidebar footer dropdown: Profile · Settings). Two taps, accepted trade. */
const DIALS = {
  training: {
    options: [
      { label: "Modules", href: "/training/modules" },
      { label: "Knowledge Check", href: "/training/quick-check" },
    ],
    // Anchored over the Training tab (right edge); options grow bottom-up.
    align: "right" as const,
  },
  profile: {
    options: [
      { label: "Profile", href: "/profile" },
      { label: "Settings", href: "/settings" },
    ],
    // Anchored over the avatar (left edge).
    align: "left" as const,
  },
};

type DialId = keyof typeof DIALS;
type DialState = { id: DialId; closing: boolean } | null;

/**
 * Floating mobile nav cluster (VISION's mobile layout pattern): a satellite
 * profile avatar + a 4-tab pill, floating above the safe area on browse
 * screens and hidden on focused-task screens (useMobileNavVisible — the
 * hiding table). Training and the avatar each open a speed dial over a blur
 * scrim; Training's icon morphs to an X while its dial is open.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const visible = useMobileNavVisible();

  const [dial, setDial] = useState<DialState>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trainingTriggerRef = useRef<HTMLButtonElement>(null);
  const avatarTriggerRef = useRef<HTMLButtonElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  // Read once per mount (post-AuthGate) — same pattern as the sidebar avatar.
  const avatarUrl = getAuthProfile().avatarUrl;

  const triggerFor = useCallback(
    (id: DialId) => (id === "training" ? trainingTriggerRef.current : avatarTriggerRef.current),
    []
  );

  const closeDial = useCallback((instant = false) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (instant) {
      setDial(null);
      return;
    }
    setDial((d) => (d && !d.closing ? { ...d, closing: true } : d));
    // Exits run faster than entrances (120ms vs 150ms).
    closeTimer.current = setTimeout(() => setDial(null), 130);
  }, []);

  const toggleDial = useCallback(
    (id: DialId) => {
      setDial((d) => {
        if (d?.id === id && !d.closing) {
          // Closing path handled via closeDial for the exit animation.
          if (closeTimer.current) clearTimeout(closeTimer.current);
          closeTimer.current = setTimeout(() => setDial(null), 130);
          return { id, closing: true };
        }
        return { id, closing: false };
      });
    },
    []
  );

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Route change closes any dial instantly (no exit animation over a new page).
  useEffect(() => {
    closeDial(true);
  }, [pathname, closeDial]);

  // While open: Escape closes and returns focus to the trigger; Tab is trapped
  // within the dial cluster (options + trigger) so the blurred page behind is
  // unreachable by keyboard; arrows move between options.
  useEffect(() => {
    if (!dial || dial.closing) return;
    const trigger = triggerFor(dial.id);
    function focusables(): HTMLElement[] {
      const opts = dialRef.current
        ? [...dialRef.current.querySelectorAll<HTMLElement>("a")]
        : [];
      return trigger ? [...opts, trigger] : opts;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDial();
        trigger?.focus();
        return;
      }
      const els = focusables();
      if (els.length === 0) return;
      const idx = els.indexOf(document.activeElement as HTMLElement);
      if (e.key === "Tab") {
        e.preventDefault();
        const next = e.shiftKey
          ? els[(idx - 1 + els.length) % els.length]
          : els[(idx + 1) % els.length];
        next.focus();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        els[(idx + delta + els.length) % els.length]?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    // Focus moves into the dial on open.
    const raf = requestAnimationFrame(() => {
      dialRef.current?.querySelector<HTMLElement>("a")?.focus();
    });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(raf);
    };
  }, [dial, closeDial, triggerFor]);

  if (!visible) return null;

  const trainingDialShown = dial?.id === "training";
  const profileDialShown = dial?.id === "profile";
  const trainingActive = pathname.startsWith("/training");
  const profileActive = pathname.startsWith("/profile") || pathname.startsWith("/settings");
  const activeDial = dial ? DIALS[dial.id] : null;

  return (
    <>
      {/* Scrim — blur + dim; tap anywhere outside closes the dial */}
      {dial && (
        <div
          aria-hidden
          onClick={() => closeDial()}
          className="fixed inset-0 z-40 md:hidden"
          style={{
            background: "var(--scrim)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animation: dial.closing
              ? "scrim-in 120ms ease-out reverse both"
              : "scrim-in 160ms ease-out both",
          }}
        />
      )}

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 md:hidden pointer-events-none px-4 pb-[calc(12px+env(safe-area-inset-bottom))]"
      >
        <div className="relative flex items-center gap-3">
          {/* Speed dial options — grow out of their trigger, bottom-up */}
          {dial && activeDial && (
            <div
              ref={dialRef}
              id={`${dial.id}-dial`}
              role="menu"
              aria-label={dial.id === "training" ? "Training" : "Account"}
              className={cn(
                "pointer-events-auto absolute bottom-[calc(100%+12px)] flex flex-col gap-2.5",
                activeDial.align === "right" ? "right-0 items-end" : "left-0 items-start"
              )}
            >
              {activeDial.options.map((opt, i) => {
                const active = pathname.startsWith(opt.href);
                return (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    role="menuitem"
                    className={cn(
                      "flex items-center h-11 px-5 rounded-full border text-[14px] leading-[20px] font-semibold",
                      active
                        ? "bg-[var(--sidebar-active)] text-primary border-transparent"
                        : "bg-surface text-foreground border-border"
                    )}
                    style={{
                      boxShadow: "var(--shadow-floating)",
                      transformOrigin:
                        activeDial.align === "right" ? "bottom right" : "bottom left",
                      // Bottom-up stagger on entry (the lower pill is closest
                      // to the thumb); exits run together, 20% faster.
                      animation: dial.closing
                        ? "dial-out 120ms ease-out both"
                        : `dial-in 150ms ease-out ${(activeDial.options.length - 1 - i) * 60}ms both`,
                    }}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Satellite avatar — the account dial trigger (Profile · Settings);
              identity anchor, so the photo stays put while open (ring + scrim
              carry the open state instead of an X morph) */}
          <button
            ref={avatarTriggerRef}
            type="button"
            aria-label="Account"
            aria-haspopup="menu"
            aria-expanded={profileDialShown && !dial?.closing}
            aria-controls="profile-dial"
            onClick={() => toggleDial("profile")}
            className={cn(
              "pointer-events-auto shrink-0 flex items-center justify-center w-14 h-14 rounded-full border bg-surface",
              profileActive || profileDialShown
                ? "border-transparent ring-2 ring-[var(--ring)]"
                : "border-border"
            )}
            style={{ boxShadow: "var(--shadow-floating)" }}
          >
            <Avatar className="h-11 w-11">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="bg-secondary text-primary font-semibold text-[13px]">
                {USER.initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Tab pill */}
          <div
            className="pointer-events-auto flex-1 flex items-stretch h-16 px-2 rounded-full border border-border bg-surface"
            style={{ boxShadow: "var(--shadow-floating)" }}
          >
            {TABS.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  // Active state is colour only — no pill behind the icon. (The
                  // pill stays the desktop sidebar's active treatment.)
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <tab.icon size={20} strokeWidth={1.5} />
                  <span className="text-[11px] leading-[14px] font-medium">{tab.label}</span>
                </Link>
              );
            })}

            {/* Training — speed dial trigger; icon morphs BookOpen ↔ X */}
            <button
              ref={trainingTriggerRef}
              type="button"
              aria-expanded={trainingDialShown && !dial?.closing}
              aria-haspopup="menu"
              aria-controls="training-dial"
              onClick={() => toggleDial("training")}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150",
                trainingActive || trainingDialShown ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span className="relative flex items-center justify-center">
                <BookOpen
                  size={20}
                  strokeWidth={1.5}
                  className={cn(
                    "transition-[opacity,rotate] duration-150",
                    trainingDialShown ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                  )}
                />
                <X
                  size={20}
                  strokeWidth={1.5}
                  className={cn(
                    "absolute transition-[opacity,rotate] duration-150",
                    trainingDialShown ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                  )}
                />
              </span>
              <span className="text-[11px] leading-[14px] font-medium">Training</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
