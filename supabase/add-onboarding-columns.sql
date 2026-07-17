-- MUTATING: adds two columns to an existing table.
-- Does not touch existing rows beyond applying the new column defaults,
-- does not change RLS policies (both new columns are covered by the
-- table's existing owner policies: auth.uid() = id for select/update).
--
-- Purpose: lets Orenios show a short onboarding flow to new users right
-- after signup, track whether they finished it, and remember which
-- focus area they picked for future personalization.

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

alter table public.profiles
  add column if not exists onboarding_focus text;

-- Existing users signed up before this column existed and never saw an
-- onboarding flow — treat them as already onboarded so they aren't
-- redirected into it on their next login. New signups after this
-- migration still get the column's default of false.
update public.profiles
  set onboarding_completed = true;
