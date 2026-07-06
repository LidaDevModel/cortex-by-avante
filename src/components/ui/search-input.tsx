import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({ value, onChange, placeholder = "Search...", className }: Props) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={16}
        strokeWidth={1.5}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-8 rounded-[8px] border border-border bg-[var(--surface-raised)] text-[14px] leading-[20px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 transition-shadow duration-100"
        style={{ "--tw-ring-color": "color-mix(in srgb, var(--primary) 25%, transparent)" } as React.CSSProperties}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          <X size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
