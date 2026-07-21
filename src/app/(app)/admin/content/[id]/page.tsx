"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/not-found-state";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";
import { showToast } from "@/components/ui/toast";
import { useGlassHeader } from "@/hooks/use-glass-header";
import { useLibrary, getContentDoc, updateDoc, setDocPublished } from "@/lib/content-store";
import { PublishBadge } from "@/components/admin/publish-badge";
import type { DocImage } from "@/lib/library-mock";
import { ROLE_LABEL, type Role } from "@/lib/user-mock";

const ROLES: Role[] = ["field-agent", "admin"];

type SubDraft = { key: string; title: string; body: string };
type Draft = {
  key: string;
  title: string;
  body: string;
  note?: string;        // highlighted paragraph (DocCallout)
  points: string[];     // bullet points
  image?: DocImage;     // image + caption
  subs: SubDraft[];
};

// Field fill for editor cards — a distinct well against the raised card,
// matching the Category FilterSelect. `!` overrides the Input primitive's
// transparent default; kept mode-aware (light surface / dark input tint).
const FIELD_BG = "!bg-surface dark:!bg-input/30";
const textareaCls =
  "w-full resize-y rounded-[8px] border border-input bg-surface dark:bg-input/30 px-3 py-2 text-[14px] leading-[22px] text-foreground placeholder:text-muted-foreground outline-none transition-[color,box-shadow] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring";
const addLinkCls =
  "self-start flex items-center gap-1.5 text-[13px] font-medium text-primary hover:opacity-70 transition-opacity duration-100";

export default function AdminDocumentEditorPage() {
  const { headerClassName, onScroll } = useGlassHeader();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = useSearchParams().get("new") === "1";
  useLibrary(); // subscribe so a delete elsewhere reflects here
  const found = getContentDoc(id);

  const [mounted, setMounted] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [sections, setSections] = useState<Draft[]>([]);
  const [confirmExit, setConfirmExit] = useState(false);
  const initialRef = useRef("");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (found && !seeded) {
      setName(found.doc.name);
      setRoles(found.doc.roles ?? ["field-agent"]);
      const seededSections: Draft[] = (found.doc.toc ?? []).map((s) => ({
        key: s.id,
        title: s.title,
        body: s.body,
        note: s.note,
        points: s.points ?? [],
        image: s.image,
        subs: (s.subsections ?? []).map((sub) => ({ key: sub.id, title: sub.title, body: sub.body })),
      }));
      // A document with no sections (a fresh one) still opens with the first
      // section present — placeholders, not content — so authoring starts in.
      const initialSections = seededSections.length ? seededSections : [{ key: `s-${Math.random().toString(36).slice(2, 8)}`, title: "", body: "", points: [], subs: [] }];
      const initialRoles = found.doc.roles ?? ["field-agent"];
      setSections(initialSections);
      initialRef.current = JSON.stringify({ name: found.doc.name, roles: initialRoles, sections: initialSections });
      setSeeded(true);
    }
  }, [found, seeded]);

  if (!mounted) return null;
  if (!found) {
    return (
      <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
        <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Content", href: "/admin/content" }, { label: "Library", href: "/admin/content" }, { label: "Not found" }]} className={headerClassName} />
        <NotFoundState title="Document not found" description="This document may have been removed. Return to the content list." actionLabel="Back to content" actionHref="/admin/content" />
      </div>
    );
  }

  function toggleRole(r: Role) {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }
  function addSection() {
    setSections((prev) => [...prev, { key: `s-${Math.random().toString(36).slice(2, 8)}`, title: "", body: "", points: [], subs: [] }]);
  }
  function removeSection(s: Draft) {
    const idx = sections.findIndex((x) => x.key === s.key);
    setSections((prev) => prev.filter((x) => x.key !== s.key));
    if (s.title.trim() || s.body.trim() || s.subs.length || s.note || s.points.length || s.image) {
      showToast({ title: "Section removed", placement: "bottom-right", action: { label: "Undo", onClick: () => setSections((prev) => { const n = [...prev]; n.splice(idx, 0, s); return n; }) } });
    }
  }
  function edit(key: string, patch: Partial<Draft>) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }
  // Bullet points
  function addPoint(key: string) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, points: [...s.points, ""] } : s)));
  }
  function editPoint(key: string, idx: number, text: string) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, points: s.points.map((p, i) => (i === idx ? text : p)) } : s)));
  }
  function removePoint(key: string, idx: number) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, points: s.points.filter((_, i) => i !== idx) } : s)));
  }
  // Image (device upload → data-URL)
  function pickImage(key: string, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast({ title: "Couldn't attach file", description: "Attach an image or a document (PDF, Word, or text)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => edit(key, { image: { src: String(reader.result), caption: "" } });
    reader.readAsDataURL(file);
  }
  // Subsections
  function addSub(sectionKey: string) {
    setSections((prev) => prev.map((s) => (s.key === sectionKey ? { ...s, subs: [...s.subs, { key: `sub-${Math.random().toString(36).slice(2, 8)}`, title: "", body: "" }] } : s)));
  }
  function removeSub(sectionKey: string, sub: SubDraft) {
    const sec = sections.find((s) => s.key === sectionKey);
    const idx = sec ? sec.subs.findIndex((x) => x.key === sub.key) : -1;
    setSections((prev) => prev.map((s) => (s.key === sectionKey ? { ...s, subs: s.subs.filter((x) => x.key !== sub.key) } : s)));
    if (sub.title.trim() || sub.body.trim()) {
      showToast({ title: "Subsection removed", placement: "bottom-right", action: { label: "Undo", onClick: () => setSections((prev) => prev.map((s) => (s.key === sectionKey ? { ...s, subs: (() => { const n = [...s.subs]; n.splice(idx, 0, sub); return n; })() } : s))) } });
    }
  }
  function editSub(sectionKey: string, subKey: string, patch: Partial<SubDraft>) {
    setSections((prev) => prev.map((s) => (s.key === sectionKey ? { ...s, subs: s.subs.map((x) => (x.key === subKey ? { ...x, ...patch } : x)) } : s)));
  }
  function snapshot() {
    return JSON.stringify({ name, roles, sections });
  }
  function handleCancel() {
    if (snapshot() === initialRef.current) router.push("/admin/content");
    else setConfirmExit(true);
  }
  function saveAll() {
    updateDoc(id, {
      name: name.trim() || found!.doc.name,
      roles,
      toc: sections.map((s, i) => {
        const points = s.points.map((p) => p.trim()).filter(Boolean);
        return {
          id: s.key,
          num: String(i + 1),
          title: s.title,
          page: i + 1,
          body: s.body,
          ...(s.note && s.note.trim() ? { note: s.note.trim() } : {}),
          ...(points.length ? { points } : {}),
          ...(s.image?.src ? { image: { src: s.image.src, caption: s.image.caption?.trim() || undefined } } : {}),
          subsections: s.subs.map((sub) => ({ id: sub.key, title: sub.title, body: sub.body })),
        };
      }),
    });
    initialRef.current = snapshot();
    showToast({ title: "Saved", description: "The document was updated." });
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Admin", href: "/admin" }, { label: "Content", href: "/admin/content" }, { label: "Library", href: "/admin/content" }, { label: found.doc.name }]} className={headerClassName} />

      <ScrollCanvas onScroll={onScroll}>
        <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] leading-[30px] sm:text-[28px] sm:leading-[36px] font-bold text-foreground">{isNew ? "Create document" : "Edit document"}</h1>
              <PublishBadge published={found.doc.published !== false} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="cta"
                variant="outline"
                onClick={() => {
                  const next = found!.doc.published === false;
                  setDocPublished(id, next);
                  showToast(next
                    ? { title: "Published", description: "This document is now visible to learners." }
                    : { title: "Moved to draft", description: "This document is no longer visible to learners." });
                }}
              >
                {found.doc.published !== false ? "Unpublish" : "Publish"}
              </Button>
              <Button size="cta" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button size="cta" onClick={saveAll}>Save changes</Button>
            </div>
          </div>

          <section className="rounded-[12px] p-4 sm:p-6 flex flex-col gap-5 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] leading-[20px] font-semibold text-foreground">Document name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} className={FIELD_BG} />
            </label>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-[20px] font-semibold text-foreground">Roles</span>
                <span className="text-[12px] leading-[16px] text-muted-foreground">Who this document is for.</span>
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
          </section>

          <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Sections</h2>

          {sections.map((s, i) => (
            <section key={s.key} className="rounded-[12px] p-4 sm:p-5 flex flex-col gap-3 bg-surface-raised" style={{ border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">Section {i + 1}</span>
                <button onClick={() => removeSection(s)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors duration-100" aria-label="Remove section">
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
              <Input value={s.title} onChange={(e) => edit(s.key, { title: e.target.value })} placeholder="Section title" className={FIELD_BG} />
              <textarea value={s.body} onChange={(e) => edit(s.key, { body: e.target.value })} placeholder="Section body" className={`${textareaCls} min-h-[120px]`} />

              {/* Image + caption */}
              {s.image ? (
                <div className="flex flex-col gap-2">
                  <div className="relative rounded-[8px] overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image.src} alt={s.image.caption || "Section image"} className="block w-full max-h-[280px] object-contain bg-surface" />
                    <button onClick={() => edit(s.key, { image: undefined })} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-surface/90 text-muted-foreground hover:text-destructive transition-colors duration-100" aria-label="Remove image">
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                  <Input value={s.image.caption ?? ""} onChange={(e) => edit(s.key, { image: { src: s.image!.src, caption: e.target.value } })} placeholder="Image caption" className={FIELD_BG} />
                </div>
              ) : (
                <label className={`${addLinkCls} cursor-pointer`}>
                  <ImagePlus size={14} strokeWidth={1.5} /> Add image
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { pickImage(s.key, e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              )}

              {/* Bullet points */}
              {s.points.length > 0 && (
                <div className="flex flex-col gap-2">
                  {s.points.map((p, k) => (
                    <div key={k} className="flex items-center gap-2.5">
                      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                      <Input value={p} onChange={(e) => editPoint(s.key, k, e.target.value)} placeholder={`Point ${k + 1}`} className={`flex-1 ${FIELD_BG}`} />
                      <button onClick={() => removePoint(s.key, k)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors duration-100 shrink-0" aria-label={`Remove point ${k + 1}`}>
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => addPoint(s.key)} className={addLinkCls}>
                <Plus size={14} strokeWidth={1.5} /> Add point
              </button>

              {/* Highlighted paragraph (callout) */}
              {s.note !== undefined ? (
                <div className="flex flex-col gap-2 pl-3 border-l-[3px]" style={{ borderColor: "var(--doc-callout-border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">Highlighted paragraph</span>
                    <button onClick={() => edit(s.key, { note: undefined })} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors duration-100" aria-label="Remove highlighted paragraph">
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                  <textarea value={s.note} onChange={(e) => edit(s.key, { note: e.target.value })} placeholder="Highlighted paragraph" className={`${textareaCls} min-h-[70px] italic`} />
                </div>
              ) : (
                <button onClick={() => edit(s.key, { note: "" })} className={addLinkCls}>
                  <Plus size={14} strokeWidth={1.5} /> Add highlighted paragraph
                </button>
              )}

              {/* Subsections */}
              <div className="flex flex-col gap-3 mt-1 pl-4 border-l-2 border-border">
                {s.subs.map((sub, j) => (
                  <div key={sub.key} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] leading-[16px] font-semibold uppercase tracking-wider text-muted-foreground">Subsection {i + 1}.{j + 1}</span>
                      <button onClick={() => removeSub(s.key, sub)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors duration-100" aria-label="Remove subsection">
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                    <Input value={sub.title} onChange={(e) => editSub(s.key, sub.key, { title: e.target.value })} placeholder="Subsection title" className={FIELD_BG} />
                    <textarea value={sub.body} onChange={(e) => editSub(s.key, sub.key, { body: e.target.value })} placeholder="Subsection body" className={`${textareaCls} min-h-[90px]`} />
                  </div>
                ))}
                <button onClick={() => addSub(s.key)} className={addLinkCls}>
                  <Plus size={14} strokeWidth={1.5} /> Add subsection
                </button>
              </div>
            </section>
          ))}

          <button onClick={addSection} className="self-start flex items-center gap-2 h-9 px-3 rounded-[8px] text-[13px] font-semibold border border-primary text-primary transition-opacity duration-100 hover:opacity-70">
            <Plus size={16} strokeWidth={1.5} /> Add section
          </button>
        </div>
      </ScrollCanvas>

      <ExitConfirmDialog
        open={confirmExit}
        onOpenChange={setConfirmExit}
        title="Discard changes?"
        description="Your changes haven't been saved. Leaving now will discard them."
        exitLabel="Discard changes"
        cancelLabel="Keep editing"
        onExit={() => { setConfirmExit(false); router.push("/admin/content"); }}
      />
    </div>
  );
}
