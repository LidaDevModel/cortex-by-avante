"use client";

import { useParams } from "next/navigation";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { NotFoundState } from "@/components/ui/not-found-state";
import { DocCallout } from "@/components/library/DocCallout";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { useLibrary, getContentDoc } from "@/lib/content-store";

export default function AdminDocumentPreviewPage() {
  const { id } = useParams<{ id: string }>();
  useLibrary(); // subscribe so edits reflect
  const found = getContentDoc(id);

  if (!found) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden">
        <PreviewBanner note="Document preview" />
        <NotFoundState title="Document not found" description="This document may have been removed." actionLabel="Back to content" actionHref="/admin/content" />
      </div>
    );
  }

  const doc = found.doc;
  const sections = doc.toc ?? [];

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <PreviewBanner note="This is the content learners see." />

      <ScrollCanvas>
        <div className="max-w-[760px] mx-auto px-4 sm:px-8 pt-10 pb-16 flex flex-col gap-8">
          <h1 className="text-[28px] leading-[36px] font-bold text-foreground">{doc.name}</h1>

          {sections.length === 0 ? (
            <p className="text-[15px] leading-[24px] text-muted-foreground">This document has no content yet.</p>
          ) : (
            sections.map((s, i) => (
              <section key={s.id} className="flex flex-col gap-3">
                <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">{i + 1}. {s.title || "Untitled section"}</h2>
                {s.body && <p className="text-[15px] leading-[26px] text-foreground whitespace-pre-line">{s.body}</p>}

                {s.image?.src && (
                  <figure className="flex flex-col gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image.src} alt={s.image.caption || s.title} className="block w-full max-h-[360px] object-contain rounded-[8px] border border-border bg-surface" />
                    {s.image.caption && <figcaption className="text-[12px] leading-[16px] text-muted-foreground">{s.image.caption}</figcaption>}
                  </figure>
                )}

                {s.points && s.points.length > 0 && (
                  <ul className="flex flex-col gap-1.5 pl-1">
                    {s.points.map((p, k) => (
                      <li key={k} className="flex gap-2.5 text-[15px] leading-[24px] text-foreground">
                        <span aria-hidden className="mt-[9px] w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {s.note && <DocCallout>{s.note}</DocCallout>}

                {s.subsections && s.subsections.length > 0 && (
                  <div className="flex flex-col gap-4 mt-1 pl-4 border-l-2 border-border">
                    {s.subsections.map((sub, j) => (
                      <div key={sub.id} className="flex flex-col gap-2">
                        <h3 className="text-[16px] leading-[24px] font-semibold text-foreground">{i + 1}.{j + 1} {sub.title || "Untitled subsection"}</h3>
                        {sub.body && <p className="text-[15px] leading-[26px] text-foreground whitespace-pre-line">{sub.body}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </ScrollCanvas>
    </div>
  );
}
