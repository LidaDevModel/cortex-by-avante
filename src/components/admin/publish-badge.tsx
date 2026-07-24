import { Badge } from "@/components/ui/badge";

/**
 * Publish state for a document or module. Published reads as live (success);
 * draft reads as quiet (neutral). Shape + colours from the shared Badge.
 */
export function PublishBadge({ published }: { published: boolean }) {
  return (
    <Badge tone={published ? "success" : "neutral"} className="transition-colors duration-100 ease-out">
      {published ? "Published" : "Draft"}
    </Badge>
  );
}
