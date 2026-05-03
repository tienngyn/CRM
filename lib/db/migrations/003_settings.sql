-- Migration 003: User Settings (Skript, Tagesziel)
-- Im Supabase SQL Editor ausführen.

create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cold_call_script text,
  daily_call_goal int not null default 30,
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

drop policy if exists "own settings" on user_settings;
create policy "own settings" on user_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
