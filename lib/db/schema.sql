-- SalesOS Schema
-- Run this in Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- Stages enum
do $$ begin
  create type deal_stage as enum (
    'cold', 'discovery', 'proposal', 'closing', 'kickoff', 'active', 'lost'
  );
exception when duplicate_object then null; end $$;

-- Deals
create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  source text,
  hook_note text,
  stage deal_stage not null default 'cold',
  deal_value numeric(10,2),
  next_action_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_user_stage_idx on deals(user_id, stage);

-- Discovery notes
create table if not exists discovery_notes (
  deal_id uuid primary key references deals(id) on delete cascade,
  goal text,
  customer_lifetime_value text,
  main_pain text,
  decision_maker text,
  budget_indication text,
  notes text,
  updated_at timestamptz not null default now()
);

-- Proposals
create table if not exists proposals (
  deal_id uuid primary key references deals(id) on delete cascade,
  pdf_url text,
  loom_url text,
  price numeric(10,2),
  sent_at timestamptz,
  presented_at timestamptz,
  status text default 'draft',
  notes text
);

-- Contracts (Closing phase)
create table if not exists contracts (
  deal_id uuid primary key references deals(id) on delete cascade,
  signed_at timestamptz,
  signature_url text,
  total_amount numeric(10,2),
  deposit_amount numeric(10,2),
  deposit_invoice_sent_at timestamptz,
  deposit_paid_at timestamptz
);

-- Kickoff
create table if not exists kickoffs (
  deal_id uuid primary key references deals(id) on delete cascade,
  hosting_creds_received boolean default false,
  domain_access_received boolean default false,
  assets_received boolean default false,
  texts_received boolean default false,
  logo_received boolean default false,
  next_feedback_at timestamptz,
  notes text
);

-- Activities timeline
create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  body text,
  created_at timestamptz not null default now()
);

create index if not exists activities_deal_idx on activities(deal_id, created_at desc);

-- Gate trigger: stage='active' only if contract signed AND deposit paid
create or replace function enforce_active_gate() returns trigger as $$
declare
  c record;
begin
  if new.stage = 'active' then
    select signed_at, deposit_paid_at into c from contracts where deal_id = new.id;
    if c is null or c.signed_at is null or c.deposit_paid_at is null then
      raise exception 'Cannot move to active: contract must be signed AND deposit paid';
    end if;
  end if;
  new.updated_at := now();
  return new;
end; $$ language plpgsql;

drop trigger if exists deals_active_gate on deals;
create trigger deals_active_gate before update on deals
  for each row execute function enforce_active_gate();

-- RLS
alter table deals enable row level security;
alter table discovery_notes enable row level security;
alter table proposals enable row level security;
alter table contracts enable row level security;
alter table kickoffs enable row level security;
alter table activities enable row level security;

drop policy if exists "own deals" on deals;
create policy "own deals" on deals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own discovery" on discovery_notes;
create policy "own discovery" on discovery_notes for all
  using (exists(select 1 from deals d where d.id = deal_id and d.user_id = auth.uid()))
  with check (exists(select 1 from deals d where d.id = deal_id and d.user_id = auth.uid()));

drop policy if exists "own proposals" on proposals;
create policy "own proposals" on proposals for all
  using (exists(select 1 from deals d where d.id = deal_id and d.user_id = auth.uid()))
  with check (exists(select 1 from deals d where d.id = deal_id and d.user_id = auth.uid()));

drop policy if exists "own contracts" on contracts;
create policy "own contracts" on contracts for all
  using (exists(select 1 from deals d where d.id = deal_id and d.user_id = auth.uid()))
  with check (exists(select 1 from deals d where d.id = deal_id and d.user_id = auth.uid()));

drop policy if exists "own kickoffs" on kickoffs;
create policy "own kickoffs" on kickoffs for all
  using (exists(select 1 from deals d where d.id = deal_id and d.user_id = auth.uid()))
  with check (exists(select 1 from deals d where d.id = deal_id and d.user_id = auth.uid()));

drop policy if exists "own activities" on activities;
create policy "own activities" on activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
