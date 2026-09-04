"use client";

import { useRouter } from "next/navigation";
import { Target, Timer, Check, SlidersHorizontal } from "lucide-react";
import { PresetCard } from "@/components/knowledge-check/PresetCard";

import { getWeakAreaMeta, getTodaysDailyAttempt } from "@/lib/kc-store";
import { learnerModules } from "@/lib/training-store";
import { useCurrentRole } from "@/lib/current-role";

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
  // Shared with the Knowledge Check screen so the two can never disagree.
  const weakAreaMeta = getWeakAreaMeta(["mc", "matching", "branching"]);
  const examSimAvailable = learnerModules(useCurrentRole()).some((m) => m.status === "in-progress");

  const go = (start: string) => () => router.push(`/training/quick-check?start=${start}`);

  return (
    <section
      className="h-full rounded-[12px] p-6 flex flex-col gap-5 bg-surface-raised"
      style={{ border: "1px solid var(--border)" }}
    >
      <h2 className="type-h2 font-semibold text-foreground">Quick practice</h2>

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
            icon={<span className="type-h3 font-bold tabular-nums leading-none">5</span>}
            title="Daily 5"
            /* "exercises", not "questions": a matching exercise scores one point per
   pair, so five items are worth more than five points. The card said "5
   questions" and the results said "6 of 8 correct", and a guard had no way
   to reconcile the two. Each surface now names its own unit. */
            meta="5 exercises · mixed · ~4 min"
            onClick={go("daily5")}
            className="bg-surface-chip"
          />
        )}

        <PresetCard
          icon={<Target size={20} strokeWidth={1.5} />}
          title="Weak areas"
          meta={weakAreaMeta ?? "Complete a check to unlock"}
          onClick={go("weak")}
          disabled={!weakAreaMeta}
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
