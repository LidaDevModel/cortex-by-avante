"use client";

import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { NotFoundState } from "@/components/ui/not-found-state";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { useModules, getAdminModule } from "@/lib/training-store";
import { MODULE_CHAPTERS } from "@/lib/training-mock";

export default function AdminModulePreviewPage() {
  const { id } = useParams<{ id: string }>();
  useModules();
  const m = getAdminModule(id);

  if (!m) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden">
        <PreviewBanner note="Module preview" />
        <NotFoundState title="Module not found" description="This module may have been removed." actionLabel="Back to modules" actionHref="/admin/content/training" />
      </div>
    );
  }

  // Authored chapters when present; otherwise the shared canonical set (no final quiz).
  const chapters = m.authoredChapters ?? MODULE_CHAPTERS.filter((c) => !c.isFinalQuiz);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <PreviewBanner note="This is the content learners see." />

      <ScrollCanvas>
        <div className="max-w-[760px] mx-auto px-4 sm:px-8 pt-10 pb-16 flex flex-col gap-8">
          <h1 className="text-[28px] leading-[36px] font-bold text-foreground">{m.title}</h1>

          {chapters.length === 0 ? (
            <p className="text-[15px] leading-[24px] text-muted-foreground">This module has no chapters yet.</p>
          ) : (
            chapters.map((c, i) => (
              <section key={c.id} className="flex flex-col gap-3">
                <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Chapter {i + 1}: {c.title || "Untitled chapter"}</h2>
                {c.body && <p className="text-[15px] leading-[26px] text-foreground whitespace-pre-line">{c.body}</p>}

                {c.subchapters && c.subchapters.length > 0 && (
                  <div className="flex flex-col gap-4 mt-1 pl-4 border-l-2 border-border">
                    {c.subchapters.map((sub, j) => (
                      <div key={sub.id} className="flex flex-col gap-2">
                        <h3 className="text-[16px] leading-[24px] font-semibold text-foreground">{i + 1}.{j + 1} {sub.title || "Untitled subchapter"}</h3>
                        {sub.body && <p className="text-[15px] leading-[26px] text-foreground whitespace-pre-line">{sub.body}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {c.quiz && (
                  <div className="rounded-[12px] p-4 sm:p-5 flex flex-col gap-3 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
                    <span className="text-[11px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">Knowledge check</span>
                    <p className="text-[15px] leading-[24px] font-medium text-foreground">{c.quiz.question}</p>
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
                            <span className="text-[14px] leading-[20px] text-foreground">{o.text}</span>
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
