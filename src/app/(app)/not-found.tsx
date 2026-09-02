import { NotFoundState } from "@/components/ui/not-found-state";

/**
 * `notFound()` raised inside an app route. Renders INSIDE the shell, so the
 * sidebar, nav and breadcrumb stay put and the user is still somewhere rather
 * than nowhere. The root not-found handles unmatched URLs, which Next resolves
 * outside any route group.
 */
export default function AppNotFound() {
  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <NotFoundState
        title="Page not found"
        description="That link doesn't lead anywhere. It may have been moved or removed."
        actionLabel="Back to home"
        actionHref="/dashboard"
      />
    </div>
  );
}
