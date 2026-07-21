"use client";

import { useState } from "react";
import { openPlanCheckout } from "../lib/paddle-client";
import { PLAN_DETAILS, PLAN_PRICE_IDS, PLAN_TIERS } from "../lib/paddle-plans";

type PricingPlansProps = {
  userId: string;
  email?: string;
};

export default function PricingPlans({ userId, email }: PricingPlansProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubscribe(tier: (typeof PLAN_TIERS)[number]) {
    const priceId = PLAN_PRICE_IDS[tier];

    if (!priceId) {
      setErrorMessage(
        "This plan isn't available yet. Please try again later."
      );
      return;
    }

    setErrorMessage("");
    setLoadingTier(tier);

    try {
      await openPlanCheckout({ priceId, userId, email });
    } catch (error) {
      console.error(error);
      setErrorMessage("Couldn't open checkout. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <main className="min-h-screen bg-surface-dark px-6 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Choose your plan
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Start with the plan that fits you today — you can change or
          cancel anytime.
        </p>

        {errorMessage && (
          <p className="mt-6 text-sm font-medium text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {PLAN_TIERS.map((tier) => {
            const plan = PLAN_DETAILS[tier];

            return (
              <div
                key={tier}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-300">
                  {plan.name}
                </p>

                <p className="mt-3 text-3xl font-bold text-white">
                  {plan.priceLabel}
                </p>

                <button
                  type="button"
                  onClick={() => handleSubscribe(tier)}
                  disabled={loadingTier === tier}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 text-sm font-semibold text-white transition-colors duration-300 hover:from-violet-400 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingTier === tier ? "Opening..." : `Get ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
