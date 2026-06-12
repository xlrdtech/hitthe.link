-- =====================================================================
-- EliOS — Buyer Portal schema (Supabase / Postgres)
-- Project suggestion: "elios-buyer-portal"  (NEW dedicated Supabase project)
-- =====================================================================
-- Source of truth for AUTH (Supabase Auth / GoTrue manages auth.users) and
-- ENTITLEMENT (subscriptions + lead_grants). Stripe is the billing source of
-- truth; the Cloudflare Worker mirrors Stripe state into here via service-role.
--
-- SECURITY MODEL
--   * RLS is ENABLED on every public table.
--   * A buyer can read ONLY their own profile, their own subscription, and
--     the leads that have been GRANTED to them (via lead_grants -> leads).
--   * Buyers can NEVER read the leads table directly (no SELECT policy for
--     `authenticated`); they only see granted leads through the
--     `my_leads` view, which is itself RLS-bounded by lead_grants.
--   * All writes to subscriptions / leads / lead_grants are service-role only
--     (the Worker). Clients have no write path to entitlement data.
--
-- Run order: paste the whole file into the Supabase SQL editor, OR
--   supabase db push   (if using the Supabase CLI with this as a migration)
-- Idempotent: safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- 1. buyers  (1:1 profile with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.buyers (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  full_name           text,
  company             text,
  stripe_customer_id  text unique,                 -- set on first checkout by the Worker
  created_at          timestamptz not null default now()
);

comment on table public.buyers is
  'Buyer profile, 1:1 with auth.users. Row auto-created by trigger on auth.users signup.';

-- ---------------------------------------------------------------------
-- 2. subscriptions  (mirrors Stripe; one active row per buyer expected)
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  buyer_id                uuid not null references public.buyers(id) on delete cascade,
  stripe_subscription_id  text unique not null,
  stripe_price_id         text not null,                        -- maps to Plan A or Plan B
  plan                    text not null check (plan in ('plan_a','plan_b')),
  status                  text not null
                            check (status in ('active','trialing','past_due','canceled','unpaid','incomplete','incomplete_expired','paused')),
  monthly_quota           int  not null,                        -- 30 for A, 15 for B (denormalized; adjustable)
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists subscriptions_buyer_id_idx on public.subscriptions(buyer_id);
create index if not exists subscriptions_status_idx    on public.subscriptions(status);

comment on table public.subscriptions is
  'Stripe subscription mirror. Written ONLY by the Worker (service-role) from Stripe webhooks. Entitlement = status in (active,trialing).';

-- ---------------------------------------------------------------------
-- 3. leads  (the 520 from Asana "Lead Master" / NotebookLM "Eli Leads")
-- ---------------------------------------------------------------------
-- Field names align to the live eliops/leads.json export shape:
--   {id, name, phone, service, event, status, rep, added, notes}
-- 'service'  -> project_type
-- 'status'   -> pipeline_stage (Asana stage / disposition)
-- We keep both a source_ref (the numeric id from leads.json) and asana_gid
-- (the Asana task GID) so sync is idempotent from either source.
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  asana_gid       text unique,                       -- Asana task GID (idempotent Asana sync)
  source_ref      text unique,                       -- numeric id from eliops/leads.json (idempotent JSON sync)
  name            text,
  phone           text,
  email           text,
  address         text,
  project_type    text,                              -- e.g. Kitchen, Roofing, Solar, Windows
  event           text,                              -- where the lead was captured (e.g. "Taste of Placentia")
  rep             text,                              -- originating rep, if any
  pipeline_stage  text,                              -- Asana stage / disposition (New, Follow Up, Attempted...)
  quality_score   int,
  notes           text,
  status          text not null default 'available'  -- available | granted | retired
                    check (status in ('available','granted','retired')),
  source          text not null default 'asana_lead_master',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists leads_status_idx       on public.leads(status);
create index if not exists leads_project_type_idx on public.leads(project_type);

comment on table public.leads is
  'Master lead inventory synced in from Asana Lead Master / leads.json. NOT buyer-owned. No RLS SELECT for authenticated — buyers reach leads only through lead_grants/my_leads.';

-- ---------------------------------------------------------------------
-- 4. lead_grants  (buyer <-> lead; THE per-month entitlement / access record)
-- ---------------------------------------------------------------------
create table if not exists public.lead_grants (
  id              uuid primary key default gen_random_uuid(),
  buyer_id        uuid not null references public.buyers(id) on delete cascade,
  lead_id         uuid not null references public.leads(id)  on delete cascade,
  subscription_id uuid references public.subscriptions(id)   on delete set null,
  grant_period    text not null,                     -- 'YYYY-MM' billing month the grant counts against
  granted_at      timestamptz not null default now(),
  unique (buyer_id, lead_id),                         -- a lead is granted to a buyer at most once
  unique (lead_id)                                    -- a lead is exclusive: granted to at most ONE buyer ever
);

create index if not exists lead_grants_buyer_id_idx on public.lead_grants(buyer_id);
create index if not exists lead_grants_period_idx   on public.lead_grants(buyer_id, grant_period);

comment on table public.lead_grants is
  'Access join: which buyer may read which lead, and which billing month it counted against. Written ONLY by the Worker grant allocator (service-role). The UNIQUE(lead_id) makes each lead exclusive to one buyer.';

-- ---------------------------------------------------------------------
-- 5. Trigger: auto-create buyers row on auth.users signup
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.buyers (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 6. updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- 7. ROW-LEVEL SECURITY
-- =====================================================================
alter table public.buyers        enable row level security;
alter table public.subscriptions enable row level security;
alter table public.leads         enable row level security;
alter table public.lead_grants   enable row level security;

-- Force RLS even for the table owner (defense in depth; service-role bypasses RLS by design).
alter table public.buyers        force row level security;
alter table public.subscriptions force row level security;
alter table public.leads         force row level security;
alter table public.lead_grants   force row level security;

-- ---- buyers ----------------------------------------------------------
drop policy if exists buyers_select_own on public.buyers;
create policy buyers_select_own on public.buyers
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists buyers_update_own on public.buyers;
create policy buyers_update_own on public.buyers
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
-- NOTE: no INSERT/DELETE policy for authenticated. Insert happens via the
-- SECURITY DEFINER signup trigger; the service-role (Worker) bypasses RLS.

-- ---- subscriptions ---------------------------------------------------
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated
  using (buyer_id = (select auth.uid()));
-- NO insert/update/delete policy for authenticated => only service-role writes.

-- ---- leads -----------------------------------------------------------
-- INTENTIONALLY NO policy granting SELECT to `authenticated`.
-- Buyers cannot read public.leads directly. Service-role (Asana sync,
-- grant allocator) bypasses RLS, so it still has full access.

-- ---- lead_grants -----------------------------------------------------
drop policy if exists lead_grants_select_own on public.lead_grants;
create policy lead_grants_select_own on public.lead_grants
  for select to authenticated
  using (buyer_id = (select auth.uid()));
-- NO insert/update/delete policy for authenticated => only the allocator writes.

-- =====================================================================
-- 8. my_leads — the ONLY way a buyer reads lead detail
-- =====================================================================
-- A security_invoker view: it runs with the caller's privileges, so the
-- lead_grants RLS policy above scopes rows to the calling buyer. Because
-- the buyer has no SELECT on leads, the join is allowed only for leads
-- reachable through their own grants (security_invoker + RLS on the join).
-- Buyers query:  select * from my_leads;
create or replace view public.my_leads
with (security_invoker = true) as
select
  l.id,
  l.name,
  l.phone,
  l.email,
  l.address,
  l.project_type,
  l.event,
  l.pipeline_stage,
  l.quality_score,
  l.notes,
  g.grant_period,
  g.granted_at
from public.lead_grants g
join public.leads l on l.id = g.lead_id
where g.buyer_id = (select auth.uid());

comment on view public.my_leads is
  'Buyer-facing view of granted leads. security_invoker=true so lead_grants RLS scopes rows to auth.uid(). This is the only buyer path to lead PII.';

grant select on public.my_leads to authenticated;

-- =====================================================================
-- 9. Helper: current entitlement summary for the logged-in buyer
-- =====================================================================
-- Lets the portal show "X of N leads used this month" without exposing
-- the leads table. SECURITY INVOKER so RLS still applies.
create or replace function public.my_entitlement()
returns table (
  plan            text,
  status          text,
  monthly_quota   int,
  granted_this_period bigint,
  period_label    text,
  current_period_end timestamptz
)
language sql
security invoker
set search_path = public
as $$
  with sub as (
    select * from public.subscriptions
    where buyer_id = (select auth.uid())
    order by (status in ('active','trialing')) desc, updated_at desc
    limit 1
  )
  select
    sub.plan,
    sub.status,
    sub.monthly_quota,
    (select count(*) from public.lead_grants g
       where g.buyer_id = (select auth.uid())
         and g.grant_period = to_char(now(),'YYYY-MM')),
    to_char(now(),'YYYY-MM'),
    sub.current_period_end
  from sub;
$$;

grant execute on function public.my_entitlement() to authenticated;

-- =====================================================================
-- 10. Plan reference (documentation; quota is denormalized onto subscriptions)
-- =====================================================================
--   plan_a : Stripe price STRIPE_PRICE_PLAN_A  -> $100/mo -> monthly_quota 30
--   plan_b : Stripe price STRIPE_PRICE_PLAN_B  -> $40/mo  -> monthly_quota 15
-- The Worker maps stripe_price_id -> (plan, monthly_quota) at webhook time.
-- =====================================================================
