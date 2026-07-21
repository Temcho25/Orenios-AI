-- MUTATING: creates a new table, enables RLS, and adds policies/indexes.
-- Does not touch any existing table (profiles, tasks, goals, etc.).
--
-- Purpose: mirrors Paddle subscription state so the app can check a
-- user's plan/entitlements from Supabase without calling the Paddle API
-- on every request. This table is written to ONLY by the Paddle webhook
-- route, using the service-role client (which bypasses RLS entirely) —
-- there are deliberately no insert/update/delete policies for
-- anon/authenticated below, so a signed-in user cannot grant themselves
-- a plan by calling the Supabase client directly.
--
-- subscription_id is the Paddle subscription ID and is the primary key.
-- If a user cancels and later resubscribes, Paddle issues a NEW
-- subscription ID — this table keeps both rows rather than overwriting,
-- so app code must look up "my current plan" as the most recently
-- updated row for a given user_id, not assume one row per user.

create table if not exists public.subscriptions (
  subscription_id text primary key,
  user_id uuid not null references auth.users (id),
  paddle_customer_id text not null,
  status text not null,
  plan_tier text not null,
  price_id text not null,
  scheduled_change timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists subscriptions_paddle_customer_id_idx
  on public.subscriptions (paddle_customer_id);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No insert/update/delete policy for anon or authenticated on purpose —
-- only the service-role client (used exclusively by the webhook route)
-- can write to this table.
