import { SidebarTrigger } from "@/components/ui/sidebar";
import { Construction } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
      <header className="relative z-10 flex items-center gap-2 px-4 h-14 shrink-0" style={{ background: "var(--surface)" }}>
        <SidebarTrigger className="-ml-1" />
        <span className="font-medium text-foreground text-[14px] leading-[20px]">Library</span>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto z-10 scroll-thin" style={{ maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)" }}>
          <div className="max-w-[920px] mx-auto px-8 pt-8 pb-12 flex flex-col gap-8">
            <h1 className="text-[28px] leading-[36px] font-bold text-foreground">Library</h1>

            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <Construction size={32} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="text-[15px] leading-[24px] font-medium text-foreground">This screen is under construction.</p>
              <p className="text-[13px] leading-[20px] text-muted-foreground">The knowledge library is being built and will be available soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
