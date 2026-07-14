import { cn } from "@/lib/utils";

type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: number;
  className?: string;
};

export function SplitPanel({ left, right, leftWidth = 354, className }: Props) {
  return (
    <div className={cn("flex flex-1 overflow-hidden", className)} style={{ background: "var(--surface)" }}>
      {/* The fixed-width rail is a desktop affordance — below md it would eat
          most of the viewport, so consumers provide a mobile alternative
          (e.g. the file viewer's contents sheet). */}
      <aside
        className="shrink-0 hidden md:flex flex-col overflow-hidden"
        style={{ width: leftWidth, borderRight: "1px solid var(--border)" }}
      >
        {left}
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {right}
      </div>
    </div>
  );
}
