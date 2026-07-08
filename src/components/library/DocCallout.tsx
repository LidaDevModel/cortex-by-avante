/**
 * The document note/callout treatment — single source of truth shared by the
 * Library file viewer's page renderer and the chat CitationPanel, so the same
 * note never renders two hand-tuned variants.
 */
export function DocCallout({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[6px] px-3 py-2.5 ${className}`}
      style={{ background: "var(--doc-callout-bg)", borderLeft: "3px solid var(--doc-callout-border)" }}
    >
      <p className="text-[11.5px] leading-[1.7] italic" style={{ color: "var(--doc-text-muted)" }}>
        {children}
      </p>
    </div>
  );
}
