"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { NotFoundState } from "@/components/ui/not-found-state";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { resolveBack } from "@/lib/admin-nav";
import { useModules, getAdminModule, moduleChapters } from "@/lib/training-store";

export default function AdminModulePreviewPage() {
  const { id } = useParams<{ id: string }>();
  // Preview now opens in-app, so it needs the same return-param back path
  // every other admin detail screen uses.
  const back = resolveBack(useSearchParams().get("return"), { href: "/admin/content/training", label: "Back to modules" });
  useModules();
  const m = getAdminModule(id);

  if (!m) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden">
        <PreviewBanner note="Module preview" backHref={back.href} backLabel={back.label} />
        <NotFoundState title="Module not found" description="This module may have been removed." actionLabel="Back to modules" actionHref="/admin/content/training" />
      </div>
    );
  }

  // Through the one shared seam, so this preview and the learner reader cannot
  // show different content for the same module. Content only — no final quiz.
  const chapters = moduleChapters(m);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <PreviewBanner note="This is the content learners see." backHref={back.href} backLabel={back.label} />

      <ScrollCanvas>
        <div className="max-w-[760px] mx-auto px-4 sm:px-8 pt-10 pb-16 flex flex-col gap-8">
          <h1 className="type-h1 font-bold text-foreground">{m.title}</h1>

          {chapters.length === 0 ? (
            <p className="type-body text-muted-foreground">This module has no chapters yet.</p>
          ) : (
            chapters.map((c, i) => (
              <section key={c.id} className="flex flex-col gap-3">
                <h2 className="type-h2 font-semibold text-foreground">Chapter {i + 1}: {c.title || "Untitled chapter"}</h2>
                {c.body && <p className="type-body text-foreground whitespace-pre-line">{c.body}</p>}

                {c.subchapters && c.subchapters.length > 0 && (
                  <div className="flex flex-col gap-4 mt-1 pl-4 border-l-2 border-border">
                    {c.subchapters.map((sub, j) => (
                      <div key={sub.id} className="flex flex-col gap-2">
                        <h3 className="type-body font-semibold text-foreground">{i + 1}.{j + 1} {sub.title || "Untitled subchapter"}</h3>
                        {sub.body && <p className="type-body text-foreground whitespace-pre-line">{sub.body}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {c.quiz && (
                  <div className="rounded-[12px] p-4 sm:p-5 flex flex-col gap-3 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
                    <span className="type-caption font-semibold uppercase tracking-wider text-muted-foreground">Knowledge check</span>
                    <p className="type-body font-medium text-foreground">{c.quiz.question}</p>
                    <div className="flex flex-col gap-2">
                      {c.quiz.options.map((o) => {
                        const correct = c.quiz!.correctId === o.id;
                        return (
                          <div key={o.id} className="flex items-center gap-2.5">
                            <span
                              className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                              style={correct ? { borderColor: "var(--primary)", background: "var(--primary)" } : { borderColor: "var(--border)" }}
                            >
                              {correct && <Check size={12} strokeWidth={3} style={{ color: "var(--primary-foreground)" }} />}
                            </span>
                            <span className="type-label text-foreground">{o.text}</span>
                          </div>
                        );
                      })}
                    </div>
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
