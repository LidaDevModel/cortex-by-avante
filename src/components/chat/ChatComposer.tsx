"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, ArrowUp, Square, X, Check, Paperclip } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { showToast } from "@/components/ui/toast";
import { AttachmentChip, type Attachment } from "@/components/chat/AttachmentChip";
import { DetailDial } from "@/components/chat/DetailDial";
import { type DetailLevel } from "@/lib/chat-mock";

const MAX_HEIGHT = 160;
const LINE_HEIGHT = 24;
const DEFAULT_PLACEHOLDER = "Ask anything about protocols, procedures, or guidelines...";
const DEFAULT_DICTATION = "What are the standard patrol protocols for the night shift?";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];

// ─── Waveform ────────────────────────────────────────────────────────────────

function randomBarHeight() {
  const r = Math.random();
  if (r < 0.12) return 3;
  if (r < 0.30) return 6;
  if (r < 0.55) return 8;
  if (r < 0.72) return 10;
  if (r < 0.87) return 12;
  return 14;
}

function Waveform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState(40);
  const [recorded, setRecorded] = useState<number[]>([]);

  useEffect(() => {
    if (containerRef.current) {
      setSlots(Math.floor(containerRef.current.offsetWidth / 5));
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setRecorded(prev => {
        const next = [...prev, randomBarHeight()];
        return next.length > slots ? next.slice(-slots) : next;
      });
    }, 110);
    return () => clearInterval(id);
  }, [slots]);

  const dotCount = Math.max(0, slots - recorded.length);

  return (
    <div ref={containerRef} className="flex-1 flex items-center h-10 min-w-0 gap-[3px] overflow-hidden">
      {Array.from({ length: dotCount }).map((_, i) => (
        <div key={`d${i}`} className="w-[2px] h-[2px] rounded-full shrink-0 bg-foreground/30" />
      ))}
      {recorded.map((h, i) => (
        <div key={`b${i}`} className="w-[2px] rounded-full shrink-0 bg-foreground" style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}

// ─── Composer ───────────────────────────────────────────────────────────────

type Props = {
  /** Called with the trimmed text and any attachments when the user sends. The composer clears itself. */
  onSubmit: (text: string, attachments: Attachment[]) => void;
  /** When true, the send affordance becomes a stop button and the field yields. */
  isResponding?: boolean;
  /** Called when the user taps stop during a response. */
  onStop?: () => void;
  placeholder?: string;
  /** Text inserted when a dictation is confirmed (mocked voice input). */
  dictationText?: string;
  /** Whether the paperclip / file-attach affordance is available (off on the dashboard launcher). */
  enableAttachments?: boolean;
  /** When both are provided, the answer-detail dial renders in the toolbar. */
  detailLevel?: DetailLevel;
  onDetailLevelChange?: (level: DetailLevel) => void;
  /** Prefill the input (e.g. editing a past message). A changed `token` re-applies. */
  draft?: { text: string; token: number };
};

/**
 * The Cortex chat input widget — a two-row composer: an autosizing textarea on
 * top, and a toolbar row below (attach on the left; detail dial · dictation ·
 * send on the right). Supports file/photo attachments (paperclip · drag-drop ·
 * paste) and mock voice dictation. Extracted from the chat screen so the same
 * input can be reused elsewhere (e.g. the dashboard "Ask Cortex" entry).
 */
export function ChatComposer({
  onSubmit,
  isResponding = false,
  onStop,
  placeholder = DEFAULT_PLACEHOLDER,
  dictationText = DEFAULT_DICTATION,
  enableAttachments = true,
  detailLevel,
  onDetailLevelChange,
  draft,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(LINE_HEIGHT);
  const [taCanScrollUp, setTaCanScrollUp] = useState(false);
  const [taCanScrollDown, setTaCanScrollDown] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dictationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dictationBaseRef = useRef(""); // text present before dictation started
  const preRecordValueRef = useRef(""); // full value to restore on cancel

  const hasText = inputValue.trim().length > 0;
  const canSend = hasText || attachments.length > 0;
  const isScrollable = textareaHeight >= MAX_HEIGHT;

  const updateTaScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    setTaCanScrollUp(ta.scrollTop > 4);
    setTaCanScrollDown(ta.scrollTop + ta.clientHeight < ta.scrollHeight - 4);
  };

  const recalcHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    // Empty field pins to one line: scrollHeight includes the wrapped
    // placeholder on narrow screens, which would inflate the field past its row.
    const next = inputValue ? Math.min(ta.scrollHeight, MAX_HEIGHT) : LINE_HEIGHT;
    ta.style.height = `${next}px`;
    setTextareaHeight(next);
    updateTaScroll();
  };

  useEffect(() => {
    recalcHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  // Prefill from an edited message — set the text and focus with the caret at
  // the end. Keyed on token so re-editing the same text re-applies.
  useEffect(() => {
    if (!draft) return;
    setInputValue(draft.text);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = ta.value.length;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.token]);

  // Release any object URLs held for image previews on unmount.
  useEffect(() => {
    return () => {
      attachments.forEach((a) => a.url && URL.revokeObjectURL(a.url));
      if (dictationTimerRef.current) clearInterval(dictationTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    if (incoming.length === 0) return;
    const accepted: Attachment[] = [];
    for (const file of incoming) {
      const isImage = file.type.startsWith("image/");
      const isDoc = DOC_TYPES.includes(file.type);
      if (!isImage && !isDoc) {
        showToast({ title: "Couldn't attach file", description: "Attach an image or a document (PDF, Word, or text)." });
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        showToast({ title: "Couldn't attach file", description: "Files must be under 10 MB." });
        continue;
      }
      accepted.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        kind: isImage ? "image" : "file",
        url: isImage ? URL.createObjectURL(file) : undefined,
      });
    }
    if (accepted.length > 0) setAttachments((prev) => [...prev, ...accepted]);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const gone = prev.find((a) => a.id === id);
      if (gone?.url) URL.revokeObjectURL(gone.url);
      return prev.filter((a) => a.id !== id);
    });
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ""; // let the same file be picked again
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    if (!enableAttachments) return;
    const imageFiles = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length > 0) addFiles(imageFiles);
  }

  function handleDrop(e: React.DragEvent) {
    if (!enableAttachments) return;
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function submit() {
    const text = inputValue.trim();
    if (!text && attachments.length === 0) return;
    onSubmit(text, attachments);
    setInputValue("");
    setAttachments([]); // ownership passes to the sent message; URLs live on there
  }

  // Start dictation: the transcript types itself into the input, word by word,
  // while the waveform runs in the toolbar. (Mock of live speech-to-text.)
  function startDictation() {
    if (isResponding) return;
    preRecordValueRef.current = inputValue;
    const base = inputValue.trim() ? inputValue.replace(/\s+$/, "") + " " : "";
    dictationBaseRef.current = base;
    setInputValue(base);
    setIsRecording(true);
    const words = dictationText.split(" ");
    let k = 0;
    if (dictationTimerRef.current) clearInterval(dictationTimerRef.current);
    dictationTimerRef.current = setInterval(() => {
      k += 1;
      setInputValue(base + words.slice(0, k).join(" "));
      if (k >= words.length && dictationTimerRef.current) {
        clearInterval(dictationTimerRef.current);
        dictationTimerRef.current = null;
      }
    }, 170);
  }

  function confirmDictation() {
    if (dictationTimerRef.current) clearInterval(dictationTimerRef.current);
    setInputValue(dictationBaseRef.current + dictationText); // accept the full transcript
    setIsRecording(false);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length; }
    });
  }

  function cancelDictation() {
    if (dictationTimerRef.current) clearInterval(dictationTimerRef.current);
    setInputValue(preRecordValueRef.current); // restore what was there before
    setIsRecording(false);
  }

  const iconBtn = "w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors";

  return (
    <div
      className="chat-input-shimmer relative w-full rounded-2xl flex flex-col gap-2 p-3"
      style={{
        background: "var(--surface)",
        border: `1px solid ${isDragging ? "var(--ring)" : "var(--input-border)"}`,
        boxShadow: "var(--shadow-input-widget)",
      }}
      onDragOver={enableAttachments ? (e) => { e.preventDefault(); setIsDragging(true); } : undefined}
      onDragLeave={enableAttachments ? (e) => { if (e.currentTarget === e.target) setIsDragging(false); } : undefined}
      onDrop={handleDrop}
    >
      {enableAttachments && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFilePick}
          className="hidden"
        />
      )}

      {/* Row 1 — the text field. During dictation it shows the live transcript
          typing in; the waveform lives in the toolbar below. */}
      <div className="px-1">
        {isResponding ? (
          <div className="h-6" />
        ) : (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder={placeholder}
              className="w-full resize-none bg-transparent text-[16px] leading-[24px] text-foreground outline-none p-0 placeholder:text-muted-foreground placeholder:text-[14px]"
              onScroll={updateTaScroll}
              style={{ maxHeight: `${MAX_HEIGHT}px`, overflowY: isScrollable ? "auto" : "hidden" }}
            />
            <div
              className="absolute left-0 right-2 top-0 h-8 pointer-events-none transition-opacity duration-200"
              style={{ background: "linear-gradient(to bottom, var(--surface) 20%, transparent)", opacity: taCanScrollUp ? 1 : 0 }}
            />
            <div
              className="absolute left-0 right-2 bottom-0 h-8 pointer-events-none transition-opacity duration-200"
              style={{ background: "linear-gradient(to top, var(--surface) 20%, transparent)", opacity: taCanScrollDown ? 1 : 0 }}
            />
          </div>
        )}
      </div>

      {/* Attachment tray — between the text and the toolbar */}
      {attachments.length > 0 && !isRecording && (
        <div className="flex flex-wrap gap-2 px-1">
          {attachments.map((a) => (
            <AttachmentChip key={a.id} attachment={a} onRemove={() => removeAttachment(a.id)} />
          ))}
        </div>
      )}

      {/* Row 2 — toolbar. Recording: the waveform fills the row with cancel (X)
          and confirm (✓) grouped on the right. Otherwise: attach on the left,
          detail · dictate · send on the right. */}
      {isRecording ? (
        <div className="flex items-center gap-2">
          <Waveform />
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              className={`${iconBtn} hover:opacity-90`}
              style={{ background: "var(--surface-raised)" }}
              aria-label="Cancel recording"
              onClick={cancelDictation}
            >
              <X size={16} />
            </button>
            <button
              type="button"
              className={`${iconBtn} hover:opacity-90`}
              style={{ background: "var(--accent-subtle)" }}
              aria-label="Confirm recording"
              onClick={confirmDictation}
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            {enableAttachments && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={`${iconBtn} text-muted-foreground hover:text-foreground`}
                    aria-label="Attach files"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="rounded-[8px] bg-foreground text-background text-[12px] font-medium px-2.5 py-1.5 [corner-shape:squircle] [&_svg]:hidden">
                  Attach files
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isResponding ? (
              <button
                type="button"
                className={iconBtn}
                style={{ background: "var(--accent-subtle)" }}
                aria-label="Stop response"
                onClick={onStop}
              >
                <Square size={16} />
              </button>
            ) : (
              <>
                {detailLevel && onDetailLevelChange && (
                  <DetailDial value={detailLevel} onChange={onDetailLevelChange} />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={`${iconBtn} text-muted-foreground hover:text-foreground`}
                      aria-label="Voice input"
                      onClick={startDictation}
                    >
                      <Mic size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8} className="rounded-[8px] bg-foreground text-background text-[12px] font-medium px-2.5 py-1.5 [corner-shape:squircle] [&_svg]:hidden">
                    Dictate
                  </TooltipContent>
                </Tooltip>
                <button
                  type="button"
                  disabled={!canSend}
                  className="cortex-send-btn w-10 h-10 flex items-center justify-center transition-[opacity,transform] duration-100 enabled:hover:opacity-90 enabled:active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                  onClick={submit}
                  style={{ boxShadow: "var(--shadow-ai-send-button)" }}
                >
                  <ArrowUp size={15} className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
