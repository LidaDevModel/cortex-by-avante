import type { CSSProperties } from "react";

/**
 * The ambient drifting-blob background used behind the AI chat empty state and
 * the dashboard's Ask Cortex card. Two soft radial blobs animate on independent
 * loops. Absolutely fills its (relatively-positioned, card-radius) parent and
 * clips itself, so blobs never bleed outside.
 *
 * `scale` multiplies the drift amplitude via the shared `--blob-scale` custom
 * property (see the blob-1/blob-2 keyframes) — use < 1 on smaller surfaces like
 * the dashboard card so the motion stays proportional, 1 on the full chat canvas.
 */
export function BlobField({ scale = 1 }: { scale?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ borderRadius: "var(--radius-card)", ["--blob-scale" as string]: scale } as CSSProperties}
    >
      {/* Left blob — starts -10% left so its edge stays off-surface at max drift */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "80%",
          height: "80%",
          top: "10%",
          left: "-10%",
          background: "radial-gradient(ellipse 70% 70% at 40% 50%, var(--blob-1) 0%, transparent 70%)",
          animation: "blob-1 9s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Right blob — ends -10% right for the same reason */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "80%",
          height: "80%",
          top: "10%",
          right: "-10%",
          background: "radial-gradient(ellipse 70% 70% at 60% 50%, var(--blob-2) 0%, transparent 70%)",
          animation: "blob-2 12s ease-in-out infinite",
          willChange: "transform",
        }}
      />
    </div>
  );
}
