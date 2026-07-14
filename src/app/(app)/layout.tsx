import { SidebarInset } from "@/components/ui/sidebar";
import { CortexSidebar } from "@/components/cortex-sidebar";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ThemeProvider } from "@/components/theme-context";
import { Toaster } from "@/components/ui/toast";
import { AuthGate } from "@/components/auth-gate";

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
          {children}
          <MobileTabBar />
        </SidebarInset>
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  );
}
