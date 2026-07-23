/**
 * Publish state for a document or module. Published reads as live (success);
 * draft reads as quiet (muted chip). Same shape as StatusPill.
 */
export function PublishBadge({ published }: { published: boolean }) {
  return (
    <span
      className="inline-flex items-center px-2 py-[2px] rounded-[6px] text-[12px] leading-[16px] font-medium transition-colors duration-100 ease-out"
      style={
        published
          ? { background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" }
          : { background: "color-mix(in srgb, var(--muted-foreground) 14%, transparent)", color: "var(--muted-foreground)" }
      }
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
