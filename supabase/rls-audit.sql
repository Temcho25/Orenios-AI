-- Orenios AI — read-only RLS audit
-- Run this entire file in Supabase SQL Editor and share every result table.
-- It does not create, update, or delete anything.

with expected_tables(table_name) as (
  values
    ('profiles'),
    ('tasks'),
    ('goals'),
    ('daily_focus'),
    ('calendar_events'),
    ('notes'),
    ('ai_messages'),
    ('waitlist')
)
select
  expected_tables.table_name,
  coalesce(classes.relrowsecurity, false) as rls_enabled,
  coalesce(classes.relforcerowsecurity, false) as rls_forced
from expected_tables
left join pg_catalog.pg_class as classes
  on classes.relname = expected_tables.table_name
  and classes.relnamespace = 'public'::regnamespace
order by expected_tables.table_name;

select
  tablename,
  policyname,
  roles,
  cmd,
  permissive,
  qual as using_expression,
  with_check
from pg_catalog.pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles',
    'tasks',
    'goals',
    'daily_focus',
    'calendar_events',
    'notes',
    'ai_messages',
    'waitlist'
  )
order by tablename, cmd, policyname;

select
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'profiles',
    'tasks',
    'goals',
    'daily_focus',
    'calendar_events',
    'notes',
    'ai_messages',
    'waitlist'
  )
  and column_name in ('id', 'user_id', 'email')
order by table_name, ordinal_position;

select
  tablename,
  indexname,
  indexdef
from pg_catalog.pg_indexes
where schemaname = 'public'
  and tablename in (
    'profiles',
    'tasks',
    'goals',
    'daily_focus',
    'calendar_events',
    'notes',
    'ai_messages',
    'waitlist'
  )
order by tablename, indexname;

select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'profiles',
    'tasks',
    'goals',
    'daily_focus',
    'calendar_events',
    'notes',
    'ai_messages',
    'waitlist'
  )
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;
