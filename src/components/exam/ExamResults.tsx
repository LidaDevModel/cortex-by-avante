"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamObject } from "@/lib/exam-mock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type SectionScore = {
  mc: number;      // 0-25
  matching: number;
  shortAnswer: number;
  branching: number;
};

type MCAnswer = { questionIndex: number; selectedIndex: number | null };
type MatchAnswer = Record<string, string>; // termId → defId
type BranchAnswer = Record<string, string>; // nodeId → optionId

type Props = {
  exam: ExamObject;
  scores: SectionScore;
  mcAnswers: MCAnswer[];
  matchAnswers: MatchAnswer;
  shortAnswer: string;
  branchDecisions: BranchAnswer;
  onBack: () => void;
};

const PASS_THRESHOLD = 85;
const MAX_TOTAL = 100;

export function ExamResults({
  exam,
  scores,
  mcAnswers,
  matchAnswers,
  shortAnswer,
  branchDecisions,
  onBack,
}: Props) {
  const total = scores.mc + scores.matching + scores.shortAnswer + scores.branching;
  const passed = total >= PASS_THRESHOLD;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sectionRows = [
    { label: "Multiple choice", score: scores.mc, max: 25 },
    { label: "Matching", score: scores.matching, max: 25 },
    { label: "Short answer", score: scores.shortAnswer, max: 25 },
    { label: "Branching scenario", score: scores.branching, max: 25 },
  ];

  return (
    <div className="flex-1 overflow-y-auto scroll-thin" style={{ maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)" }}>
      <div
        className="max-w-[640px] mx-auto px-8 py-16 flex flex-col gap-10 animate-in fade-in duration-200"
        style={{ animationTimingFunction: "ease-out" }}
      >
        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1
            className="text-[36px] leading-[44px] font-bold"
            style={{ color: passed ? "var(--primary)" : "var(--foreground)" }}
          >
            {passed ? "Certified." : "Certification not awarded"}
          </h1>
          <div className="flex items-baseline gap-3">
            <span className="text-[48px] leading-none font-bold tabular-nums" style={{ color: "var(--primary)" }}>
              {total}
            </span>
            <span className="text-[20px] text-muted-foreground font-medium">/ {MAX_TOTAL}</span>
          </div>
          {passed ? (
            <p className="text-[14px] text-muted-foreground">
              Your certification has been recorded. Issued {today}.
            </p>
          ) : (
            <p className="text-[14px] text-muted-foreground">
              Passing score: {PASS_THRESHOLD}. Review the breakdown below and return to the module.
            </p>
          )}
        </div>

        {/* Score table */}
        <div className="rounded-[12px] border border-border overflow-hidden">
          <div className="grid grid-cols-3 px-4 py-2 bg-[var(--surface-raised)] border-b border-border">
            {["Section", "Score", "Max"].map((h) => (
              <span key={h} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {h}
              </span>
            ))}
          </div>
          {sectionRows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "grid grid-cols-3 px-4 py-3 text-[14px]",
                i < sectionRows.length - 1 ? "border-b border-border" : ""
              )}
            >
              <span className="text-foreground">{row.label}</span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  row.score >= row.max * 0.8
                    ? "text-[var(--primary)]"
                    : row.score >= row.max * 0.5
                    ? "text-foreground"
                    : "text-destructive"
                )}
              >
                {row.score}
              </span>
              <span className="text-muted-foreground tabular-nums">{row.max}</span>
            </div>
          ))}
          <div className="grid grid-cols-3 px-4 py-3 bg-[var(--surface-raised)] border-t border-border">
            <span className="text-[14px] font-semibold text-foreground">Total</span>
            <span
              className={cn(
                "text-[14px] font-bold tabular-nums",
                passed ? "text-[var(--primary)]" : "text-destructive"
              )}
            >
              {total}
            </span>
            <span className="text-[14px] font-medium text-muted-foreground tabular-nums">{MAX_TOTAL}</span>
          </div>
        </div>

        {/* Fail breakdown */}
        {!passed && (
          <div className="flex flex-col gap-3">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
              Detailed breakdown
            </p>
            <Accordion type="multiple" className="flex flex-col gap-2">

              {/* MC breakdown */}
              <AccordionItem value="mc" className="border border-border rounded-[10px] overflow-hidden">
                <AccordionTrigger className="px-4 py-3 text-[14px] font-medium text-foreground hover:no-underline">
                  Multiple choice — {scores.mc}/25
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 flex flex-col gap-3">
                  {exam.multipleChoice.map((q, qi) => {
                    const answer = mcAnswers.find((a) => a.questionIndex === qi);
                    const userIdx = answer?.selectedIndex ?? null;
                    const correct = userIdx === q.correctIndex;
                    if (correct) return null;
                    return (
                      <div key={q.id} className="flex flex-col gap-1.5 text-[13px]">
                        <p className="font-medium text-foreground">{q.question}</p>
                        <p className="text-muted-foreground">
                          Your answer:{" "}
                          <span className="text-destructive">
                            {userIdx !== null ? q.options[userIdx] : "Skipped"}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          Correct answer:{" "}
                          <span style={{ color: "var(--primary)" }}>{q.options[q.correctIndex]}</span>
                        </p>
                      </div>
                    );
                  })}
                  {mcAnswers.every((a) => a.selectedIndex === exam.multipleChoice[a.questionIndex]?.correctIndex) && (
                    <p className="text-[13px] text-muted-foreground">All answers correct.</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Matching breakdown */}
              <AccordionItem value="matching" className="border border-border rounded-[10px] overflow-hidden">
                <AccordionTrigger className="px-4 py-3 text-[14px] font-medium text-foreground hover:no-underline">
                  Matching — {scores.matching}/25
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 flex flex-col gap-3">
                  {exam.matching.pairs.map((pair) => {
                    const matchedDefId = matchAnswers[pair.id];
                    const correct = matchedDefId === pair.id;
                    if (correct) return null;
                    const matchedDef = exam.matching.pairs.find((p) => p.id === matchedDefId);
                    return (
                      <div key={pair.id} className="flex flex-col gap-1 text-[13px]">
                        <p className="font-medium text-foreground">{pair.term}</p>
                        <p className="text-muted-foreground">
                          Your match:{" "}
                          <span className="text-destructive">
                            {matchedDef ? matchedDef.definition : "Not matched"}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          Correct:{" "}
                          <span style={{ color: "var(--primary)" }}>{pair.definition}</span>
                        </p>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              {/* Short answer breakdown */}
              <AccordionItem value="sa" className="border border-border rounded-[10px] overflow-hidden">
                <AccordionTrigger className="px-4 py-3 text-[14px] font-medium text-foreground hover:no-underline">
                  Short answer — {scores.shortAnswer}/25
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 flex flex-col gap-2 text-[13px]">
                  <p className="text-muted-foreground italic">"{shortAnswer || "No answer provided."}"</p>
                  <p className="text-muted-foreground">
                    {exam.shortAnswer.aiJustification ??
                      "Your answer didn't fully address the required concepts."}
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Branching breakdown */}
              <AccordionItem value="branching" className="border border-border rounded-[10px] overflow-hidden">
                <AccordionTrigger className="px-4 py-3 text-[14px] font-medium text-foreground hover:no-underline">
                  Branching scenario — {scores.branching}/25
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 flex flex-col gap-4">
                  {exam.branching.nodes
                    .filter((n) => n.type === "decision")
                    .map((node) => {
                      const chosenId = branchDecisions[node.id];
                      const chosenOption = node.options?.find((o) => o.id === chosenId);
                      const optimalOption = node.options?.find((o) => o.isOptimal);
                      const wasOptimal = chosenOption?.isOptimal;
                      return (
                        <div key={node.id} className="flex flex-col gap-1.5 text-[13px]">
                          <p className="font-medium text-foreground">{node.scenarioText}</p>
                          <p className="text-muted-foreground">
                            Your choice:{" "}
                            <span className={wasOptimal ? "" : "text-destructive"}>
                              {chosenOption?.text ?? "Not answered"}
                            </span>
                          </p>
                          {!wasOptimal && (
                            <>
                              <p className="text-muted-foreground">
                                Optimal choice:{" "}
                                <span style={{ color: "var(--primary)" }}>{optimalOption?.text}</span>
                              </p>
                              <p className="text-muted-foreground/80 italic text-[12px]">
                                {chosenOption?.explanation}
                              </p>
                            </>
                          )}
                        </div>
                      );
                    })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onBack}
          className="w-full h-10 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] text-[14px] font-medium hover:opacity-90 transition-opacity duration-100 cursor-pointer"
        >
          {passed ? "Back to training" : "Back to module"}
        </button>
      </div>
    </div>
  );
}
