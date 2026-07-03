"use client";

import { useRouter } from "next/navigation";
import { RecentlyViewedCard, type RecentlyViewedItem } from "@/components/library/RecentlyViewedCard";
import { DocumentsSection } from "@/components/library/DocumentsSection";
import { PageHeader } from "@/components/ui/page-header";

const RECENTLY_VIEWED: RecentlyViewedItem[] = [
  { id: "1", type: "file", name: "Incident Response" },
  { id: "2", type: "folder", name: "Guard Duty" },
  { id: "3", type: "file", name: "Security Protocols" },
  { id: "4", type: "folder", name: "Access Control" },
  { id: "5", type: "file", name: "Emergency Procedures" },
];

export default function LibraryPage() {
  const router = useRouter();
  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
      <PageHeader crumbs={[{ label: "Library" }]} />

      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 overflow-y-auto z-10 scroll-thin"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)",
          }}
        >
          <div className="max-w-[920px] mx-auto px-8 pt-8 pb-12 flex flex-col gap-8">
            <h1 className="text-[28px] leading-[36px] font-bold text-foreground">Library</h1>

            {/* Recently Viewed */}
            <section className="flex flex-col gap-0">
              <p
                className="section-label"
              >
                Recently viewed
              </p>
              <div className="flex gap-2 px-2 -mx-2">
                {RECENTLY_VIEWED.map((item) => (
                  <RecentlyViewedCard
                    key={item.id}
                    item={item}
                    onClick={item.type === "folder" ? () => router.push(`/library/folders/${item.id}`) : undefined}
                  />
                ))}
              </div>
            </section>

            <DocumentsSection />
          </div>
        </div>
      </div>
    </div>
  );
}
