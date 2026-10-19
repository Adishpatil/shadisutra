-- Explicit PostgREST/database privileges for the Phase 2 RLS policies.
-- RLS remains responsible for row-level authorization.

grant usage on schema public to service_role, authenticated, anon;

-- Fix 1: explicitly grant service_role access to existing and future objects.
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all functions in schema public to service_role;

alter default privileges for role postgres in schema public
  grant all privileges on tables to service_role;
alter default privileges for role postgres in schema public
  grant all privileges on sequences to service_role;
alter default privileges for role postgres in schema public
  grant all privileges on functions to service_role;

-- Remove implicit/previous object privileges before applying the least-
-- privilege grants below. This also prevents PUBLIC grants from reaching anon.
revoke all privileges on all tables in schema public from public, anon, authenticated;
revoke all privileges on all sequences in schema public from public, anon, authenticated;
revoke all privileges on all functions in schema public from public, anon, authenticated;

-- profiles: admins require full access; customers read their own profile.
grant select, insert, update, delete on table public.profiles to authenticated;

-- Events, functions, items, budgets, payments, designs, timeline and guests:
-- admin policies permit full access; customer-specific policies further narrow
-- access to the permitted operations and rows.
grant select, insert, update, delete on table
  public.events,
  public.event_functions,
  public.event_items,
  public.budgets,
  public.payments,
  public.designs,
  public.timeline_entries,
  public.guests
to authenticated;

-- Enquiries are admin-readable; only anonymous submissions may insert.
grant select on table public.enquiries to authenticated;
grant insert on table public.enquiries to anon;

-- Audit records are admin-readable and are written by trusted server code and
-- SECURITY DEFINER audit triggers, not directly by authenticated clients.
grant select on table public.audit_log to authenticated;

-- Financial details are exposed only through the RLS-filtered summary view.
grant select on table public.customer_event_financial_summary to authenticated;

-- RLS policies call these helpers. No other public-schema function is
-- executable by anon or authenticated users.
grant execute on function public.is_admin() to authenticated;
grant execute on function public.customer_can_access_event(uuid) to authenticated;

