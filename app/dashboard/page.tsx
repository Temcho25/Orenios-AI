import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import DashboardShell from "./DashboardShell";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const metadataFullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  const metadataFirstName =
    metadataFullName.split(" ")[0] || "there";

  const firstName =
    profile?.first_name?.trim() ||
    metadataFirstName ||
    "there";

  const email = user.email || "";

  return (
    <DashboardShell
      firstName={firstName}
      email={email}
    />
  );
}