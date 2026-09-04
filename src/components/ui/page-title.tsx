import { cn } from "@/lib/utils";

/**
 * PageTitle — the screen's name, and at most one line under it.
 *
 * NOT part of `PageHeader`: that is the top bar (sidebar trigger, breadcrumb,
 * notifications bell), and it sits outside the scroll canvas. Moving the
 * title into it would move the title out of the page. This is the in-body
 * block every screen already wrote by hand.
 *
 * WHY IT EXISTS. Thirteen screens wrote their own, and the slot under the
 * title had grown three different treatments: six pages set a description at
 * 14/20, two set a metadata line at 14/22, three set nothing, and two put a
 * badge there instead. When the type mapping later gave 14/20 a weight, all
 * six descriptions turned semibold and nobody could fix it in one place.
 *
 * TWO NAMED SLOTS, NEVER BOTH:
 *
 *   description — prose that says what the screen is for. Body type
 *                 (16/26, regular), because it is read as a sentence.
 *   meta        — a date, a count, a status line. Caption type, muted.
 *
 * A date is not a description. Allowing one slot to hold both at two sizes is
 * exactly the collision this component removes, so passing both throws in
 * development.
 */
export function PageTitle({
  title,
  description,
  meta,
  badge,
  className,
}: {
  title: React.ReactNode;
  /** Prose. Body type. Mutually exclusive with `meta`. */
  description?: React.ReactNode;
  /** A date, a count, a status. Caption type. Mutually exclusive with `description`. */
  meta?: React.ReactNode;
  /** Sits inline beside the title — a cleared badge, a loading skeleton. */
  badge?: React.ReactNode;
  className?: string;
}) {
  if (process.env.NODE_ENV !== "production" && description && meta) {
    throw new Error(
      "PageTitle: pass `description` OR `meta`, not both. A description is prose " +
        "about the screen; meta is a date or a count. One slot holding both at two " +
        "sizes is the collision this component exists to remove."
    );
  }

  return (
    <div
      // Follows the house convention, and makes the block findable: a probe
      // that fell back to the h1's nearest div was measuring the badge
      // wrapper and reporting the metadata line as absent.
      data-slot="page-title"
      className={cn("flex flex-col gap-1", className)}
    >
      {badge ? (
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="type-h1 font-bold text-foreground">{title}</h1>
          {badge}
        </div>
      ) : (
        <h1 className="type-h1 font-bold text-foreground">{title}</h1>
      )}
      {description && <p className="type-body text-muted-foreground">{description}</p>}
      {meta && <p className="type-meta text-muted-foreground">{meta}</p>}
    </div>
  );
}
