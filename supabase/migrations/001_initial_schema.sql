-- ==============================================================================
-- Migration 001: Initial Schema
-- Shadi Sutra Event Management
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Helper Function: Updated At Timestamp Trigger
-- ------------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'customer')),
  username text unique not null,
  full_name text not null,
  access_enabled boolean not null default false,
  must_change_password boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. Events Table
-- ------------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  name text not null,
  type text not null check (type in ('wedding', 'birthday', 'function')),
  date date not null,
  venue text not null,
  status text not null default 'planning' check (status in ('planning', 'finalized', 'completed', 'cancelled')),
  show_payments_to_customer boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_events_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

create index idx_events_customer_id on public.events(customer_id);
create index idx_events_date on public.events(date);

-- ------------------------------------------------------------------------------
-- 4. Event Functions Table (Sub-events e.g., Haldi, Mehendi, Sangeet, Wedding)
-- ------------------------------------------------------------------------------
create table public.event_functions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  date date not null,
  start_time time,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_event_functions_updated_at
  before update on public.event_functions
  for each row execute function public.handle_updated_at();

create index idx_event_functions_event_id on public.event_functions(event_id);

-- ------------------------------------------------------------------------------
-- 5. Event Items Table (Admin tracking: lighting, flowers, decor, instruments, etc.)
-- ------------------------------------------------------------------------------
create table public.event_items (
  id uuid primary key default gen_random_uuid(),
  function_id uuid not null references public.event_functions(id) on delete cascade,
  category text not null check (category in ('lighting', 'flowers', 'decor', 'instruments', 'other')),
  title text not null,
  vendor text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'done')),
  cost numeric(12, 2) not null default 0.00 check (cost >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_event_items_updated_at
  before update on public.event_items
  for each row execute function public.handle_updated_at();

create index idx_event_items_function_id on public.event_items(function_id);

-- ------------------------------------------------------------------------------
-- 6. Budgets Table (Per-event agreed total)
-- ------------------------------------------------------------------------------
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events(id) on delete cascade,
  agreed_total numeric(12, 2) not null default 0.00 check (agreed_total >= 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_budgets_updated_at
  before update on public.budgets
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. Payments Table (Payments received)
-- ------------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  paid_on date not null,
  mode text not null default 'bank_transfer',
  note text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

create index idx_payments_event_id on public.payments(event_id);

-- ------------------------------------------------------------------------------
-- 8. Designs Table (Finalized vs draft versions, signed URL storage paths)
-- ------------------------------------------------------------------------------
create table public.designs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  file_path text not null,
  version integer not null default 1,
  is_finalized boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_designs_updated_at
  before update on public.designs
  for each row execute function public.handle_updated_at();

create index idx_designs_event_id on public.designs(event_id);

-- ------------------------------------------------------------------------------
-- 9. Timeline Entries Table
-- ------------------------------------------------------------------------------
create table public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  function_id uuid references public.event_functions(id) on delete set null,
  starts_at timestamptz not null,
  title text not null,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_timeline_entries_updated_at
  before update on public.timeline_entries
  for each row execute function public.handle_updated_at();

create index idx_timeline_event_id on public.timeline_entries(event_id);

-- ------------------------------------------------------------------------------
-- 10. Guests Table (Shared guest sheet with RSVP and Party Size)
-- ------------------------------------------------------------------------------
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  party_size integer not null default 1 check (party_size between 1 and 50),
  phone text,
  rsvp text not null default 'pending' check (rsvp in ('pending', 'yes', 'no')),
  table_no text,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_guests_updated_at
  before update on public.guests
  for each row execute function public.handle_updated_at();

create index idx_guests_event_id on public.guests(event_id);

-- ------------------------------------------------------------------------------
-- 11. Enquiries Table (Public submissions from contact page)
-- ------------------------------------------------------------------------------
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  event_type text not null,
  event_date date,
  message text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger update_enquiries_updated_at
  before update on public.enquiries
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 12. Audit Log Table (Admin-readable, tracked on payment & access changes)
-- ------------------------------------------------------------------------------
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  row_id uuid,
  payload jsonb,
  at timestamptz not null default timezone('utc'::text, now())
);

create index idx_audit_log_at on public.audit_log(at desc);

-- ------------------------------------------------------------------------------
-- 13. Security Definer Helper Functions (Fixed search_path for safety)
-- ------------------------------------------------------------------------------

-- Check if current authenticated user is an active Admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  user_role text;
  is_enabled boolean;
begin
  if auth.uid() is null then
    return false;
  end if;

  select role, access_enabled
  into user_role, is_enabled
  from public.profiles
  where id = auth.uid();

  return (user_role = 'admin' and is_enabled = true);
end;
$$;

-- Check if current authenticated user is authorized customer for an event
create or replace function public.customer_can_access_event(target_event_id uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  is_owner boolean;
  is_enabled boolean;
begin
  if auth.uid() is null or target_event_id is null then
    return false;
  end if;

  -- Admin always has access
  if public.is_admin() then
    return true;
  end if;

  -- Check customer ownership and access flag
  select
    (e.customer_id = auth.uid()) as owner,
    coalesce(p.access_enabled, false) as enabled
  into is_owner, is_enabled
  from public.events e
  left join public.profiles p on p.id = auth.uid()
  where e.id = target_event_id;

  return coalesce(is_owner, false) and coalesce(is_enabled, false);
end;
$$;

-- ------------------------------------------------------------------------------
-- 14. Audit Triggers on Payments and Access Changes
-- ------------------------------------------------------------------------------
create or replace function public.log_payment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (actor_id, action, table_name, row_id, payload)
  values (
    auth.uid(),
    TG_OP,
    'payments',
    coalesce(new.id, old.id),
    jsonb_build_object(
      'amount', coalesce(new.amount, old.amount),
      'event_id', coalesce(new.event_id, old.event_id),
      'mode', coalesce(new.mode, old.mode)
    )
  );
  return coalesce(new, old);
end;
$$;

create trigger trigger_audit_payments
  after insert or update or delete on public.payments
  for each row execute function public.log_payment_change();

create or replace function public.log_profile_access_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (old.access_enabled is distinct from new.access_enabled) or (old.role is distinct from new.role) then
    insert into public.audit_log (actor_id, action, table_name, row_id, payload)
    values (
      auth.uid(),
      'UPDATE_ACCESS',
      'profiles',
      new.id,
      jsonb_build_object(
        'old_access_enabled', old.access_enabled,
        'new_access_enabled', new.access_enabled,
        'old_role', old.role,
        'new_role', new.role,
        'username', new.username
      )
    );
  end if;
  return new;
end;
$$;

create trigger trigger_audit_profile_access
  after update on public.profiles
  for each row execute function public.log_profile_access_change();
