-- Orenios AI — production RLS hardening applied on 2026-07-15
-- Keep this file as the reproducible record of the verified database change.
-- Review against the current schema before applying to another environment.

begin;

alter policy "Users can delete own goals"
  on public.goals
  to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can insert own goals"
  on public.goals
  to authenticated
  with check ((select auth.uid()) = user_id);

alter policy "Users can view own goals"
  on public.goals
  to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can update own goals"
  on public.goals
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can delete own notes"
  on public.notes
  to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can insert own notes"
  on public.notes
  to authenticated
  with check ((select auth.uid()) = user_id);

alter policy "Users can read own notes"
  on public.notes
  to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can update own notes"
  on public.notes
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can insert own profile"
  on public.profiles
  to authenticated
  with check ((select auth.uid()) = id);

alter policy "Users can view own profile"
  on public.profiles
  to authenticated
  using ((select auth.uid()) = id);

alter policy "Users can update own profile"
  on public.profiles
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Anyone can join waitlist"
  on public.waitlist;

revoke select, insert, update, delete
  on public.waitlist
  from anon, authenticated;

commit;
