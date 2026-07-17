"use client";

import { useRouter } from "next/navigation";
import { RecentlyViewedCard, type RecentlyViewedItem } from "@/components/library/RecentlyViewedCard";
import { DocumentsSection } from "@/components/library/DocumentsSection";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { EdgeFadeScroller } from "@/components/ui/edge-fade-scroller";
import { Skeleton } from "@/components/ui/skeleton";
import { useInitialLoad } from "@/hooks/use-initial-load";
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
  const loading = useInitialLoad("library");
  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Library" }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
          <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">
            <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">Library</h1>

            {loading ? (
              <>
                {/* Recently viewed — skeleton */}
                <section className="flex flex-col gap-4">
                  <Skeleton className="h-3 w-28 rounded" />
                  <div className="flex gap-4 -mx-4 px-4 sm:-mx-2 sm:px-2 overflow-hidden">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="shrink-0 flex flex-col gap-[14px]" style={{ width: 164 }}>
                        <Skeleton className="h-[149px] w-full rounded-[16px]" />
                        <Skeleton className="h-4 w-24 rounded self-center" />
                      </div>
                    ))}
                  </div>
                </section>
                {/* Documents — skeleton */}
                <section className="flex flex-col gap-4">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-12 w-full rounded-[8px]" />
                  <div className="flex gap-3">
                    <Skeleton className="h-11 w-32 rounded-[8px]" />
                    <Skeleton className="h-11 w-36 rounded-[8px]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-[12px]" />
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <>
            {/* Recently Viewed */}
            <section className="flex flex-col gap-0">
              <p
                className="section-label"
              >
                Recently viewed
              </p>
              {/* Bleeds to the viewport edge on mobile so the row swipes
                  edge-to-edge; scroll-edge fades melt a partially-scrolled card
                  into the canvas instead of clipping hard (same recipe as
                  CertificationsShelf). */}
              <EdgeFadeScroller
                wrapperClassName="-mx-4 sm:-mx-2"
                className="flex gap-2 snap-x px-4 scroll-px-4 sm:px-2 sm:scroll-px-2 py-3"
              >
                {RECENTLY_VIEWED.map((item) => (
                  <RecentlyViewedCard
                    key={item.id}
                    item={item}
                    onClick={() => router.push(item.type === "folder" ? `/library/folders/${item.id}` : `/library/files/${item.id}`)}
                  />
                ))}
              </EdgeFadeScroller>
            </section>

            <DocumentsSection />
              </>
            )}
          </div>
      </ScrollCanvas>
    </div>
  );
}
