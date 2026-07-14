import { ThemeProvider } from "@/components/theme-context";
import { Toaster } from "@/components/ui/toast";
import { BlobField } from "@/components/chat/BlobField";

/**
 * Auth surface — no app shell (sidebar/tab bar): a centered card on the glow
 * canvas with the ambient blob field. The brand-warm first impression for a
 * new hire; the form itself stays calm (motion lives in the background only).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <main className="relative flex-1 flex flex-col overflow-hidden canvas-glow">
        <BlobField />
        <div className="relative z-10 flex-1 overflow-y-auto flex items-center justify-center px-4 py-8">
          {children}
        </div>
      </main>
      <Toaster />
    </ThemeProvider>
  );
}
