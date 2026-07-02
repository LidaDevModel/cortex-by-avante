import { SidebarTrigger } from "@/components/ui/sidebar";
import { RecentlyViewedCard, type RecentlyViewedItem } from "@/components/library/RecentlyViewedCard";

const RECENTLY_VIEWED: RecentlyViewedItem[] = [
  { id: "1", type: "file", name: "Incident Response", meta: "13 pages" },
  { id: "2", type: "folder", name: "Guard Duty", meta: "2 files" },
  { id: "3", type: "file", name: "Security Protocols", meta: "12 pages" },
  { id: "4", type: "folder", name: "Access Control", meta: "7 files" },
  { id: "5", type: "file", name: "Emergency Procedures", meta: "8 pages" },
];

export default function LibraryPage() {
  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
      <header className="relative z-10 flex items-center gap-2 px-4 h-14 shrink-0" style={{ background: "var(--surface)" }}>
        <SidebarTrigger className="-ml-1" />
        <span className="font-medium text-foreground text-[14px] leading-[20px]">Library</span>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 overflow-y-auto z-10 scroll-thin"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
          }}
        >
          <div className="max-w-[1000px] mx-auto px-8 pt-8 pb-12 flex flex-col gap-8">
            <h1 className="text-[28px] leading-[36px] font-bold text-foreground">Library</h1>

            {/* Recently Viewed */}
            <section className="flex flex-col gap-4">
              <p
                className="text-[11px] leading-[16px] font-semibold text-muted-foreground tracking-[0.07em] uppercase"
              >
                Recently viewed
              </p>
              <div className="flex gap-[44px] overflow-x-auto py-3 px-2 -mx-2 scroll-thin">
                {RECENTLY_VIEWED.map((item) => (
                  <RecentlyViewedCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
