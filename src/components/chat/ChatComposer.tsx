"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, AudioLines, ArrowUp, Square, X, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MAX_HEIGHT = 160;
const LINE_HEIGHT = 24;
const DEFAULT_PLACEHOLDER = "Ask anything about protocols, procedures, or guidelines...";
const DEFAULT_DICTATION = "What are the standard patrol protocols for the night shift?";

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
  /** Called with the trimmed message text when the user sends. The composer clears itself. */
  onSubmit: (text: string) => void;
  /** When true, the send affordance becomes a stop button and the field yields. */
  isResponding?: boolean;
  /** Called when the user taps stop during a response. */
  onStop?: () => void;
  placeholder?: string;
  /** Text inserted when a dictation is confirmed (mocked voice input). */
  dictationText?: string;
};

/**
 * The Cortex chat input widget — the bordered composer with autosizing textarea,
 * mock voice recording (waveform + confirm), and send/stop affordances. Extracted
 * from the chat screen so the same input can be reused elsewhere (e.g. the dashboard
 * "Ask Cortex" entry point).
 */
export function ChatComposer({
  onSubmit,
  isResponding = false,
  onStop,
  placeholder = DEFAULT_PLACEHOLDER,
  dictationText = DEFAULT_DICTATION,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(LINE_HEIGHT);
  const [isColumnLayout, setIsColumnLayout] = useState(false);
  const [taCanScrollUp, setTaCanScrollUp] = useState(false);
  const [taCanScrollDown, setTaCanScrollDown] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const hasText = inputValue.trim().length > 0;
  const isScrollable = textareaHeight >= MAX_HEIGHT;
  const activeColumnLayout = isColumnLayout && !isRecording && !isResponding;

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
    // placeholder on narrow screens, which would inflate the field beyond its
    // row and spill outside the widget.
    const next = inputValue ? Math.min(ta.scrollHeight, MAX_HEIGHT) : LINE_HEIGHT;
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

  function submit() {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    onSubmit(text);
  }

  function handleVoiceToggle() {
    if (isResponding) return;
    setIsRecording(true);
  }

  function handleConfirmRecording() {
    setIsRecording(false);
    setInputValue(dictationText);
  }

  const containerPadding = activeColumnLayout ? "pl-[16px] pr-[10px] py-[10px]" : "p-[10px]";
  const containerLayout = activeColumnLayout
    ? "flex flex-col gap-2 items-stretch justify-end"
    : "flex flex-row items-center gap-3";

  return (
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
        ) : isResponding ? (
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
                  submit();
                }
              }}
              rows={1}
              placeholder={placeholder}
              className="w-full resize-none bg-transparent text-[16px] leading-[24px] text-foreground outline-none p-0 placeholder:text-muted-foreground placeholder:text-[14px]"
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
          ) : isResponding ? (
            <button
              type="button"
              className="w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors"
              style={{ background: "var(--accent-subtle)" }}
              aria-label="Stop response"
              onClick={onStop}
            >
              <Square size={16} />
            </button>
          ) : hasText ? (
            <button
              type="button"
              className="cortex-send-btn w-10 h-10 flex items-center justify-center transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-95"
              aria-label="Send message"
              onClick={submit}
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
}
