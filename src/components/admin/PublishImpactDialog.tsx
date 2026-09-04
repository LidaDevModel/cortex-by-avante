"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CLEARANCE_GRACE_DAYS } from "@/lib/training-mock";

/**
 * Confirm before publishing a REQUIRED module — the one admin action with a
 * workforce-wide consequence.
 *
 * Publishing a required module assigns it to every guard in its roles, and
 * each of them then has a deadline to certify or lose clearance for duty
 * (decision D11). Before this, the action was a single menu click with no
 * indication that it touched anyone at all — the same weight as renaming a
 * document. An optional module has no such consequence and does not get this
 * dialog.
 *
 * Deliberately NOT alarming. Publishing required training is a normal,
 * correct thing for an admin to do; the dialog states the size of it and
 * offers the quieter option, in the app's own neutral tone.
 */
export function PublishImpactDialog({
  open,
  onOpenChange,
  moduleTitle,
  roleLabel,
  affected,
  clearedNow,
  onPublish,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleTitle: string;
  /** The roles this module is assigned to, already formatted. */
  roleLabel: string;
  /** Staff in those roles. */
  affected: number;
  /** How many of them are cleared for duty right now. */
  clearedNow: number;
}
  & { onPublish: () => void }) {
  // Numbers stay separate from the sentence, so the copy survives translation
  // and reads correctly at 0, 1 and many.
  const people = affected === 1 ? "1 person" : `${affected} people`;
  const cleared =
    clearedNow === 0
      ? "None of them is cleared for duty today."
      : clearedNow === 1
      ? "1 of them is cleared for duty today."
      : `${clearedNow} of them are cleared for duty today.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Publish this as required training?</AlertDialogTitle>
          <AlertDialogDescription>
            {`“${moduleTitle}” becomes required for ${roleLabel} — ${people}. ${cleared} They keep their clearance for ${CLEARANCE_GRACE_DAYS} days, and must certify in this module before then to stay cleared.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* "Keep as draft" rather than "Cancel": it names what happens, and
              nothing is being abandoned — the module stays exactly as it is. */}
          <AlertDialogCancel>Keep as draft</AlertDialogCancel>
          <AlertDialogAction onClick={onPublish}>Publish now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
