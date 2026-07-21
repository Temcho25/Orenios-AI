import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  SubscriptionCanceledEvent,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
  type SubscriptionNotification,
} from "@paddle/paddle-node-sdk";
import { paddle } from "@/app/lib/paddle-server";
import { planTierFromPriceId } from "@/app/lib/paddle-plans";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing required Supabase environment variables");
}

if (!process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET) {
  throw new Error(
    "Missing required PADDLE_NOTIFICATION_WEBHOOK_SECRET environment variable"
  );
}

// A fresh const (rather than reusing the process.env read above) so its
// inferred type is a plain `string`, not `string | undefined` — TS
// narrowing from the guard above doesn't carry into the POST closure
// below since it's a different scope.
const webhookSecret: string = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET;

// Service-role client — this route has no user session (Paddle calls it
// directly), and subscriptions has no insert/update policy for anon or
// authenticated by design, so only this client can write to it.
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function upsertSubscription(data: SubscriptionNotification) {
  const userId = data.customData?.user_id;

  if (typeof userId !== "string" || !userId) {
    // Nothing we can do without a user to attach this to (e.g. a
    // subscription created/edited directly in the Paddle dashboard
    // without going through our Checkout, which always sets
    // customData.user_id). Not a transient failure, so don't ask
    // Paddle to retry — just acknowledge and skip.
    console.error(
      "Paddle webhook: subscription has no customData.user_id, skipping",
      { subscriptionId: data.id }
    );
    return;
  }

  const priceId = data.items[0]?.price?.id;
  const planTier = priceId ? planTierFromPriceId(priceId) : null;

  if (!priceId || !planTier) {
    console.error(
      "Paddle webhook: subscription price_id doesn't map to a known plan_tier, skipping",
      { subscriptionId: data.id, priceId }
    );
    return;
  }

  // Upsert keyed on the Paddle subscription ID is itself the
  // idempotency mechanism here — a retried or duplicate delivery of the
  // same event just writes the same row again, no separate dedupe
  // ledger needed for this side effect (see paddle-agent-skills'
  // webhooks/subscription-sync guides).
  const { error } = await supabase.from("subscriptions").upsert(
    {
      subscription_id: data.id,
      user_id: userId,
      paddle_customer_id: data.customerId,
      status: data.status,
      plan_tier: planTier,
      price_id: priceId,
      scheduled_change: data.scheduledChange?.effectiveAt ?? null,
      current_period_end: data.currentBillingPeriod?.endsAt ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "subscription_id" }
  );

  if (error) {
    // A real DB failure — this is the one case worth asking Paddle to
    // retry, so let it propagate to the outer catch.
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Raw body is required — Paddle's signature is computed over the
    // exact bytes it sent. Using request.json() here would parse and
    // re-serialize the body, silently breaking every signature check.
    const rawBody = await request.text();
    const signature = request.headers.get("paddle-signature");

    if (!signature) {
      // Treated the same as any other verification failure below —
      // never 2xx here, so this stays in the retry queue rather than
      // being permanently marked "delivered".
      throw new Error("Paddle webhook: missing paddle-signature header");
    }

    // unmarshal() verifies the HMAC signature AND checks the timestamp
    // hasn't expired, throwing on either failure.
    const event = await paddle.webhooks.unmarshal(
      rawBody,
      webhookSecret,
      signature
    );

    if (
      event instanceof SubscriptionCreatedEvent ||
      event instanceof SubscriptionUpdatedEvent ||
      event instanceof SubscriptionCanceledEvent
    ) {
      await upsertSubscription(event.data);
    }

    // transaction.completed and any other event types are acknowledged
    // but not written anywhere — subscription.created/updated/canceled
    // already carry the full current state (status, plan, period,
    // scheduled_change), so they're the single source of truth for the
    // subscriptions table. Writing the same row from two event types
    // would just add a race with no benefit.

    return NextResponse.json({ received: true });
  } catch (error) {
    // Any failure here — bad signature, expired timestamp, DB error —
    // must NOT return 2xx: that's the one response Paddle treats as
    // "delivered successfully" and will never retry. Everything else
    // (400 here) keeps it in the retry queue.
    console.error("Paddle webhook processing failed:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
