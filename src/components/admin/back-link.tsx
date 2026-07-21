import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * In-canvas back affordance for admin sub-pages that aren't a direct sidebar
 * item (person detail, a content folder). Same markup as DetailHeader's back
 * link so the "go up one level" cue reads identically everywhere.
 */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100"
    >
      <ArrowLeft size={14} strokeWidth={2} />
      <span>{label}</span>
    </Link>
  );
}
