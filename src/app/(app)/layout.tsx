import { SidebarInset } from "@/components/ui/sidebar";
import { CortexSidebar } from "@/components/cortex-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CortexSidebar />
      <SidebarInset className="cortex-card-border flex flex-col overflow-hidden">
        {children}
      </SidebarInset>
    </>
  );
}
