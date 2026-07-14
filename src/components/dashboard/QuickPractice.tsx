"use client";

import { useRouter } from "next/navigation";
import { Target, Timer, Check, SlidersHorizontal } from "lucide-react";
import { PresetCard } from "@/components/knowledge-check/PresetCard";
import { CATEGORY_LABELS } from "@/lib/knowledge-check-mock";
import { getWeakestCategories, getTodaysDailyAttempt } from "@/lib/kc-store";
import { getModules } from "@/lib/training-mock";

/**
 * Quick practice — the dashboard on-ramp to Knowledge Check. Four stacked
 * preset cards (Daily 5, Weak areas, Exam simulation, Custom check) that
 * deep-link into the Knowledge Check engine via ?start=… — the engine is
 * parameterized, never forked. Daily 5 flips to a quiet "done for today" state
 * once completed.
 */
export function QuickPractice() {
  const router = useRouter();

  const dailyDone = getTodaysDailyAttempt();
  const weakest = getWeakestCategories(1);
  const weakestLabel = weakest.length > 0 ? CATEGORY_LABELS[weakest[0]] : null;
  const examSimAvailable = getModules().some((m) => m.status === "in-progress");

  const go = (start: string) => () => router.push(`/training/quick-check?start=${start}`);

  return (
    <section
      className="h-full rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
      style={{ border: "1px solid var(--border)" }}
    >
      <h2 className="text-[20px] leading-[28px] font-semibold text-foreground">Quick practice</h2>

      {/* Flat chips carry the equal-contrast pair (doc-page white / --accent 0.36)
          so they match the bloomed rows' luminance in the neighbouring widgets. */}
      <div className="flex flex-col gap-3">
        {dailyDone ? (
          <PresetCard
            icon={<Check size={20} strokeWidth={2} />}
            title="Daily 5"
            meta={`Done for today · ${dailyDone.score}/${dailyDone.total}`}
            onClick={() => router.push(`/training/quick-check/${dailyDone.id}`)}
            className="bg-surface-chip"
          />
        ) : (
          <PresetCard
            icon={<span className="text-[17px] font-bold tabular-nums leading-none">5</span>}
            title="Daily 5"
            meta="5 questions · mixed · ~4 min"
            onClick={go("daily5")}
            className="bg-surface-chip"
          />
        )}

        <PresetCard
          icon={<Target size={20} strokeWidth={1.5} />}
          title="Weak areas"
          meta={weakestLabel ? `Targets your weakest area: ${weakestLabel}` : "Complete a check to unlock"}
          onClick={go("weak")}
          disabled={!weakestLabel}
          className="bg-surface-chip"
        />

        <PresetCard
          icon={<Timer size={20} strokeWidth={1.5} />}
          title="Exam simulation"
          meta={examSimAvailable ? "Timed practice exam · by module" : "Start a module to unlock"}
          onClick={go("examSim")}
          disabled={!examSimAvailable}
          className="bg-surface-chip"
        />

        <PresetCard
          icon={<SlidersHorizontal size={20} strokeWidth={1.5} />}
          title="Custom check"
          meta="Choose formats and categories"
          onClick={go("custom")}
          className="bg-surface-chip"
        />
      </div>
    </section>
  );
}
