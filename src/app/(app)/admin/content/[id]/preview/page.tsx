"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { NotFoundState } from "@/components/ui/not-found-state";
import { DocCallout } from "@/components/library/DocCallout";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { resolveBack } from "@/lib/admin-nav";
import { useLibrary, getContentDoc } from "@/lib/content-store";

export default function AdminDocumentPreviewPage() {
  const { id } = useParams<{ id: string }>();
  // Preview now opens in-app, so it needs the same return-param back path
  // every other admin detail screen uses.
  const back = resolveBack(useSearchParams().get("return"), { href: "/admin/content", label: "Back to Library" });
  useLibrary(); // subscribe so edits reflect
  const found = getContentDoc(id);

  if (!found) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden">
        <PreviewBanner note="Document preview" backHref={back.href} backLabel={back.label} />
        <NotFoundState title="Document not found" description="This document may have been removed." actionLabel="Back to content" actionHref="/admin/content" />
      </div>
    );
  }

  const doc = found.doc;
  const sections = doc.toc ?? [];

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <PreviewBanner note="This is the content learners see." backHref={back.href} backLabel={back.label} />

      <ScrollCanvas>
        <div className="container-read pt-10 pb-16 flex flex-col gap-8">
          <h1 className="type-h1 font-bold text-foreground">{doc.name}</h1>

          {sections.length === 0 ? (
            <p className="type-body text-muted-foreground">This document has no content yet.</p>
          ) : (
            sections.map((s, i) => (
              <section key={s.id} className="flex flex-col gap-3">
                <h2 className="type-h2 font-semibold text-foreground">{i + 1}. {s.title || "Untitled section"}</h2>
                {s.body && <p className="type-body text-foreground whitespace-pre-line">{s.body}</p>}

                {s.image?.src && (
                  <figure className="flex flex-col gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image.src} alt={s.image.caption || s.title} className="block w-full max-h-[360px] object-contain rounded-[8px] border border-border bg-surface" />
                    {s.image.caption && <figcaption className="type-caption text-muted-foreground">{s.image.caption}</figcaption>}
                  </figure>
                )}

                {s.points && s.points.length > 0 && (
                  <ul className="flex flex-col gap-1.5 pl-1">
                    {s.points.map((p, k) => (
                      <li key={k} className="flex gap-2.5 type-body text-foreground">
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
                        <h3 className="type-body font-semibold text-foreground">{i + 1}.{j + 1} {sub.title || "Untitled subsection"}</h3>
                        {sub.body && <p className="type-body text-foreground whitespace-pre-line">{sub.body}</p>}
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
