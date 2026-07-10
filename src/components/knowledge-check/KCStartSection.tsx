"use client";

import { Target, SlidersHorizontal, Timer } from "lucide-react";
import { PresetCard } from "@/components/knowledge-check/PresetCard";

export function KCStartSection({
  weakestLabel,
  examSimAvailable,
  onDaily5,
  onWeakAreas,
  onExamSim,
  onCustom,
}: {
  /** Label of the weakest category, or null when there's no history yet. */
  weakestLabel: string | null;
  /** False when no module is in progress to rehearse. */
  examSimAvailable: boolean;
  onDaily5: () => void;
  onWeakAreas: () => void;
  onExamSim: () => void;
  onCustom: () => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <p className="section-label">Start a check</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PresetCard
          icon={<span className="text-[17px] font-bold tabular-nums leading-none">5</span>}
          title="Daily 5"
          meta="5 questions · mixed · ~4 min"
          onClick={onDaily5}
        />
        <PresetCard
          icon={<Target size={20} strokeWidth={1.5} />}
          title="Weak areas"
          meta={weakestLabel ? `Targets your weakest area: ${weakestLabel}` : "Complete a check to unlock"}
          onClick={onWeakAreas}
          disabled={!weakestLabel}
        />
        <PresetCard
          icon={<Timer size={20} strokeWidth={1.5} />}
          title="Exam simulation"
          meta={examSimAvailable ? "Timed practice exam · by module" : "Start a module to unlock"}
          onClick={onExamSim}
          disabled={!examSimAvailable}
        />
        <PresetCard
          icon={<SlidersHorizontal size={20} strokeWidth={1.5} />}
          title="Custom check"
          meta="Choose formats and categories"
          onClick={onCustom}
        />
      </div>
    </section>
  );
}
