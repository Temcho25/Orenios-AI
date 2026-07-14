import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { waitlistRateLimit } from "@/app/lib/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    const { success, reset } = await waitlistRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(
              1,
              Math.ceil((reset - Date.now()) / 1000)
            ).toString(),
          },
        }
      );
    }

    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("waitlist").insert([{ email }]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          alreadyJoined: true,
        });
      }

      console.error("Waitlist insert failed:", {
        code: error.code,
        message: error.message,
      });

      return NextResponse.json(
        {
          error: "We could not add you right now. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyJoined: false,
    });
  } catch (error) {
    console.error("Waitlist request failed:", error);

    return NextResponse.json(
      {
        error: "We could not process your request. Please try again.",
      },
      { status: 500 }
    );
  }
}