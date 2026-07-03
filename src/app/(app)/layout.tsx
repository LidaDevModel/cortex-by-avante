import { SidebarInset } from "@/components/ui/sidebar";
import { CortexSidebar } from "@/components/cortex-sidebar";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { ThemeProvider } from "@/components/theme-context";

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
        <DarkModeToggle />
      </SidebarInset>
    </ThemeProvider>
  );
}
