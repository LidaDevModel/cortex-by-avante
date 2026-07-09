"use client";

import { ArrowRight, Target, SlidersHorizontal, Timer } from "lucide-react";

/* One actionable preset card — icon tile · title · meta · arrow. Mirrors the
   dashboard's actionable-row idiom so the whole app speaks one card language. */
function PresetCard({
  icon,
  title,
  meta,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative flex items-center gap-4 rounded-[12px] border p-4 text-left bg-surface-raised transition-[transform,box-shadow,background-color] duration-150 disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md dark:enabled:hover:shadow-none dark:enabled:hover:bg-[var(--card-hover-bg)]"
      style={{ borderColor: "var(--border)" }}
    >
      <span
        className="flex items-center justify-center w-11 h-11 rounded-[10px] shrink-0 text-primary"
        style={{ background: "color-mix(in srgb, var(--accent-subtle) 45%, transparent)" }}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--primary)" }}>
          {title}
        </span>
        <span className="text-[13px] leading-[18px] text-muted-foreground truncate">{meta}</span>
      </span>
      <ArrowRight size={18} strokeWidth={1.5} className="shrink-0 text-muted-foreground transition-transform duration-150 group-enabled:group-hover:translate-x-0.5" />
    </button>
  );
}

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
