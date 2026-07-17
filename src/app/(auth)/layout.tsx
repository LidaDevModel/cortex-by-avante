import { ThemeProvider } from "@/components/theme-context";
import { Toaster } from "@/components/ui/toast";
import { BlobField } from "@/components/chat/BlobField";
import { AuthCursorGlow } from "@/components/auth/AuthCursorGlow";

/**
 * Auth surface — no app shell. Desktop: a split screen — the brand panel on
 * the left (the glow canvas with the ambient blob field, the same ground the
 * blobs use on the chat empty state) and the form on a clean background to the
 * right. Mobile: the panel yields to a compact brand header above the form.
 * The form side stays calm — all motion lives in the panel.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <main className="relative flex-1 flex overflow-hidden">
        {/* Brand panel — desktop only */}
        <aside className="relative hidden lg:flex w-1/2 shrink-0 flex-col justify-between gap-8 p-10 overflow-hidden canvas-glow border-r border-border">
          <BlobField />
          <AuthCursorGlow />

          <div className="relative z-10 flex flex-col gap-0.5">
            <span className="text-[22px] leading-[30px] font-bold tracking-tight" style={{ color: "var(--primary)" }}>
              Cortex
            </span>
            <span className="text-[12px] leading-[16px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
              Avante Security
            </span>
          </div>

          <div className="relative z-10 flex flex-col gap-3 pb-10">
            <h2 className="text-[28px] leading-[36px] font-bold text-foreground max-w-[420px] text-balance">
              Every protocol, procedure, and answer — in one place.
            </h2>
            <p className="text-[14px] leading-[20px] max-w-[400px] text-muted-foreground">
              Ask anything, train for your role, and stay ready — on shift or at your desk.
            </p>
          </div>

          <p className="relative z-10 text-[12px] leading-[16px] text-muted-foreground">
            © 2026 Avante Security. All rights reserved.
          </p>
        </aside>

        {/* Form side — clean white (mode-aware doc-page token), no glow */}
        <div className="relative flex-1 overflow-y-auto bg-doc-page">
          <div className="min-h-full flex flex-col items-center justify-center px-4 py-8">
            {/* Compact brand header — mobile/tablet, where the panel is hidden */}
            <div className="lg:hidden w-full max-w-[400px] flex flex-col mb-8">
              <span className="text-[16px] leading-[22px] font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
                Cortex
              </span>
              <span className="text-[12px] leading-[16px] text-muted-foreground">Avante Security</span>
            </div>
            {children}
          </div>
        </div>
      </main>
      <Toaster />
    </ThemeProvider>
  );
}
