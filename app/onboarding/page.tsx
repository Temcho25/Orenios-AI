import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import OnboardingFlow from "./OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const metadataFullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  const metadataFirstName = metadataFullName.split(" ")[0] || "there";

  const firstName =
    profile?.first_name?.trim() || metadataFirstName || "there";

  return (
    <OnboardingFlow
      userId={user.id}
      firstName={firstName}
    />
  );
}
