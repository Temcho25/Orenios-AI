import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import PricingPlans from "./PricingPlans";

export default async function PricingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // login/page.tsx doesn't currently support a post-login redirect
    // target, so this always lands on /dashboard after signing in —
    // not wiring up a ?next= param that the login page would ignore.
    redirect("/login");
  }

  return <PricingPlans userId={user.id} email={user.email} />;
}
