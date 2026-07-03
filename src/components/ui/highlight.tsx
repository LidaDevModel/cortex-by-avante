export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const q = query.toLowerCase();
  const segments: { start: number; end: number }[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const idx = text.toLowerCase().indexOf(q, cursor);
    if (idx === -1) break;
    segments.push({ start: idx, end: idx + q.length });
    cursor = idx + q.length;
  }
  if (segments.length === 0) return <>{text}</>;
  const nodes: React.ReactNode[] = [];
  let pos = 0;
  for (const { start, end } of segments) {
    if (start > pos) nodes.push(text.slice(pos, start));
    nodes.push(
      <mark
        key={start}
        style={{
          background: "color-mix(in srgb, var(--primary) 15%, transparent)",
          color: "var(--primary)",
          borderRadius: 2,
          padding: "0 1px",
        }}
      >
        {text.slice(start, end)}
      </mark>
    );
    pos = end;
  }
  if (pos < text.length) nodes.push(text.slice(pos));
  return <>{nodes}</>;
}
