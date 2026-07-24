import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Module } from "@/lib/training-mock";

const ILLUSTRATION_GLOW_CARD = "var(--illustration-glow-card)";
const ILLUSTRATION_GLOW_SIDE_CARD = "var(--illustration-glow-side-card)";

/** Required/Optional status pill shown on module cards. Outline variant of the
 *  shared Badge — required reads as primary, optional as neutral. */
export function RequiredPill({ required }: { required: boolean }) {
  return (
    <Badge variant="outline" tone={required ? "primary" : "neutral"} className="self-start">
      {required ? "Required" : "Optional"}
    </Badge>
  );
}

/** Large vertical card — used in the training "In progress" row and elsewhere it needs prominence. */
export function InProgressCard({ module, style }: { module: Module; style?: React.CSSProperties }) {
  return (
    <Link
      href={`/training/modules/${module.id}`}
      className="relative flex flex-col rounded-[12px] overflow-hidden cursor-pointer bg-[var(--surface-raised)] hover:shadow-md hover:-translate-y-0.5 dark:hover:shadow-none dark:hover:bg-[var(--card-hover-bg)] transition-[box-shadow,background-color,transform] duration-150"
      style={{ border: "1px solid var(--border)", ...style }}
    >
      {/* Illustration area — gradient anchored to icon zone, bleeds into card body below */}
      <div className="relative flex items-center justify-center" style={{ height: 157 }}>
        <div className="absolute inset-x-0 top-0 pointer-events-none z-0" style={{ height: "calc(100% + 600px)", background: ILLUSTRATION_GLOW_CARD }} />
        <ModuleIllustration category={module.category} width={80} height={80} className="relative object-contain z-10" />
      </div>

      {/* Content — z-10 so it sits above the bleeding gradient */}
      <div className="relative z-10 flex flex-col gap-2 px-3 pt-3 pb-3">
        <p className="text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>
          {module.title}
        </p>
        <p className="text-[12px] leading-[16px] text-muted-foreground">
          {module.chapters} chapters · {module.hours}h
        </p>
        <ProgressBar value={module.progress} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] leading-[16px] text-muted-foreground">
            {module.status === "completed" ? "Completed" : module.status === "not-started" ? "Not started" : `${module.progress}% complete`}
          </span>
          <RequiredPill required={module.required} />
        </div>
      </div>
    </Link>
  );
}

/** Compact horizontal card — used in the training module list. */
export function ModuleCard({ module, style }: { module: Module; style?: React.CSSProperties }) {
  const showProgress = module.status !== "not-started";
  return (
    <Link
      href={`/training/modules/${module.id}`}
      className="relative flex rounded-[12px] overflow-hidden cursor-pointer bg-[var(--surface-raised)] hover:shadow-md hover:-translate-y-0.5 dark:hover:shadow-none dark:hover:bg-[var(--card-hover-bg)] transition-[box-shadow,background-color,transform] duration-150"
      style={{ border: "1px solid var(--border)", ...style }}
    >
      {/* Illustration column — gradient anchored to icon zone, bleeds rightward into text area */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: 88 }}>
        <div className="absolute inset-y-0 left-0 pointer-events-none z-0" style={{ width: "calc(100% + 200px)", background: ILLUSTRATION_GLOW_SIDE_CARD }} />
        <ModuleIllustration category={module.category} width={40} height={40} className="relative object-contain z-10" />
      </div>

      {/* Right content — z-10 so it sits above the bleeding gradient */}
      <div className="relative z-10 flex flex-col gap-1.5 min-w-0 flex-1 px-3 py-3">
        <p className="text-[14px] leading-[20px] font-semibold truncate" style={{ color: "var(--foreground)" }}>
          {module.title}
        </p>
        <p className="text-[12px] leading-[16px] text-muted-foreground whitespace-nowrap">
          {module.chapters} chapters · {module.hours}h
        </p>
        {showProgress ? (
          <div className="flex items-center gap-2">
            <div className="flex-1"><ProgressBar value={module.progress} /></div>
            <span className="text-[12px] leading-[16px] text-muted-foreground shrink-0 w-8 text-right">
              {module.status === "completed" ? "100%" : `${module.progress}%`}
            </span>
          </div>
        ) : (
          <span className="text-[12px] leading-[16px] text-muted-foreground">Not started</span>
        )}
        <RequiredPill required={module.required} />
      </div>
    </Link>
  );
}
