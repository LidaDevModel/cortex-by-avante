import { FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

export type DocKind = "document" | "folder";

/**
 * Document / folder badge used across the field-agent Library list and the
 * admin Content manager — one pill, one look, everywhere.
 */
export function KindPill({ kind }: { kind: DocKind }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12px] leading-[16px] font-medium px-2 py-0.5 rounded-full border",
        kind === "document"
          ? "border-[color-mix(in_srgb,var(--primary)_25%,transparent)] text-[var(--primary)]"
          : "border-border text-muted-foreground"
      )}
    >
      {kind === "document" ? <FileText size={11} strokeWidth={1.5} /> : <Folder size={11} strokeWidth={1.5} />}
      {kind === "document" ? "File" : "Folder"}
    </span>
  );
}
