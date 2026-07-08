"use client";

import { useState, useRef } from "react";
import { Pencil } from "lucide-react";

export function UserMessage({ content, onEdit }: { content: string; onEdit: (newContent: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startEdit() {
    setDraft(content);
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.value.length;
        autoResize(textareaRef.current);
      }
    }, 0);
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  function handleSave() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== content) onEdit(trimmed);
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(content);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex justify-end">
        <div className="w-[85%] rounded-2xl px-4 pt-3 pb-3 flex flex-col gap-3 bg-surface-raised">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => { setDraft(e.target.value); autoResize(e.target); }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); }
              if (e.key === "Escape") handleCancel();
            }}
            rows={1}
            className="w-full resize-none bg-transparent text-[15px] leading-[24px] text-foreground outline-none focus:ring-1 focus:ring-primary/30 rounded-lg px-1 -mx-1"
            style={{ overflow: "hidden" }}
          />
          <div className="flex justify-end items-center gap-2">
            <button
              onClick={handleCancel}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 px-3 py-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!draft.trim()}
              className="text-[13px] font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-lg disabled:opacity-50 transition-opacity duration-100"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 group" style={{ animation: "msg-in 200ms ease-out both" }}>
      <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-[24px] text-foreground break-words bg-surface-raised">
        {content}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
        <button
          onClick={startEdit}
          aria-label="Edit message"
          className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          <Pencil size={14} />
        </button>
      </div>
    </div>
  );
}
