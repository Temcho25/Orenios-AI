-- MUTATING: adds one nullable column to an existing table.
-- Does not touch existing rows, does not change RLS policies
-- (the new column is covered by the table's existing owner policies).
--
-- Purpose: lets Orenios distinguish AI messages that performed a real
-- workspace action (created/updated/completed/deleted a task or goal)
-- from messages that were just conversational, so the Dashboard can
-- show an honest count of real AI-driven changes instead of guessing
-- from timestamps.

alter table public.ai_messages
  add column if not exists action text;
