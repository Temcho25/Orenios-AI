"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstancePromise: Promise<Paddle | undefined> | null = null;

// initializePaddle() loads Paddle.js from Paddle's CDN and should only
// ever run once per page — this caches the in-flight/resolved promise
// so multiple checkout triggers on the same page share one instance
// instead of re-initializing.
function getPaddleClient(): Promise<Paddle | undefined> {
  if (!paddleInstancePromise) {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

    if (!token) {
      throw new Error(
        "Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN environment variable"
      );
    }

    paddleInstancePromise = initializePaddle({
      token,
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
          ? "production"
          : "sandbox",
    });
  }

  return paddleInstancePromise;
}

type OpenPlanCheckoutArgs = {
  priceId: string;
  userId: string;
  email?: string;
};

// user_id travels in customData rather than being matched via email —
// it's set once here and Paddle echoes it back on every subsequent
// webhook event for this subscription (see the paddle-agent-skills
// webhooks/subscription-sync guides), so the link never depends on the
// email the customer actually pays with matching their app account.
export async function openPlanCheckout({
  priceId,
  userId,
  email,
}: OpenPlanCheckoutArgs) {
  const paddle = await getPaddleClient();

  if (!paddle) {
    throw new Error("Paddle.js failed to initialize");
  }

  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData: { user_id: userId },
    customer: email ? { email } : undefined,
    settings: { variant: "one-page" },
  });
}
