"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BookOpen, FileText, Target } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMobileNavVisible } from "@/hooks/use-mobile-nav";
import { daysSince } from "@/lib/utils";
import {
  type CortexNotification,
  getNotifications,
  markAllRead,
  markRead,
  useNotificationsVersion,
} from "@/lib/notifications-mock";

function itemIcon(n: CortexNotification) {
  if (n.category === "practice") return Target;
  return n.href.startsWith("/library") ? FileText : BookOpen;
}

function Row({ n, onOpen }: { n: CortexNotification & { unread: boolean }; onOpen: (n: CortexNotification) => void }) {
  const Icon = itemIcon(n);
  return (
    <button
      type="button"
      onClick={() => onOpen(n)}
      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-100 hover:bg-[var(--surface-lifted)] cursor-pointer"
    >
      <span
        className="flex items-center justify-center w-9 h-9 rounded-[10px] shrink-0 text-primary"
        style={{ background: "color-mix(in srgb, var(--accent-subtle) 45%, transparent)" }}
      >
        <Icon size={16} strokeWidth={1.5} />
      </span>
      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className={`text-[14px] leading-[20px] text-foreground ${n.unread ? "font-semibold" : "font-medium"}`}>
          {n.title}
        </span>
        <span className="text-[12px] leading-[16px] text-muted-foreground">{n.meta}</span>
      </span>
      {n.unread && (
        <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: "var(--primary)" }} aria-label="Unread" />
      )}
    </button>
  );
}

function PanelBody({ onOpen, showTitle = true }: { onOpen: (n: CortexNotification) => void; showTitle?: boolean }) {
  const items = getNotifications();
  const unread = items.filter((n) => n.unread).length;
  const today = items.filter((n) => daysSince(n.date) <= 0);
  const earlier = items.filter((n) => daysSince(n.date) > 0);

  return (
    <div className="flex flex-col min-h-0">
      {/* The sheet carries its own title, so the label is desktop-only —
          say it once. */}
      {(showTitle || unread > 0) && (
        <div className={`flex items-center gap-3 px-4 pt-3 pb-2 ${showTitle ? "justify-between" : "justify-end"}`}>
          {showTitle && (
            <span className="text-[11px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">
              Notifications
            </span>
          )}
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="text-[12px] leading-[16px] font-medium transition-opacity duration-100 hover:opacity-70 cursor-pointer"
              style={{ color: "var(--primary)" }}
            >
              Mark all as read
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col gap-1 px-4 py-8 text-center">
          <p className="text-[14px] leading-[20px] font-medium text-foreground">No new notifications.</p>
          <p className="text-[12px] leading-[16px] text-muted-foreground">
            Updates about your modules and documents will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col overflow-y-auto scroll-thin pb-2">
          {today.length > 0 && (
            <>
              <p className="px-4 pt-1 pb-0.5 text-[11px] leading-[16px] font-medium uppercase tracking-wider text-muted-foreground">
                Today
              </p>
              {today.map((n) => <Row key={n.id} n={n} onOpen={onOpen} />)}
            </>
          )}
          {earlier.length > 0 && (
            <>
              <p className="px-4 pt-2 pb-0.5 text-[11px] leading-[16px] font-medium uppercase tracking-wider text-muted-foreground">
                Earlier
              </p>
              {earlier.map((n) => <Row key={n.id} n={n} onOpen={onOpen} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Notifications bell — shell-owned, lives in the PageHeader actions slot on
 * browse screens (it follows the focused-task hiding table, so exams and
 * reading stay do-not-disturb). Desktop: anchored popover. Mobile: right
 * sheet, same recipe as chat history. Unread = a quiet primary dot — no
 * number bubbles.
 */
export function NotificationsBell() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const browseScreen = useMobileNavVisible();
  const [sheetOpen, setSheetOpen] = useState(false);
  useNotificationsVersion();

  // Unread state lives in localStorage — show the dot only after mount so the
  // server render (which can't read it) never mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const unread = mounted ? getNotifications().some((n) => n.unread) : false;

  if (!browseScreen) return null;

  function openItem(n: CortexNotification) {
    markRead(n.id);
    setSheetOpen(false);
    router.push(n.href);
  }

  const bellButton = (
    <button
      type="button"
      aria-label={unread ? "Notifications (unread)" : "Notifications"}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground transition-colors duration-100 hover:text-foreground hover:bg-foreground/5 cursor-pointer"
    >
      <Bell size={16} strokeWidth={1.5} />
      {unread && (
        <span
          aria-hidden
          className="absolute top-2 right-2.5 w-2 h-2 rounded-full border-2"
          style={{ background: "var(--primary)", borderColor: "var(--surface)" }}
        />
      )}
    </button>
  );

  if (isMobile) {
    return (
      <>
        <span onClick={() => setSheetOpen(true)}>{bellButton}</span>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="right"
            className="w-[320px] bg-surface p-0 gap-0 flex flex-col"
            // Initial focus must not land on "Mark all as read" (Radix's
            // first-focusable default) — an accidental activation would wipe
            // the unread state. Focus the panel itself instead.
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              (e.target as HTMLElement | null)?.focus?.();
            }}
          >
            <SheetHeader className="px-4 pt-4 pb-0">
              <SheetTitle className="flex items-center gap-2.5 text-[14px] leading-[20px] font-semibold text-primary">
                <Bell size={16} strokeWidth={1.5} />
                Notifications
              </SheetTitle>
            </SheetHeader>
            <PanelBody onOpen={openItem} showTitle={false} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{bellButton}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-[360px] p-0">
        <PanelBody onOpen={openItem} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
