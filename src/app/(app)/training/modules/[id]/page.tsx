"use client";

import { useState, useMemo } from "react";
import { Search, Check, X, ChevronRight, Flag } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";

/* ─── Types ─── */

type QuizOption = { id: string; text: string };
type Quiz = { question: string; options: QuizOption[]; correctId: string };
type Chapter = {
  id: string;
  num: number;
  title: string;
  body: string;
  quiz?: Quiz;
  isFinalQuiz?: boolean;
};

/* ─── Mock data ─── */

const CHAPTERS: Chapter[] = [
  {
    id: "1",
    num: 1,
    title: "Introduction",
    body: `Effective escalation procedures are the backbone of any professional security operation. When incidents arise, the speed and clarity of your response directly determines how quickly order is restored and how much risk is contained.\n\nThis module provides a comprehensive framework for identifying, classifying, and escalating security events. You will learn to distinguish between situations that require immediate action, those that warrant monitoring, and those that must be passed up the chain of command without delay.\n\nBy the end of this module, you will be able to apply these procedures confidently, communicate clearly with supervisors and emergency services, and document each event in a way that supports accountability and continuous improvement.`,
  },
  {
    id: "2",
    num: 2,
    title: "Identifying Security Threats",
    body: `Threat identification is the first and most critical step in the escalation chain. A missed or misclassified threat can have serious consequences — for the site, for bystanders, and for your team.\n\nThreats are generally classified into three tiers: Tier 1 (low risk, monitor only), Tier 2 (elevated risk, requires supervisor notification), and Tier 3 (immediate risk, requires emergency response). Common indicators include unusual behaviour, unauthorised access attempts, suspicious packages, and verbal or physical altercations.\n\nTrust your training. If something feels wrong, it usually is. Always err on the side of caution and escalate earlier rather than later — you will never be penalised for taking a threat seriously.`,
    quiz: {
      question: "Which of the following is a Tier 3 threat requiring immediate emergency response?",
      options: [
        { id: "a", text: "A visitor waiting in the lobby beyond their appointment time" },
        { id: "b", text: "A physical altercation in progress on-site" },
        { id: "c", text: "An employee badge-in outside of normal working hours" },
        { id: "d", text: "A delivery vehicle parked in a loading bay after hours" },
      ],
      correctId: "b",
    },
  },
  {
    id: "3",
    num: 3,
    title: "Communication Protocols",
    body: `Clear communication is non-negotiable during a security incident. Ambiguous or incomplete information delays response and increases risk. Every communication you make — whether by radio, phone, or written log — must follow a consistent structure.\n\nThe SMEAC format (Situation, Mission, Execution, Administration, Command) is the standard for verbal briefings. For radio communications, use the NATO phonetic alphabet where clarity is essential, and always confirm receipt before ending a transmission.\n\nWhen communicating with emergency services, lead with location and nature of incident, then casualties or ongoing threats, then site access information. Keep it brief. Dispatchers are trained to ask follow-up questions — do not overwhelm them with detail upfront.`,
    quiz: {
      question: "What does the 'S' in the SMEAC communication format stand for?",
      options: [
        { id: "a", text: "Safety" },
        { id: "b", text: "Situation" },
        { id: "c", text: "Summary" },
        { id: "d", text: "Suspect" },
      ],
      correctId: "b",
    },
  },
  {
    id: "4",
    num: 4,
    title: "Escalation Pathways",
    body: `Every site has a defined escalation pathway — a chain of contacts and decision points that determines who is notified, in what order, and by what method. Knowing your site's pathway before an incident occurs is essential.\n\nTypically, escalation flows from the responding guard to the shift supervisor, from supervisor to the site manager or duty manager, and from there to client representatives and emergency services as required. Some clients require notification at every tier; others only at Tier 2 and above.\n\nYour site briefing document contains the specific escalation pathway for your assignment. Review it at the start of every shift. If you are unsure who to contact, your shift supervisor is always the correct first point of escalation.`,
    quiz: {
      question: "If you are unsure who to contact during an incident, who should your first escalation point always be?",
      options: [
        { id: "a", text: "The client representative" },
        { id: "b", text: "Emergency services directly" },
        { id: "c", text: "Your shift supervisor" },
        { id: "d", text: "The duty manager" },
      ],
      correctId: "c",
    },
  },
  {
    id: "5",
    num: 5,
    title: "Documentation Requirements",
    body: `Accurate documentation is not just a procedural obligation — it is a critical tool for accountability, legal protection, and operational improvement. Every incident, no matter how minor, must be recorded.\n\nAn incident report must capture: the date, time, and location; a factual description of events in chronological order; the names or descriptions of individuals involved; actions taken by security personnel; and any injuries, property damage, or losses.\n\nUse plain, factual language. Avoid opinions, assumptions, or emotional language. Write what you observed, not what you inferred. A well-written incident report can be used in legal proceedings — accuracy and objectivity are paramount.`,
  },
  {
    id: "6",
    num: 6,
    title: "Post-Incident Review",
    body: `Every significant incident should be followed by a structured review. The purpose of a post-incident review is not to assign blame — it is to identify what worked, what did not, and what changes would improve outcomes in future.\n\nReviews are typically conducted by the shift supervisor within 24 hours of the incident. They involve the responding personnel, relevant witnesses, and in some cases a client representative. The output is an action log with specific, time-bound improvements.\n\nParticipating constructively in post-incident reviews is part of your professional responsibility. Honest reflection on your own performance, including things you would do differently, demonstrates the kind of professional maturity Avante expects from every team member.`,
    quiz: {
      question: "What is the primary purpose of a post-incident review?",
      options: [
        { id: "a", text: "To assign blame for failures in the response" },
        { id: "b", text: "To identify improvements and update procedures" },
        { id: "c", text: "To satisfy insurance documentation requirements" },
        { id: "d", text: "To determine if disciplinary action is required" },
      ],
      correctId: "b",
    },
  },
  {
    id: "final",
    num: 7,
    title: "Final Quiz",
    body: "",
    isFinalQuiz: true,
  },
];

const MODULE = {
  id: "1",
  title: "Escalation Procedures 1",
  chapters: 6,
  hours: 2,
  type: "Certification",
  category: "escalations" as const,
  illustration: "/brand/illustration-heart.png",
};

/* ─── Sub-components ─── */

function ProgressBar({ value, height = 6 }: { value: number; height?: number }) {
  return (
    <div
      className="rounded-full bg-border overflow-hidden"
      style={{ height }}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, background: "#1a4a2e" }}
      />
    </div>
  );
}

function ChapterStepper({
  chapters,
  currentId,
  completedIds,
  onSelect,
  search,
}: {
  chapters: Chapter[];
  currentId: string;
  completedIds: Set<string>;
  onSelect: (id: string) => void;
  search: string;
}) {
  const filtered = search.trim()
    ? chapters.filter((c) =>
        c.title.toLowerCase().includes(search.trim().toLowerCase())
      )
    : chapters;

  return (
    <div className="flex flex-col">
      {filtered.map((chapter, i) => {
        const isCompleted = completedIds.has(chapter.id);
        const isActive = chapter.id === currentId;
        const isLast = i === filtered.length - 1;

        return (
          <div key={chapter.id} className="flex gap-3">
            {/* Connector column */}
            <div className="flex flex-col items-center shrink-0" style={{ width: 28 }}>
              {/* Circle */}
              <button
                onClick={() => onSelect(chapter.id)}
                className="shrink-0 flex items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
                style={{
                  width: 28,
                  height: 28,
                  background: isActive
                    ? "#1a4a2e"
                    : isCompleted
                    ? "#1a4a2e"
                    : "transparent",
                  border: isActive || isCompleted ? "none" : "1.5px solid #d1d5db",
                  color: isActive || isCompleted ? "#ffffff" : "#9ca3af",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {isCompleted && !isActive ? (
                  <Check size={13} strokeWidth={2.5} />
                ) : chapter.isFinalQuiz ? (
                  <Flag size={12} strokeWidth={2} />
                ) : (
                  <span>{chapter.num}</span>
                )}
              </button>
              {/* Vertical line */}
              {!isLast && (
                <div
                  className="flex-1 w-px"
                  style={{
                    background: isCompleted ? "#1a4a2e" : "#e5e7eb",
                    minHeight: 24,
                    opacity: isCompleted ? 0.4 : 1,
                  }}
                />
              )}
            </div>

            {/* Chapter label */}
            <button
              onClick={() => onSelect(chapter.id)}
              className="flex-1 text-left pb-6 focus-visible:outline-none"
              style={{ paddingTop: 4 }}
            >
              <span
                className="text-[13px] leading-[18px] block"
                style={{
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? "#1a4a2e"
                    : isCompleted
                    ? "#6b7280"
                    : "#374151",
                }}
              >
                {chapter.title}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

type QuizSubmitState = "idle" | "correct" | "wrong";

function QuizCard({ quiz }: { quiz: Quiz }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<QuizSubmitState>("idle");

  const submitted = submitState !== "idle";

  function handleSubmit() {
    if (!selected) return;
    setSubmitState(selected === quiz.correctId ? "correct" : "wrong");
  }

  return (
    <div
      className="rounded-[10px] flex flex-col gap-4 p-5"
      style={{ background: "rgba(222,231,228,0.25)", border: "1px solid rgba(26,74,46,0.08)" }}
    >
      <p className="text-[14px] leading-[22px] font-semibold" style={{ color: "#111827" }}>
        {quiz.question}
      </p>

      <div className="flex flex-col gap-2">
        {quiz.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = opt.id === quiz.correctId;
          const showCorrect = submitted && isCorrect;
          const showWrong = submitted && isSelected && !isCorrect;

          return (
            <button
              key={opt.id}
              onClick={() => !submitted && setSelected(opt.id)}
              className="flex items-center gap-3 text-left rounded-[8px] px-3 py-2.5 transition-colors duration-100"
              style={{
                background: showCorrect
                  ? "rgba(26,74,46,0.08)"
                  : showWrong
                  ? "rgba(220,38,38,0.06)"
                  : isSelected && !submitted
                  ? "rgba(26,74,46,0.06)"
                  : "transparent",
                cursor: submitted ? "default" : "pointer",
              }}
            >
              {/* Radio circle */}
              <span
                className="shrink-0 flex items-center justify-center rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  border: showCorrect
                    ? "none"
                    : showWrong
                    ? "2px solid #dc2626"
                    : isSelected && !submitted
                    ? "2px solid #1a4a2e"
                    : "1.5px solid #d1d5db",
                  background: showCorrect
                    ? "#1a4a2e"
                    : showWrong
                    ? "transparent"
                    : isSelected && !submitted
                    ? "transparent"
                    : "transparent",
                }}
              >
                {showCorrect && <Check size={10} strokeWidth={3} color="#fff" />}
                {showWrong && <X size={10} strokeWidth={3} color="#dc2626" />}
                {isSelected && !submitted && (
                  <span
                    className="rounded-full block"
                    style={{ width: 8, height: 8, background: "#1a4a2e" }}
                  />
                )}
              </span>

              <span
                className="text-[13px] leading-[20px]"
                style={{
                  fontWeight: showCorrect ? 600 : 400,
                  color: showCorrect
                    ? "#1a4a2e"
                    : showWrong
                    ? "#dc2626"
                    : "#374151",
                }}
              >
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback row */}
      {submitted && (
        <div
          className="flex items-center gap-2"
          style={{ color: submitState === "correct" ? "#1a4a2e" : "#dc2626" }}
        >
          {submitState === "correct" ? (
            <Check size={15} strokeWidth={2.5} />
          ) : (
            <X size={15} strokeWidth={2.5} />
          )}
          <span className="text-[13px] leading-[20px] font-semibold">
            {submitState === "correct" ? "Correct!" : "Incorrect"}
          </span>
        </div>
      )}

      {/* Submit button — only shown before submission */}
      {!submitted && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="h-[40px] px-5 rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100"
            style={{
              background: "#1a4a2e",
              color: "#ffffff",
              opacity: selected ? 1 : 0.5,
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            Submit your answer
          </button>
          <span className="text-[12px] leading-[16px] text-muted-foreground">optional</span>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function ModuleDetailPage() {
  const [currentId, setCurrentId] = useState("1");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(["1"]));
  const [search, setSearch] = useState("");

  const currentIndex = CHAPTERS.findIndex((c) => c.id === currentId);
  const currentChapter = CHAPTERS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === CHAPTERS.length - 1;
  const isSecondToLast = currentIndex === CHAPTERS.length - 2;

  const progress = useMemo(() => {
    const contentChapters = CHAPTERS.filter((c) => !c.isFinalQuiz);
    const done = contentChapters.filter((c) => completedIds.has(c.id)).length;
    return Math.round((done / contentChapters.length) * 100);
  }, [completedIds]);

  function goTo(id: string) {
    setCurrentId(id);
  }

  function goNext() {
    if (isLast) return;
    const next = CHAPTERS[currentIndex + 1];
    setCompletedIds((prev) => new Set([...prev, currentId]));
    setCurrentId(next.id);
  }

  function goPrev() {
    if (isFirst) return;
    setCurrentId(CHAPTERS[currentIndex - 1].id);
  }

  const nextLabel = isSecondToLast ? "Final Quiz" : "Next Chapter";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Breadcrumb header */}
      <header className="flex items-center gap-3 px-4 py-3 shrink-0 border-b border-border">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors duration-100" />
        <div className="flex items-center gap-1.5 text-[14px] leading-[20px] min-w-0">
          <span className="text-muted-foreground shrink-0">Training</span>
          <ChevronRight size={14} className="text-muted-foreground shrink-0" />
          <span className="text-muted-foreground shrink-0">Modules</span>
          <ChevronRight size={14} className="text-muted-foreground shrink-0" />
          <span className="font-medium text-foreground truncate">{MODULE.title}</span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — chapter stepper */}
        <aside
          className="flex flex-col shrink-0 border-r border-border overflow-hidden"
          style={{ width: 236 }}
        >
          {/* Panel header */}
          <div className="px-4 pt-4 pb-3 shrink-0">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search chapters"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[36px] pl-8 pr-3 rounded-[8px] border border-border bg-white text-[13px] leading-[20px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 transition-shadow duration-100"
                style={{ "--tw-ring-color": "rgba(26,74,46,0.25)" } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Stepper list */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <ChapterStepper
              chapters={CHAPTERS}
              currentId={currentId}
              completedIds={completedIds}
              onSelect={goTo}
              search={search}
            />
          </div>
        </aside>

        {/* Right canvas */}
        <div className="relative flex-1 overflow-hidden" style={{ background: "#FCFCFC" }}>
          {/* Blob gradients */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 70% at 28% 55%, rgba(247,255,226,0.55) 0%, rgba(247,255,226,0.55) 10%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(ellipse 65% 70% at 68% 45%, rgba(239,255,235,0.55) 0%, rgba(239,255,235,0.55) 10%, transparent 70%)",
            }}
          />

          {/* Top fade */}
          <div
            className="absolute top-0 inset-x-0 h-8 pointer-events-none z-20"
            style={{ background: "linear-gradient(to bottom, #FCFCFC 20%, transparent)" }}
          />
          {/* Bottom fade */}
          <div
            className="absolute bottom-0 inset-x-0 h-16 pointer-events-none z-20"
            style={{ background: "linear-gradient(to top, #FCFCFC 30%, transparent)" }}
          />

          {/* Scrollable content */}
          <div
            className="absolute inset-0 overflow-y-auto z-10"
            style={{ scrollbarGutter: "stable" }}
          >
            <div className="max-w-[640px] mx-auto px-8 pt-6 pb-20 flex flex-col gap-6">
              {/* Module info block */}
              <div className="flex flex-col gap-2">
                <h1 className="text-[22px] leading-[30px] font-bold" style={{ color: "#111827" }}>
                  {MODULE.title}
                </h1>
                <p className="text-[13px] leading-[20px] text-muted-foreground">
                  {MODULE.chapters} chapters · {MODULE.hours}h · {MODULE.type}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1">
                    <ProgressBar value={progress} height={8} />
                  </div>
                  <span
                    className="text-[12px] leading-[16px] font-medium shrink-0"
                    style={{ color: "#1a4a2e" }}
                  >
                    {progress}% Complete
                  </span>
                </div>
              </div>

              {/* Chapter illustration — only on first chapter */}
              {currentIndex === 0 && (
                <div
                  className="flex items-center justify-center rounded-[12px] overflow-hidden"
                  style={{
                    height: 180,
                    background:
                      "radial-gradient(ellipse 85% 80% at 50% 40%, rgba(255,255,255,0.92) 0%, transparent 100%), #F7F8F7",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Image
                    src={MODULE.illustration}
                    alt={MODULE.title}
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
              )}

              {/* Chapter content */}
              {!currentChapter.isFinalQuiz ? (
                <>
                  <div className="flex flex-col gap-3">
                    <h2
                      className="text-[18px] leading-[26px] font-semibold"
                      style={{ color: "#111827" }}
                    >
                      {currentChapter.num}. {currentChapter.title}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {currentChapter.body.split("\n\n").map((para, i) => (
                        <p
                          key={i}
                          className="text-[15px] leading-[26px]"
                          style={{ color: "#374151" }}
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Quiz card */}
                  {currentChapter.quiz && (
                    <QuizCard key={currentChapter.id} quiz={currentChapter.quiz} />
                  )}
                </>
              ) : (
                /* Final quiz placeholder */
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 56, height: 56, background: "rgba(26,74,46,0.08)" }}
                  >
                    <Flag size={24} style={{ color: "#1a4a2e" }} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p
                      className="text-[17px] leading-[26px] font-semibold"
                      style={{ color: "#111827" }}
                    >
                      Ready for the final quiz?
                    </p>
                    <p className="text-[14px] leading-[22px] text-muted-foreground">
                      You&apos;ve completed all chapters. Test your knowledge to earn your certification.
                    </p>
                  </div>
                  <button
                    className="h-[40px] px-6 rounded-[8px] text-[14px] leading-[20px] font-semibold"
                    style={{ background: "#1a4a2e", color: "#ffffff", cursor: "pointer" }}
                  >
                    Start final quiz
                  </button>
                </div>
              )}

              {/* Navigation */}
              {!currentChapter.isFinalQuiz && (
                <div className="flex items-center justify-between pt-2">
                  <div>
                    {!isFirst && (
                      <button
                        onClick={goPrev}
                        className="h-[40px] px-5 rounded-[8px] text-[14px] leading-[20px] font-semibold border border-border bg-white transition-colors duration-100 hover:bg-gray-50"
                        style={{ color: "#374151", cursor: "pointer" }}
                      >
                        Previous
                      </button>
                    )}
                  </div>
                  <button
                    onClick={goNext}
                    className="h-[40px] px-5 rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100"
                    style={{ background: "#1a4a2e", color: "#ffffff", cursor: "pointer" }}
                  >
                    {nextLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
