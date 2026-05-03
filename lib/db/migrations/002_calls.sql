-- Migration 002: Anruf-Logs
-- Im Supabase SQL Editor ausführen.

create table if not exists call_logs (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  called_at timestamptz not null default now(),
  duration_seconds int,
  outcome text not null check (outcome in ('no_answer','voicemail','talked','scheduled','not_interested','callback')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists call_logs_user_called_idx on call_logs(user_id, called_at desc);
create index if not exists call_logs_deal_idx on call_logs(deal_id, called_at desc);

alter table call_logs enable row level security;

drop policy if exists "own call_logs" on call_logs;
create policy "own call_logs" on call_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional column on deals: discovery_meeting_at (separate vom next_action_at)
alter table deals add column if not exists discovery_at timestamptz;
