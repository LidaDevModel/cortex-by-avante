import { SidebarTrigger } from "@/components/ui/sidebar";
import { Construction } from "lucide-react";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";

export default function DashboardPage() {
  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
      <header className="relative z-10 flex items-center gap-2 px-4 h-14 shrink-0" style={{ background: "var(--surface)" }}>
        <SidebarTrigger className="-ml-1" />
        <span className="font-medium text-foreground text-[14px] leading-[20px]">Dashboard</span>
      </header>

      <ScrollCanvas>
        <div className="max-w-[920px] mx-auto px-8 pt-8 pb-12 flex flex-col gap-8">
          <h1 className="text-[28px] leading-[36px] font-bold text-foreground">Dashboard</h1>

          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Construction size={32} strokeWidth={1.5} className="text-muted-foreground" />
            <p className="text-[15px] leading-[24px] font-medium text-foreground">This screen is under construction.</p>
            <p className="text-[13px] leading-[20px] text-muted-foreground">Check back soon — the dashboard is being built.</p>
          </div>
        </div>
      </ScrollCanvas>
    </div>
  );
}
