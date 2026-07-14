"use client";

import { useRouter } from "next/navigation";
import { RecentlyViewedCard, type RecentlyViewedItem } from "@/components/library/RecentlyViewedCard";
import { DocumentsSection } from "@/components/library/DocumentsSection";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { useGlassHeader } from "@/hooks/use-glass-header";

const RECENTLY_VIEWED: RecentlyViewedItem[] = [
  { id: "1", type: "file", name: "Incident Response" },
  { id: "2", type: "folder", name: "Guard Duty" },
  { id: "3", type: "file", name: "Security Protocols" },
  { id: "4", type: "folder", name: "Access Control" },
  { id: "5", type: "file", name: "Emergency Procedures" },
];

export default function LibraryPage() {
  const router = useRouter();
  const { headerClassName, onScroll } = useGlassHeader();
  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Library" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
          <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Library</h1>

            {/* Recently Viewed */}
            <section className="flex flex-col gap-0">
              <p
                className="section-label"
              >
                Recently viewed
              </p>
              {/* Bleeds to the viewport edge on mobile so the row swipes
                  edge-to-edge; the partially visible next card is the scroll
                  affordance (same scroller recipe as CertificationsShelf). */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x px-4 -mx-4 scroll-px-4 sm:px-2 sm:-mx-2 sm:scroll-px-2">
                {RECENTLY_VIEWED.map((item) => (
                  <RecentlyViewedCard
                    key={item.id}
                    item={item}
                    onClick={() => router.push(item.type === "folder" ? `/library/folders/${item.id}` : `/library/files/${item.id}`)}
                  />
                ))}
              </div>
            </section>

            <DocumentsSection />
          </div>
      </ScrollCanvas>
    </div>
  );
}
