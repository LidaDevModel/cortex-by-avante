"use client";

import { useState, useRef, useEffect } from "react";
import {
  Mic, AudioLines, ArrowUp, ArrowDown, Square, X, Check,
  ChevronDown, Loader2, ThumbsUp, ThumbsDown, Volume2,
  Pencil, Trash2, ArrowUpRight,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatHistoryPanel } from "@/components/chat-history-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MAX_HEIGHT = 160;
const LINE_HEIGHT = 24;

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

// ─── Message types ────────────────────────────────────────────────────────────

type Segment = { type: "text"; text: string } | { type: "source"; label: string };

type AiParagraph = { segments: Segment[] };

type FeedbackState = null | "up" | "down";

type Message = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  streamText?: string;
  isStreaming?: boolean;
  isError?: boolean;
  paragraphs?: AiParagraph[];
  feedback?: FeedbackState;
};

// ─── Mock AI response ─────────────────────────────────────────────────────────

const MOCK_PARAGRAPHS: AiParagraph[] = [
  {
    segments: [
      { type: "text", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vitae sagittis justo. Fusce pharetra interdum risus, et venenatis metus lacinia ac. Vestibulum molestie ultricies est sit amet sodales." },
      { type: "source", label: "Security Protocols" },
    ],
  },
  {
    segments: [
      { type: "text", text: "Donec sollicitudin odio arcu, lobortis laoreet metus facilisis at. Vivamus imperdiet suscipit est, non vulputate nisi ornare nec. Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      { type: "source", label: "Security Protocols" },
      { type: "text", text: " Nam vitae sagittis justo. Fusce pharetra interdum risus, et venenatis metus lacinia ac." },
      { type: "source", label: "Guard Duty" },
    ],
  },
];

function getMockStreamText() {
  return MOCK_PARAGRAPHS.map(p =>
    p.segments
      .filter((s): s is { type: "text"; text: string } => s.type === "text")
      .map(s => s.text)
      .join("")
  ).join("\n\n");
}

// ─── Source chip ──────────────────────────────────────────────────────────────

function SourceChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 mx-1 px-2 py-0.5 rounded-md text-[12px] font-medium text-primary cursor-pointer hover:bg-primary/10 transition-colors duration-100 whitespace-nowrap"
      style={{ background: "color-mix(in srgb, var(--primary) 10%, var(--surface))" }}
    >
      {label}
      <ArrowUpRight size={10} />
    </span>
  );
}

// ─── UserMessage ──────────────────────────────────────────────────────────────

function UserMessage({ content, onEdit }: { content: string; onEdit: (newContent: string) => void }) {
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
        <div
          className="w-[85%] rounded-2xl px-4 pt-3 pb-3 flex flex-col gap-3"
          style={{ background: "var(--surface-raised)" }}
        >
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
              className="text-[13px] font-semibold text-white px-3 py-1 rounded-lg disabled:opacity-50 transition-opacity duration-100"
              style={{ background: "var(--color-primary)" }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 group">
      <div
        className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-[24px] text-foreground break-words"
        style={{ background: "var(--surface-raised)" }}
      >
        {content}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
        <button
          onClick={startEdit}
          className="p-1.5 rounded-lg hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          <Pencil size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── ShareFeedbackModal ───────────────────────────────────────────────────────

const FEEDBACK_OPTIONS = ["Incomplete", "Wrong info", "Other"] as const;
type FeedbackOption = typeof FEEDBACK_OPTIONS[number];

function ShareFeedbackModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [selected, setSelected] = useState<FeedbackOption | null>(null);
  const [otherText, setOtherText] = useState("");

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSubmit() {
    onSubmit();
    onClose();
  }

  const canSubmit = selected !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "var(--scrim)" }}
      onClick={handleBackdrop}
    >
      <div
        className="relative w-[340px] rounded-[12px] bg-[var(--surface-raised)] p-6 flex flex-col gap-5"
        style={{
          boxShadow: "var(--shadow-modal-panel)",
          animation: "modal-in 200ms cubic-bezier(0.32,0.72,0,1) both",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors duration-100"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="text-[16px] font-semibold leading-[24px] text-foreground">Share feedback</h2>
          <p className="text-[13px] leading-[20px] text-muted-foreground">Help us improve Cortex AI</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {FEEDBACK_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setSelected(opt)}
                className="px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors duration-100"
                style={
                  selected === opt
                    ? { background: "color-mix(in srgb, var(--primary) 10%, var(--surface))", borderColor: "var(--color-primary)", color: "var(--color-primary)" }
                    : { background: "transparent", borderColor: "var(--border)", color: "var(--foreground)" }
                }
              >
                {opt}
              </button>
            ))}
          </div>

          {selected === "Other" && (
            <input
              autoFocus
              value={otherText}
              onChange={e => setOtherText(e.target.value)}
              placeholder="Tell us more..."
              className="w-full h-10 rounded-lg border border-border bg-[var(--surface-raised)] px-3 text-[13px] text-foreground outline-none focus:ring-1 focus:border-primary transition-colors duration-100"
              style={{ "--tw-ring-color": "var(--color-primary)" } as React.CSSProperties}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-100 px-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-9 px-4 rounded-lg text-[13px] font-semibold disabled:opacity-50 transition-opacity duration-100"
            style={{ background: "var(--color-primary)", color: "var(--primary-foreground)" }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AiMessage ────────────────────────────────────────────────────────────────

function AiMessage({
  message,
  onFeedback,
  onRetry,
}: {
  message: Message;
  onFeedback: (id: string, value: FeedbackState) => void;
  onRetry: (id: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  if (message.isStreaming && !message.streamText) {
    return (
      <div className="flex items-start pt-1">
        <Loader2 size={18} className="animate-spin text-primary shrink-0" />
      </div>
    );
  }

  if (message.isStreaming && message.streamText) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <p className="text-[15px] leading-[24px] text-foreground whitespace-pre-wrap">
          {message.streamText}
        </p>
        <Loader2 size={18} className="animate-spin text-primary shrink-0" />
      </div>
    );
  }

  if (message.isError) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {message.streamText && (
          <p className="text-[15px] leading-[24px] text-foreground whitespace-pre-wrap">
            {message.streamText}
          </p>
        )}
        <div className="flex items-center gap-2">
          <p className="text-[13px] leading-[20px] text-muted-foreground">
            Cortex couldn't get a response. Try again in a moment.
          </p>
          <button
            onClick={() => onRetry(message.id)}
            className="shrink-0 text-[13px] font-medium text-primary hover:underline transition-colors duration-100"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const fb = message.feedback ?? null;

  function FeedbackBtn({
    type,
    active,
    onClick,
  }: {
    type: "up" | "down";
    active: boolean;
    onClick: () => void;
  }) {
    const Icon = type === "up" ? ThumbsUp : ThumbsDown;
    return (
      <button
        onClick={onClick}
        className="p-1.5 rounded-lg transition-colors duration-100"
        style={active ? { background: "var(--accent-subtle)" } : undefined}
        aria-label={type === "up" ? "Helpful" : "Not helpful"}
      >
        <Icon
          size={14}
          className={active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
        />
      </button>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <div className="space-y-4 text-[15px] leading-[24px] text-foreground">
          {(message.paragraphs ?? []).map((para, i) => (
            <p key={i}>
              {para.segments.map((seg, j) =>
                seg.type === "text"
                  ? <span key={j}>{seg.text}</span>
                  : <SourceChip key={j} label={seg.label} />
              )}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <FeedbackBtn
              type="up"
              active={fb === "up"}
              onClick={() => onFeedback(message.id, fb === "up" ? null : "up")}
            />
            <FeedbackBtn
              type="down"
              active={fb === "down"}
              onClick={() => {
                if (fb === "down") { onFeedback(message.id, null); return; }
                setShowModal(true);
              }}
            />
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors duration-100">
              <Volume2 size={14} />
            </button>
          </div>
          {fb === "down" && (
            <p className="text-[12px] leading-[16px] text-muted-foreground">Feedback received</p>
          )}
        </div>
      </div>

      {showModal && (
        <ShareFeedbackModal
          onClose={() => setShowModal(false)}
          onSubmit={() => onFeedback(message.id, "down")}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(LINE_HEIGHT);
  const [isColumnLayout, setIsColumnLayout] = useState(false);
  const [taCanScrollUp, setTaCanScrollUp] = useState(false);
  const [taCanScrollDown, setTaCanScrollDown] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);
  const [isRenamingTitle, setIsRenamingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const [msgsCanScrollUp, setMsgsCanScrollUp] = useState(false);
  const [msgsCanScrollDown, setMsgsCanScrollDown] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const responseCountRef = useRef(0);

  const hasText = inputValue.trim().length > 0;
  const isScrollable = textareaHeight >= MAX_HEIGHT;
  const activeColumnLayout = isColumnLayout && !isRecording && !isAiResponding;
  const hasConversation = messages.length > 0;

  useEffect(() => {
    if (isRenamingTitle) titleInputRef.current?.focus();
  }, [isRenamingTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateMsgsScroll = () => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const atTop = el.scrollTop <= 4;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setMsgsCanScrollUp(!atTop);
    setMsgsCanScrollDown(!atBottom);
  };

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateMsgsScroll, { passive: true });
    updateMsgsScroll();
    return () => el.removeEventListener("scroll", updateMsgsScroll);
  }, [hasConversation]);

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
    const next = Math.min(ta.scrollHeight, MAX_HEIGHT);
    ta.style.height = `${next}px`;
    setTextareaHeight(next);
    updateTaScroll();
  };

  useEffect(() => {
    const measure = measureRef.current;
    const container = containerRef.current;
    if (!measure || !container) return;
    const rowTaWidth = container.offsetWidth - 124;
    measure.style.width = `${Math.max(rowTaWidth, 100)}px`;
    measure.textContent = inputValue || " ";
    setIsColumnLayout(measure.scrollHeight > LINE_HEIGHT + 1);
    recalcHeight();
  }, [inputValue]);

  useEffect(() => {
    recalcHeight();
  }, [activeColumnLayout]);

  function generateTitle(text: string) {
    const t = text.trim();
    return t.length > 45 ? t.slice(0, 45) + "…" : t;
  }

  function startStreaming(msgId: string) {
    const fullText = getMockStreamText();
    let idx = 0;
    responseCountRef.current += 1;
    const errorAt = responseCountRef.current === 3
      ? Math.floor(fullText.length * 0.5)
      : -1;

    streamIntervalRef.current = setInterval(() => {
      idx += 4;

      if (errorAt > 0 && idx >= errorAt) {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        setIsAiResponding(false);
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, isStreaming: false, isError: true } : m
        ));
        return;
      }

      if (idx >= fullText.length) {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        setMessages(prev => prev.map(m =>
          m.id === msgId
            ? { ...m, streamText: fullText, isStreaming: false, paragraphs: MOCK_PARAGRAPHS }
            : m
        ));
        setIsAiResponding(false);
      } else {
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, streamText: fullText.slice(0, idx) } : m
        ));
      }
    }, 30);
  }

  function handleRetry(msgId: string) {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(true);
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, isError: false, isStreaming: true, streamText: "" } : m
    ));
    setTimeout(() => startStreaming(msgId), 800);
  }

  function handleSend() {
    if (!hasText) return;
    const text = inputValue.trim();
    setInputValue("");
    setIsAiResponding(true);

    if (messages.length === 0) setConversationTitle(generateTitle(text));

    const userMsg: Message = { id: `u${Date.now()}`, role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiId = `a${Date.now()}`;
      setMessages(prev => [...prev, { id: aiId, role: "assistant", isStreaming: true, streamText: "" }]);
      setTimeout(() => startStreaming(aiId), 1000);
    }, 80);
  }

  function handleStopResponse() {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(false);
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.isStreaming) {
        return [...prev.slice(0, -1), { ...last, isStreaming: false, paragraphs: MOCK_PARAGRAPHS }];
      }
      return prev;
    });
  }

  function handleEditMessage(msgId: string, newContent: string) {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsAiResponding(true);
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msgId);
      if (idx === -1) return prev;
      return prev.slice(0, idx + 1).map(m =>
        m.id === msgId ? { ...m, content: newContent } : m
      );
    });
    setTimeout(() => {
      const aiId = `a${Date.now()}`;
      setMessages(prev => [...prev, { id: aiId, role: "assistant", isStreaming: true, streamText: "" }]);
      setTimeout(() => startStreaming(aiId), 1000);
    }, 80);
  }

  function handleFeedback(msgId: string, value: FeedbackState) {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, feedback: value } : m
    ));
  }

  function handleDeleteConversation() {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setMessages([]);
    setConversationTitle(null);
    setIsAiResponding(false);
  }

  function saveTitle() {
    const t = titleDraft.trim();
    if (t) setConversationTitle(t);
    setIsRenamingTitle(false);
  }

  function handleVoiceToggle() {
    if (isAiResponding) return;
    setIsRecording(true);
  }

  function handleConfirmRecording() {
    setIsRecording(false);
    setInputValue("What are the standard patrol protocols for the night shift?");
  }

  const containerPadding = activeColumnLayout ? "pl-[16px] pr-[10px] py-[10px]" : "p-[10px]";
  const containerLayout = activeColumnLayout
    ? "flex flex-col gap-2 items-stretch justify-end"
    : "flex flex-row items-center gap-3";

  const canvasBackground = "var(--surface)";

  const inputWidget = (
    <>
      <div
        ref={measureRef}
        aria-hidden
        className="absolute invisible pointer-events-none text-[16px] leading-[24px] break-words whitespace-pre-wrap overflow-hidden"
        style={{ top: -9999, left: -9999 }}
      />
      <div
        ref={containerRef}
        className={`w-full rounded-2xl ${containerLayout} ${containerPadding}`}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--input-border)",
          boxShadow: "var(--shadow-input-widget)",
        }}
      >
        {isRecording ? (
          <Waveform />
        ) : isAiResponding ? (
          <div className="flex-1" />
        ) : (
          <div className={`relative ${activeColumnLayout ? "w-full" : "flex-1 flex items-center h-10 min-w-0"}`}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              className="w-full resize-none bg-transparent text-[16px] leading-[24px] text-foreground outline-none p-0"
              onScroll={updateTaScroll}
              style={{
                maxHeight: `${MAX_HEIGHT}px`,
                overflowY: isScrollable ? "auto" : "hidden",
              }}
            />
            <div
              className="absolute left-0 right-2 top-0 h-8 pointer-events-none transition-opacity duration-200"
              style={{
                background: "linear-gradient(to bottom, var(--surface) 20%, transparent)",
                opacity: taCanScrollUp ? 1 : 0,
              }}
            />
            <div
              className="absolute left-0 right-2 bottom-0 h-8 pointer-events-none transition-opacity duration-200"
              style={{
                background: "linear-gradient(to top, var(--surface) 20%, transparent)",
                opacity: taCanScrollDown ? 1 : 0,
              }}
            />
          </div>
        )}

        <div className={`flex items-center gap-3 shrink-0 ${activeColumnLayout ? "justify-end w-full" : ""}`}>
          {isRecording ? (
            <button
              type="button"
              className="w-10 h-10 rounded-[10px] flex items-center justify-center transition-opacity duration-100 hover:opacity-90"
              style={{ background: "var(--surface-raised)" }}
              aria-label="Cancel recording"
              onClick={() => setIsRecording(false)}
            >
              <X size={16} />
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Voice input"
                  onClick={handleVoiceToggle}
                >
                  <Mic size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8} className="rounded-[8px] bg-foreground text-background text-[12px] font-medium px-2.5 py-1.5 [corner-shape:squircle] [&_svg]:hidden">
                Dictate
              </TooltipContent>
            </Tooltip>
          )}

          {isRecording ? (
            <button
              type="button"
              className="w-10 h-10 rounded-[10px] flex items-center justify-center transition-opacity duration-100 hover:opacity-90"
              style={{ background: "var(--accent-subtle)" }}
              aria-label="Confirm recording"
              onClick={handleConfirmRecording}
            >
              <Check size={16} />
            </button>
          ) : isAiResponding ? (
            <button
              type="button"
              className="w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors"
              style={{ background: "var(--accent-subtle)" }}
              aria-label="Stop response"
              onClick={handleStopResponse}
            >
              <Square size={16} />
            </button>
          ) : hasText ? (
            <button
              type="button"
              className="cortex-send-btn w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-90"
              aria-label="Send message"
              onClick={handleSend}
              style={{
                boxShadow: "var(--shadow-ai-send-button)",
              }}
            >
              <ArrowUp size={15} className="text-white" />
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="cortex-send-btn w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-90"
                  aria-label="Start voice recording"
                  onClick={handleVoiceToggle}
                  style={{
                    boxShadow: "var(--shadow-ai-send-button)",
                  }}
                >
                  <AudioLines size={15} className="text-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8} className="rounded-[8px] bg-foreground text-background text-[12px] font-medium px-2.5 py-1.5 [corner-shape:squircle] [&_svg]:hidden">
                Use voice mode
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
      {!hasConversation && (
        /* Shared clip container — overflow:hidden with card radius so blobs never bleed outside */
        <div
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          {/* Left blob — 80%×80%, starts -10% left so the edge is always off-screen even at max translation */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "80%", height: "80%",
              top: "10%", left: "-10%",
              background: "radial-gradient(ellipse 70% 70% at 40% 50%, var(--blob-1) 0%, transparent 70%)",
              animation: "blob-1 9s ease-in-out infinite",
              willChange: "transform",
            }}
          />
          {/* Right blob — 80%×80%, ends -10% right for the same reason */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "80%", height: "80%",
              top: "10%", right: "-10%",
              background: "radial-gradient(ellipse 70% 70% at 60% 50%, var(--blob-2) 0%, transparent 70%)",
              animation: "blob-2 12s ease-in-out infinite",
              willChange: "transform",
            }}
          />
        </div>
      )}

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-2 px-4 h-14 shrink-0" style={{ background: "color-mix(in srgb, var(--surface) 30%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <SidebarTrigger className="-ml-1" />

          {conversationTitle && (
            isRenamingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") setIsRenamingTitle(false);
                }}
                className="text-[14px] font-medium text-foreground bg-transparent border border-primary rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-primary min-w-0 max-w-[280px]"
              />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-[14px] font-medium text-foreground hover:text-primary transition-colors duration-100 max-w-[280px]">
                    <span className="truncate">{conversationTitle}</span>
                    <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36">
                  <DropdownMenuItem
                    onClick={() => { setTitleDraft(conversationTitle); setIsRenamingTitle(true); }}
                  >
                    <Pencil size={13} className="mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteConversation}
                    variant="destructive"
                  >
                    <Trash2 size={13} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </header>

        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: hasConversation ? "var(--surface)" : "transparent" }}>
        {hasConversation ? (
          /* ── Conversation view ── */
          <div className="relative flex-1 min-h-0">
            {/* Bottom fade — sits above the sticky input (overlay, not border-adjacent) */}
            <div
              className="absolute left-0 h-20 pointer-events-none z-10 transition-opacity duration-200"
              style={{
                right: 12,
                bottom: 112,
                background: "linear-gradient(to top, var(--surface) 30%, transparent)",
                opacity: msgsCanScrollDown ? 1 : 0,
              }}
            />
            {/* Scroll-to-bottom button */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20 transition-all duration-200"
              style={{
                bottom: 120,
                opacity: msgsCanScrollDown ? 1 : 0,
                pointerEvents: msgsCanScrollDown ? "auto" : "none",
              }}
            >
              <button
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-border"
                style={{
                  background: "var(--surface-glass)",
                  backdropFilter: "blur(4px)",
                  boxShadow: "var(--shadow-floating)",
                }}
              >
                <ArrowDown size={15} className="text-foreground" />
              </button>
            </div>

            {/* Single scroll container — top fade via mask-image (no border gap) */}
            <div
              ref={messagesScrollRef}
              className="h-full overflow-y-auto"
              style={{
                scrollbarGutter: "stable",
                maskImage: msgsCanScrollUp ? "linear-gradient(to bottom, transparent 0px, black 64px, black 100%)" : "none",
                WebkitMaskImage: msgsCanScrollUp ? "linear-gradient(to bottom, transparent 0px, black 64px, black 100%)" : "none",
              }}
            >
              <div className="min-h-full flex flex-col">
                <div className="flex-1 px-6 pt-8 pb-4">
                  <div className="max-w-[560px] mx-auto flex flex-col gap-8">
                    {messages.map(msg =>
                      msg.role === "user"
                        ? <UserMessage key={msg.id} content={msg.content!} onEdit={newContent => handleEditMessage(msg.id, newContent)} />
                        : <AiMessage key={msg.id} message={msg} onFeedback={handleFeedback} onRetry={handleRetry} />
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Sticky input — same centering as messages above */}
                <div
                  className="sticky bottom-0 px-6 pb-6 pt-2 flex flex-col items-center gap-2"
                  style={{ background: "var(--surface)" }}
                >
                  <div className="w-full max-w-[560px] relative">
                    {inputWidget}
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Cortex AI can make mistakes. Please check important info.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div
            className="relative flex-1 flex flex-col items-center justify-start overflow-hidden px-6 pt-[30vh]"
          >
            <div className="relative z-10 w-full max-w-[560px] flex flex-col items-center text-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-[20px] leading-none font-semibold text-primary">
                  How can I help you Mike?
                </h1>
                <p className="text-[14px] leading-[20px] text-muted-foreground whitespace-nowrap">
                  Ask anything about protocols, procedures, or guidelines.
                </p>
              </div>
              <div className="w-full relative">
                {inputWidget}
              </div>
              <p className="text-[12px] text-muted-foreground -mt-4">
                Cortex AI can make mistakes. Please check important info.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0">
      <ChatHistoryPanel
        isOpen={showHistory}
        onToggle={() => setShowHistory(v => !v)}
      />
      </div>
    </div>
  );
}
