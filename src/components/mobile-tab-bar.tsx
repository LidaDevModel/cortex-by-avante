"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageCircle, Library, BookOpen } from "lucide-react";

const TABS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Chat", icon: MessageCircle, href: "/chat" },
  { label: "Library", icon: Library, href: "/library" },
  { label: "Training", icon: BookOpen, href: "/training/modules" },
];

/**
 * Bottom tab bar for mobile (VISION's mobile layout pattern) — replaces the
 * sidebar drawer as the primary navigation below the md breakpoint. Sits in
 * normal flow (not fixed) so it never covers screen content, and pads for
 * the home-indicator safe area.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="md:hidden shrink-0 flex items-stretch border-t border-border bg-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/training/modules"
            ? pathname.startsWith("/training")
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[52px]"
          >
            <span
              className={`flex items-center justify-center px-4 py-1 rounded-[6px] transition-colors duration-150 ${
                isActive ? "bg-[var(--sidebar-active)] text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon size={20} strokeWidth={1.5} />
            </span>
            <span
              className={`text-[11px] leading-[14px] font-medium ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
