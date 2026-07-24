import { FileText, Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type DocKind = "document" | "folder";

/**
 * Document / folder badge used across the field-agent Library list and the
 * admin Content manager — one pill, one look, everywhere. Outline variant of
 * the shared Badge: document reads as primary, folder as neutral.
 */
export function KindPill({ kind }: { kind: DocKind }) {
  const doc = kind === "document";
  return (
    <Badge
      variant="outline"
      tone={doc ? "primary" : "neutral"}
      icon={doc ? <FileText size={11} strokeWidth={1.5} /> : <Folder size={11} strokeWidth={1.5} />}
    >
      {doc ? "File" : "Folder"}
    </Badge>
  );
}
