"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useIsMobile } from "@/hooks/use-mobile";
import { findSection } from "@/lib/library-mock";
import { getLearnerDoc } from "@/lib/content-store";
import { useCurrentRole } from "@/lib/current-role";

const OPEN_DELAY = 150; // hover-intent: don't flash on pass-through
const CLOSE_DELAY = 120; // grace so the pointer can travel into the card

/**
 * A chat citation. Because the source lives inside the product, the chip works
 * like a real citation: a lightweight preview of the cited section on hover
 * (desktop) or tap (mobile), and clicking goes to the source in the Library.
 *
 * The preview is deliberately short (title + excerpt) — the full section is one
 * click away, so the popover is for a quick "is this legit / what's the gist"
 * glance, not for reading the whole thing.
 */
export function CitationChip({
  docId,
  sectionId,
  label,
  delayMs,
}: {
  docId: string;
  sectionId: string;
  label: string;
  delayMs: number;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const role = useCurrentRole();
  const [open, setOpen] = useState(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = getLearnerDoc(docId, role);
  const section = result ? findSection(result.doc, sectionId) : undefined;
  // from=chat tells the file viewer to offer "Back to conversation".
  const href = `/library/files/${docId}?section=${sectionId}&from=chat`;

  const openSoon = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    enterTimer.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  }, []);
  const closeSoon = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    leaveTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }, []);
  const cancelClose = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <button
          type="button"
          onPointerEnter={isMobile ? undefined : openSoon}
          onPointerLeave={isMobile ? undefined : closeSoon}
          onClick={() => {
            if (isMobile) setOpen(o => !o); // tap = peek; the card's link navigates
            else router.push(href);         // desktop click = go to source
          }}
          className="inline-flex items-center gap-0.5 mx-1 px-2 py-0.5 rounded-md text-[12px] font-medium text-primary cursor-pointer hover:bg-primary/10 transition-colors duration-100 whitespace-nowrap"
          style={{
            background: "color-mix(in srgb, var(--primary) 10%, var(--surface))",
            animation: `chip-in 150ms ease-out ${delayMs}ms both`,
          }}
        >
          {label}
          <ArrowUpRight size={10} />
        </button>
      </PopoverPrimitive.Anchor>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          align="center"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={e => e.preventDefault()}
          onPointerEnter={isMobile ? undefined : cancelClose}
          onPointerLeave={isMobile ? undefined : closeSoon}
          className="z-50 w-[300px] max-w-[calc(100vw-24px)] rounded-[10px] border border-border bg-surface p-3 flex flex-col gap-1.5 origin-(--radix-popover-content-transform-origin) data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          style={{ boxShadow: "var(--shadow-floating)" }}
        >
          {result && section ? (
            <>
              <div className="flex flex-col gap-0.5">
                {section.parentTitle && (
                  <span className="text-[11px] leading-[15px] text-muted-foreground truncate">{section.parentTitle}</span>
                )}
                <span className="text-[13px] leading-[18px] font-semibold text-foreground">{result.doc.name}</span>
                <span className="text-[12px] leading-[16px] font-medium truncate" style={{ color: "var(--primary)" }}>
                  {section.num}. {section.title}
                </span>
              </div>
              <p className="text-[12.5px] leading-[18px] text-muted-foreground line-clamp-3">{section.body}</p>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 self-start pt-0.5 text-[12px] font-medium transition-colors duration-100"
                style={{ color: "var(--primary)" }}
              >
                Open in Library
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </Link>
            </>
          ) : (
            <p className="text-[12.5px] leading-[18px] text-muted-foreground">This source couldn&apos;t be found.</p>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
