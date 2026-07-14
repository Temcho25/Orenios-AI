# Orenios AI — Project Status

**One person. One project. No investors.**

Updated: 15 July 2026

## Stable foundation

- Landing page, waitlist and production domain
- Authentication and protected dashboard
- Focus, Tasks, Goals, Calendar and Notes
- AI Coach with real workspace actions
- Full task and goal CRUD through AI
- Relative dates, local timezone and recent-item references
- Ambiguous-name and duplicate protection
- Upstash rate limiting
- Clean lint, type-check and production build

## Stabilization completed in this session

- Added explicit `user_id` filters to dashboard reads and mutations
- Added Next.js 16 Supabase session proxy
- Replaced the password reset placeholder with a complete recovery flow
- Fixed impossible calendar-date validation
- Fixed smart-quote matching for goal names
- Fixed AI history to load the latest 100 messages
- Enforced consistent goal status and progress
- Added the first automated AI logic tests
- Added a safe read-only Supabase RLS audit script

## Database security verification completed

- RLS is enabled on all eight audited public tables: `ai_messages`, `calendar_events`, `daily_focus`, `goals`, `notes`, `profiles`, `tasks` and `waitlist`
- Policies on `goals`, `notes` and `profiles` are now limited to the `authenticated` role and use explicit owner checks
- UPDATE policies on `goals`, `notes` and `profiles` now contain explicit `USING` and `WITH CHECK` ownership conditions
- Direct anonymous/authenticated access to `waitlist` was removed; the server route remains the only intended write path
- Every audited `user_id` column is `uuid`, `NOT NULL` and indexed
- Runtime isolation was verified with both existing auth users across seven user-owned tables: 14/14 checks passed
- For both users, every visible row count exactly matched that user's true owned-row count; no cross-user SELECT leakage was detected

## Current release gate

RLS verification is complete. The current release gate is a production authentication E2E test: email confirmation, password recovery callback, password change and session refresh through the Next.js 16 Supabase proxy.

## Next

1. Test password recovery, email confirmation and session refresh with production SMTP
2. Run production smoke tests for Supabase, Upstash, OpenAI, waitlist and auth redirects
3. Add Privacy and Terms pages and remove unverified claims
4. Make AI actions idempotent and expand automated tests
5. Replace demo dashboard metrics with real data or clearly label them
6. Clean CSS, dead files and oversized images

## Known open issues

- Password recovery code is ready but still needs a real email test
- Privacy and Terms links are placeholders
- Some dashboard metrics are demo values
- AI actions do not yet have request-level idempotency
- Production environment values have not been independently verified
