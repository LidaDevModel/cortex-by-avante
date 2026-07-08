"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { DocCallout } from "@/components/library/DocCallout";
import { getDocById, findSection } from "@/lib/library-mock";

export type Citation = { docId: string; sectionId: string; label: string };

type Props = {
  citation: Citation | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * A compact preview of a chat citation's source section — opened by clicking a
 * SourceChip. Keeps the conversation visible/present so verifying a claim
 * doesn't cost the user their place in the chat. "Open in Library" escalates
 * to the full file viewer, deep-linked to this exact section.
 */
export function CitationPanel({ citation, onOpenChange }: Props) {
  const isMobile = useIsMobile();
  const result = citation ? getDocById(citation.docId) : undefined;
  const section = result && citation ? findSection(result.doc, citation.sectionId) : undefined;

  return (
    <Sheet open={!!citation} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className="flex flex-col max-h-full">
        {citation && result && section ? (
          <>
            <SheetHeader>
              <SheetTitle className="text-[18px] leading-[26px]">{result.doc.name}</SheetTitle>
              <SheetDescription>
                {section.parentTitle && (
                  <span className="block text-[12px] text-muted-foreground mb-0.5">{section.parentTitle}</span>
                )}
                <span className="text-[14px] font-medium" style={{ color: "var(--primary)" }}>
                  {section.num}. {section.title}
                </span>
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3 text-[14px] leading-[22px] text-foreground">
              <p>{section.body}</p>
              {section.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
              {section.points && section.points.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {section.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-[7px] shrink-0 size-[5px] rounded-full" style={{ background: "var(--primary)", opacity: 0.5 }} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.note && <DocCallout>{section.note}</DocCallout>}
            </div>

            <SheetFooter>
              <Link
                href={`/library/files/${citation.docId}?section=${citation.sectionId}`}
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-[8px] text-[14px] leading-[20px] font-semibold transition-opacity duration-100 hover:opacity-90"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Open in Library
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </Link>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-[14px] text-muted-foreground">This source couldn&apos;t be found.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
