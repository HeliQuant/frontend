import { redirect } from "next/navigation";

/** /setup is superseded by /onboarding (the no-custody register flow). Keep the route as a redirect. */
export default function SetupPage() {
  redirect("/onboarding");
}
