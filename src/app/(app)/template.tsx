/**
 * Re-mounts on every route change inside the app shell, giving each screen the
 * VISION 200ms content fade-in without any screen having to opt in.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{ animation: "msg-in 200ms ease-out both" }}
    >
      {children}
    </div>
  );
}
