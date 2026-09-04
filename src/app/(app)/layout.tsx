import { SidebarInset } from "@/components/ui/sidebar";
import { CortexSidebar } from "@/components/cortex-sidebar";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ThemeProvider } from "@/components/theme-context";
import { Toaster } from "@/components/ui/toast";
import { AuthGate } from "@/components/auth-gate";
import { OfflineBanner } from "@/components/offline-banner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthGate>
        {/* Skip link — first thing in the tab order, visible only on focus.
            Without it every keyboard user tabs the whole sidebar (7-13 items,
            two of them collapse groups) before reaching the page on EVERY
            navigation. Targets the canvas wrapper below, which is given
            tabIndex={-1} so the focus actually lands rather than being
            ignored as a non-focusable element. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:h-11 focus:px-4 focus:inline-flex focus:items-center focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:type-label focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        <CortexSidebar />
        <SidebarInset className="cortex-card-border flex flex-col overflow-hidden">
          <OfflineBanner />
          <div id="main-content" tabIndex={-1} className="flex-1 min-h-0 flex flex-col outline-none">
            {children}
          </div>
          <MobileTabBar />
        </SidebarInset>
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  );
}
