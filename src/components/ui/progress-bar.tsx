type Props = {
  value: number;
  height?: number;
};

export function ProgressBar({ value, height = 6 }: Props) {
  return (
    <div
      className="rounded-full bg-[var(--progress-track)] overflow-hidden"
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${value}%`, background: "var(--primary)" }}
      />
    </div>
  );
}
