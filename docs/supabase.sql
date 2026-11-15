-- Lamp: accounts & sync
-- Run this once in Supabase → SQL Editor (same project as Weeklan).
-- It creates one private row per user holding their Lamp data as JSON.
-- It does not touch Weeklan's tables.

create table if not exists public.lamp_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  name       text,
  age_group  text,
  updated_at timestamptz not null default now()
);

alter table public.lamp_data enable row level security;

-- Each person can only see and change their own row.
drop policy if exists "lamp_data_select_own" on public.lamp_data;
create policy "lamp_data_select_own" on public.lamp_data
  for select using (auth.uid() = user_id);

drop policy if exists "lamp_data_insert_own" on public.lamp_data;
create policy "lamp_data_insert_own" on public.lamp_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "lamp_data_update_own" on public.lamp_data;
create policy "lamp_data_update_own" on public.lamp_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "lamp_data_delete_own" on public.lamp_data;
create policy "lamp_data_delete_own" on public.lamp_data
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Optional: push reminders (see docs/REMINDERS.md)
create table if not exists public.lamp_push (
  endpoint     text primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  subscription jsonb not null,
  utc_minute   int not null check (utc_minute between 0 and 1439),
  tz           text,
  lang         text default 'en',
  created_at   timestamptz not null default now()
);
alter table public.lamp_push enable row level security;
drop policy if exists "lamp_push_own" on public.lamp_push;
create policy "lamp_push_own" on public.lamp_push
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
