import { SidebarInset } from "@/components/ui/sidebar";
import { CortexSidebar } from "@/components/cortex-sidebar";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { ThemeProvider } from "@/components/theme-context";
import { Toaster } from "@/components/ui/toast";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <CortexSidebar />
      <SidebarInset className="cortex-card-border flex flex-col overflow-hidden">
        {children}
        <MobileTabBar />
        <DarkModeToggle />
      </SidebarInset>
      <Toaster />
    </ThemeProvider>
  );
}
