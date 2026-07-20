import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "dialkit/styles.css";
import { DialRoot } from "dialkit";
import { DevPalette } from "@/components/dev/DevPalette";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Avante Cortex",
  description: "AI-powered knowledge and training platform for Avante Security",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full overflow-hidden antialiased", plusJakartaSans.variable)} suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('cortex-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||((s===null||s==='system')&&d))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="h-full overflow-hidden flex flex-col font-sans">
        <TooltipProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </TooltipProvider>
        {/* Design-time parameter tweaking (dialkit) — dev only, never shipped
            to production users. Sibling of the app content, not wrapping it.
            DevPalette registers the palette, illustration and version dials. */}
        {process.env.NODE_ENV !== "production" && (
          <>
            <DialRoot />
            <DevPalette />
          </>
        )}
      </body>
    </html>
  );
}
