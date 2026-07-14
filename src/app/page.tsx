import { redirect } from "next/navigation";

export default function RootPage() {
  // The AuthGate on the app shell bounces signed-out visitors to /sign-in.
  redirect("/dashboard");
}
