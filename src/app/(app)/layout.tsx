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
        <CortexSidebar />
        <SidebarInset className="cortex-card-border flex flex-col overflow-hidden">
          <OfflineBanner />
          <div className="flex-1 min-h-0 flex flex-col">
            {children}
          </div>
          <MobileTabBar />
        </SidebarInset>
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  );
}
