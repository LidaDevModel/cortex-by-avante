"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Switch } from "@/components/ui/switch";
import { NotFoundState } from "@/components/ui/not-found-state";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { showToast } from "@/components/ui/toast";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useModules, getAdminModule, updateModule, updateChapters, setModulePublished, CATEGORY_OPTIONS } from "@/lib/training-store";
import { PublishBadge } from "@/components/admin/publish-badge";
import { MODULE_CHAPTERS, type ModuleCategory, type Chapter, type Quiz } from "@/lib/training-mock";
import { ROLE_LABEL, type Role } from "@/lib/user-mock";

const ROLES: Role[] = ["field-agent", "admin"];

// Field fill for editor cards — a distinct well against the raised card.
// `!` overrides the Input primitive's transparent default; mode-aware.
const FIELD_BG = "!bg-surface dark:!bg-input/30";

// Draft carries the existing quiz opaquely. num is reassigned on save.
type SubDraft = { key: string; title: string; body: string };
type ChapterDraft = { key: string; title: string; body: string; subs: SubDraft[]; quiz?: Quiz };

function seedChapters(m: { authoredChapters?: Chapter[] }): ChapterDraft[] {
  // A module with its own authored chapters uses those; otherwise the shared
  // canonical set (minus the final-quiz entry, which is the exam engine).
  const source = m.authoredChapters ?? MODULE_CHAPTERS.filter((c) => !c.isFinalQuiz);
  const seeded = source.map((c) => ({
    key: c.id,
    title: c.title,
    body: c.body,
    subs: (c.subchapters ?? []).map((s) => ({ key: s.id, title: s.title, body: s.body })),
    quiz: c.quiz,
  }));
  // A module with no chapters (a fresh one) still opens with the first chapter
  // present — placeholders, not content — so authoring starts one field in.
  return seeded.length ? seeded : [{ key: `c-${Math.random().toString(36).slice(2, 8)}`, title: "", body: "", subs: [] }];
}

export default function AdminModuleEditorPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  // Arrived from a list (e.g. the activity log)? Cancel / Save / (Un)publish
  // drive back there instead of the module list. Validated internal path.
  const returnParam = searchParams.get("return");
  const returnTo = returnParam && returnParam.startsWith("/") && !returnParam.startsWith("//") ? returnParam : null;
  const backHref = returnTo ?? "/admin/content/training";
  useModules();
  const found = getAdminModule(id);

  const [mounted, setMounted] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ModuleCategory>("incidents");
  const [required, setRequired] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const initialRef = useRef("");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (found && !seeded) {
      const seededCh = seedChapters(found);
      setTitle(found.title);
      setCategory(found.category);
      setRequired(found.required);
      setRoles(found.roles);
      setChapters(seededCh);
      initialRef.current = JSON.stringify({ title: found.title, category: found.category, required: found.required, roles: found.roles, chapters: seededCh });
      setSeeded(true);
    }
  }, [found, seeded]);

  if (!mounted) return null;
  if (!found) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
        <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Content", href: "/admin/content" }, { label: "Modules", href: "/admin/content/training" }, { label: "Not found" }]} className={headerClassName} />
        <NotFoundState title="Module not found" description="This module may have been removed. Return to the training list." actionLabel="Back to training" actionHref="/admin/content/training" />
      </div>
    );
  }

  function toggleRole(r: Role) {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }
  function addChapter() {
    setChapters((prev) => [...prev, { key: `c-${Math.random().toString(36).slice(2, 8)}`, title: "", body: "", subs: [] }]);
  }
  function removeChapter(c: ChapterDraft) {
    const idx = chapters.findIndex((x) => x.key === c.key);
    setChapters((prev) => prev.filter((x) => x.key !== c.key));
    if (c.title.trim() || c.body.trim() || c.subs.length || c.quiz) {
      showToast({ title: "Chapter removed", action: { label: "Undo", onClick: () => setChapters((prev) => { const n = [...prev]; n.splice(idx, 0, c); return n; }) } });
    }
  }
  function editChapter(key: string, patch: Partial<ChapterDraft>) {
    setChapters((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }
  function addSub(chapterKey: string) {
    setChapters((prev) => prev.map((c) => (c.key === chapterKey ? { ...c, subs: [...c.subs, { key: `sub-${Math.random().toString(36).slice(2, 8)}`, title: "", body: "" }] } : c)));
  }
  function removeSub(chapterKey: string, s: SubDraft) {
    const chap = chapters.find((c) => c.key === chapterKey);
    const idx = chap ? chap.subs.findIndex((x) => x.key === s.key) : -1;
    setChapters((prev) => prev.map((c) => (c.key === chapterKey ? { ...c, subs: c.subs.filter((x) => x.key !== s.key) } : c)));
    if (s.title.trim() || s.body.trim()) {
      showToast({ title: "Subchapter removed", action: { label: "Undo", onClick: () => setChapters((prev) => prev.map((c) => (c.key === chapterKey ? { ...c, subs: (() => { const n = [...c.subs]; n.splice(idx, 0, s); return n; })() } : c))) } });
    }
  }
  function editSub(chapterKey: string, subKey: string, patch: Partial<SubDraft>) {
    setChapters((prev) => prev.map((c) => (c.key === chapterKey ? { ...c, subs: c.subs.map((s) => (s.key === subKey ? { ...s, ...patch } : s)) } : c)));
  }
  function optId() {
    return `o-${Math.random().toString(36).slice(2, 8)}`;
  }
  function addQuiz(key: string) {
    const a = optId();
    editChapter(key, { quiz: { question: "", options: [{ id: a, text: "" }, { id: optId(), text: "" }], correctId: a } });
  }
  function removeQuiz(c: ChapterDraft) {
    const quiz = c.quiz;
    editChapter(c.key, { quiz: undefined });
    if (quiz && (quiz.question.trim() || quiz.options.some((o) => o.text.trim()))) {
      showToast({ title: "Knowledge check removed", action: { label: "Undo", onClick: () => editChapter(c.key, { quiz }) } });
    }
  }
  function editQuiz(key: string, patch: Partial<Quiz>) {
    setChapters((prev) => prev.map((c) => (c.key === key && c.quiz ? { ...c, quiz: { ...c.quiz, ...patch } } : c)));
  }
  function addOption(key: string) {
    setChapters((prev) => prev.map((c) => (c.key === key && c.quiz ? { ...c, quiz: { ...c.quiz, options: [...c.quiz.options, { id: optId(), text: "" }] } } : c)));
  }
  function removeOption(key: string, id: string) {
    setChapters((prev) => prev.map((c) => {
      if (c.key !== key || !c.quiz) return c;
      const options = c.quiz.options.filter((o) => o.id !== id);
      // Correct answer must always point at a live option.
      const correctId = c.quiz.correctId === id ? options[0].id : c.quiz.correctId;
      return { ...c, quiz: { ...c.quiz, options, correctId } };
    }));
  }
  function editOption(key: string, id: string, text: string) {
    setChapters((prev) => prev.map((c) => (c.key === key && c.quiz ? { ...c, quiz: { ...c.quiz, options: c.quiz.options.map((o) => (o.id === id ? { ...o, text } : o)) } } : c)));
  }
  function snapshot() {
    return JSON.stringify({ title, category, required, roles, chapters });
  }
  // A saveable module needs a title and at least one chapter with real content.
  const hasContent =
    title.trim().length > 0 &&
    chapters.some((c) => c.title.trim() || c.body.trim() || !!c.quiz || c.subs.some((s) => s.title.trim() || s.body.trim()));
  function handleExit() {
    // Nothing unsaved → leave straight away; otherwise confirm the discard.
    if (snapshot() === initialRef.current) router.push(backHref);
    else setConfirmExit(true);
  }
  function saveAll() {
    updateModule(id, { title: title.trim() || found!.title, category, required, roles });
    updateChapters(
      id,
      chapters.map((c, i) => ({
        id: c.key,
        num: i + 1,
        title: c.title,
        body: c.body,
        subchapters: c.subs.map((s) => ({ id: s.key, title: s.title, body: s.body })),
        quiz: c.quiz,
      })),
    );
    initialRef.current = snapshot();
    showToast({ title: "Saved", description: "The module was updated." });
    leaveAfterWrite();
  }
  function applyPublish(next: boolean) {
    setModulePublished(id, next);
    const undo = { label: "Undo", onClick: () => setModulePublished(id, !next) };
    showToast(next
      ? { title: "Published", description: "This module is now visible to learners.", action: undo }
      : { title: "Moved to draft", description: "This module is no longer visible to learners.", action: undo });
    leaveAfterWrite();
  }
  // After a write: return to a flag review if we came from one, or send a
  // brand-new module to the list. An existing edit stays on the editor.
  function leaveAfterWrite() {
    if (returnTo) router.push(returnTo);
    else if (isNew) router.push("/admin/content/training");
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Content", href: "/admin/content" }, { label: "Modules", href: "/admin/content/training" }, { label: found.title }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">{isNew ? "Create module" : "Edit module"}</h1>
              <PublishBadge published={found.published !== false} />
            </div>
            <div className="flex items-center gap-2">
              {!hasContent && (
                <span className="hidden md:inline text-[12px] leading-[16px] text-muted-foreground self-center mr-1">Add content to save or publish</span>
              )}
              <Button size="cta" variant="ghost" onClick={handleExit}>Exit</Button>
              <Button
                size="cta"
                variant="outline"
                disabled={!hasContent}
                onClick={() => {
                  // Unpublish pulls live content from learners — confirm first.
                  if (found!.published !== false) setConfirmUnpublish(true);
                  else applyPublish(true);
                }}
              >
                {found.published !== false ? "Unpublish" : "Publish"}
              </Button>
              <Button size="cta" onClick={saveAll} disabled={!hasContent}>{isNew ? "Save" : "Save changes"}</Button>
            </div>
          </div>

          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-5 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] leading-[20px] font-semibold text-foreground">Title</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD_BG} />
            </label>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[14px] leading-[20px] font-semibold text-foreground">Category</span>
              <FilterSelect value={category} onChange={(v) => setCategory(v as ModuleCategory)} options={CATEGORY_OPTIONS} />
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-[20px] font-semibold text-foreground">Roles</span>
                <span className="text-[12px] leading-[16px] text-muted-foreground">Who this module is for.</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {ROLES.map((r) => {
                  const on = roles.includes(r);
                  return (
                    <button
                      key={r}
                      onClick={() => toggleRole(r)}
                      className="px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors duration-100"
                      style={on
                        ? { background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderColor: "var(--primary)", color: "var(--primary)" }
                        : { background: "transparent", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      {ROLE_LABEL[r]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-[20px] font-semibold text-foreground">Required</span>
                <span className="text-[12px] leading-[16px] text-muted-foreground">Counts toward shift readiness.</span>
              </div>
              <Switch checked={required} onCheckedChange={setRequired} />
            </div>
          </section>

          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Chapters</h2>

          {chapters.map((c, i) => (
              <section key={c.key} className="rounded-[12px] p-4 sm:p-5 flex flex-col gap-3 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">Chapter {i + 1}</span>
                  <button onClick={() => removeChapter(c)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors duration-100" aria-label="Remove chapter">
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
                <Input value={c.title} onChange={(e) => editChapter(c.key, { title: e.target.value })} placeholder="Chapter title" className={FIELD_BG} />
                <textarea
                  value={c.body}
                  onChange={(e) => editChapter(c.key, { body: e.target.value })}
                  placeholder="Chapter body"
                  className="w-full min-h-[140px] resize-y rounded-[8px] border border-input bg-surface dark:bg-input/30 px-3 py-2 text-[14px] leading-[22px] text-foreground placeholder:text-muted-foreground outline-none transition-[color,box-shadow] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
                />

                {/* Subchapters — nested title + body blocks within the chapter. */}
                <div className="flex flex-col gap-3 mt-1 pl-4 border-l-2 border-border">
                  {c.subs.map((s, j) => (
                    <div key={s.key} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">Subchapter {i + 1}.{j + 1}</span>
                        <button onClick={() => removeSub(c.key, s)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors duration-100" aria-label="Remove subchapter">
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <Input value={s.title} onChange={(e) => editSub(c.key, s.key, { title: e.target.value })} placeholder="Subchapter title" className={FIELD_BG} />
                      <textarea
                        value={s.body}
                        onChange={(e) => editSub(c.key, s.key, { body: e.target.value })}
                        placeholder="Subchapter body"
                        className="w-full min-h-[90px] resize-y rounded-[8px] border border-input bg-surface dark:bg-input/30 px-3 py-2 text-[14px] leading-[22px] text-foreground placeholder:text-muted-foreground outline-none transition-[color,box-shadow] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
                      />
                    </div>
                  ))}
                  <button onClick={() => addSub(c.key)} className="self-start flex items-center gap-1.5 text-[13px] font-medium text-primary hover:opacity-70 transition-opacity duration-100">
                    <Plus size={14} strokeWidth={1.5} /> Add subchapter
                  </button>
                </div>

                {/* Knowledge check — one multiple-choice question per chapter. */}
                <div className="flex flex-col gap-3 mt-1 pl-4 border-l-2 border-border">
                  {!c.quiz ? (
                    <button onClick={() => addQuiz(c.key)} className="self-start flex items-center gap-1.5 text-[13px] font-medium text-primary hover:opacity-70 transition-opacity duration-100">
                      <Plus size={14} strokeWidth={1.5} /> Add knowledge check
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">Knowledge check</span>
                        <button onClick={() => removeQuiz(c)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors duration-100" aria-label="Remove knowledge check">
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <Input value={c.quiz.question} onChange={(e) => editQuiz(c.key, { question: e.target.value })} placeholder="Question" className={FIELD_BG} />
                      <span className="text-[12px] leading-[16px] text-muted-foreground">Select the correct answer.</span>
                      <div className="flex flex-col gap-2">
                        {c.quiz.options.map((o, k) => {
                          const correct = c.quiz!.correctId === o.id;
                          return (
                            <div key={o.id} className="flex items-center gap-2.5">
                              <button
                                onClick={() => editQuiz(c.key, { correctId: o.id })}
                                aria-label={`Mark option ${k + 1} as correct`}
                                aria-pressed={correct}
                                className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-100"
                                style={correct ? { borderColor: "var(--primary)", background: "var(--primary)" } : { borderColor: "var(--border)" }}
                              >
                                {correct && <Check size={12} strokeWidth={3} style={{ color: "var(--primary-foreground)" }} />}
                              </button>
                              <Input value={o.text} onChange={(e) => editOption(c.key, o.id, e.target.value)} placeholder={`Option ${k + 1}`} className={`flex-1 ${FIELD_BG}`} />
                              {c.quiz!.options.length > 2 && (
                                <button onClick={() => removeOption(c.key, o.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors duration-100 shrink-0" aria-label={`Remove option ${k + 1}`}>
                                  <Trash2 size={14} strokeWidth={1.5} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {c.quiz.options.length < 6 && (
                        <button onClick={() => addOption(c.key)} className="self-start flex items-center gap-1.5 text-[13px] font-medium text-primary hover:opacity-70 transition-opacity duration-100">
                          <Plus size={14} strokeWidth={1.5} /> Add option
                        </button>
                      )}
                    </>
                  )}
                </div>
              </section>
          ))}

          <button onClick={addChapter} className="self-start flex items-center gap-2 h-9 px-3 rounded-[8px] text-[13px] font-semibold border border-primary text-primary transition-opacity duration-100 hover:opacity-70">
            <Plus size={16} strokeWidth={1.5} /> Add chapter
          </button>
        </div>
      </ScrollCanvas>

      <ExitConfirmDialog
        open={confirmExit}
        onOpenChange={setConfirmExit}
        title="Exit without saving?"
        description="Your changes haven't been saved and will be lost."
        exitLabel="Exit without saving"
        cancelLabel="Keep editing"
        onExit={() => { setConfirmExit(false); router.push(backHref); }}
      />

      <ExitConfirmDialog
        open={confirmUnpublish}
        onOpenChange={setConfirmUnpublish}
        title="Unpublish this module?"
        description="It will no longer be visible to learners until you publish it again."
        exitLabel="Unpublish"
        cancelLabel="Cancel"
        onExit={() => { setConfirmUnpublish(false); applyPublish(false); }}
      />
    </div>
  );
}
