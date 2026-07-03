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
      <aside
        className="shrink-0 flex flex-col overflow-hidden"
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
