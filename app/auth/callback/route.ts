import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../lib/supabase-server";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(
    request.nextUrl.searchParams.get("next")
  );

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (!error) {
      return NextResponse.redirect(
        new URL(nextPath, request.nextUrl.origin)
      );
    }
  }

  return NextResponse.redirect(
    new URL(
      "/forgot-password?error=invalid-link",
      request.nextUrl.origin
    )
  );
}
