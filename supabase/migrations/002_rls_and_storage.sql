-- ==============================================================================
-- Migration 002: Row Level Security (RLS) and Storage Policies
-- Shadi Sutra Event Management
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Enable & Force Row Level Security on ALL tables (Default Deny)
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

alter table public.events enable row level security;
alter table public.events force row level security;

alter table public.event_functions enable row level security;
alter table public.event_functions force row level security;

alter table public.event_items enable row level security;
alter table public.event_items force row level security;

alter table public.budgets enable row level security;
alter table public.budgets force row level security;

alter table public.payments enable row level security;
alter table public.payments force row level security;

alter table public.designs enable row level security;
alter table public.designs force row level security;

alter table public.timeline_entries enable row level security;
alter table public.timeline_entries force row level security;

alter table public.guests enable row level security;
alter table public.guests force row level security;

alter table public.enquiries enable row level security;
alter table public.enquiries force row level security;

alter table public.audit_log enable row level security;
alter table public.audit_log force row level security;

-- ------------------------------------------------------------------------------
-- 2. Profiles Policies
-- ------------------------------------------------------------------------------
-- Admin: full access
create policy "Admin full access on profiles"
  on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer: read own profile only
create policy "Customer read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3. Events Policies
-- ------------------------------------------------------------------------------
-- Admin: full access
create policy "Admin full access on events"
  on public.events
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer: SELECT only own active event
create policy "Customer select own active event"
  on public.events
  for select
  using (
    customer_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.access_enabled = true
    )
  );

-- ------------------------------------------------------------------------------
-- 4. Event Functions Policies
-- ------------------------------------------------------------------------------
-- Admin: full access
create policy "Admin full access on event_functions"
  on public.event_functions
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer: SELECT functions for accessible event
create policy "Customer select event functions"
  on public.event_functions
  for select
  using (public.customer_can_access_event(event_id));

-- ------------------------------------------------------------------------------
-- 5. Event Items Policies (Admin Tracking Only - Customer DENIED)
-- ------------------------------------------------------------------------------
-- Admin: full access
create policy "Admin full access on event_items"
  on public.event_items
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer has NO access to event_items (no customer policy created)

-- ------------------------------------------------------------------------------
-- 6. Budgets Policies (Admin full access; Customer read-only IF revealed)
-- ------------------------------------------------------------------------------
-- Admin: full access
create policy "Admin full access on budgets"
  on public.budgets
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. Payments Policies (Admin full access; Customer read-only IF revealed)
-- ------------------------------------------------------------------------------
-- Admin: full access
create policy "Admin full access on payments"
  on public.payments
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. Designs Policies (Admin full access; Customer finalized only)
-- ------------------------------------------------------------------------------
-- Admin: full access
create policy "Admin full access on designs"
  on public.designs
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer: SELECT finalized designs only
create policy "Customer select finalized designs"
  on public.designs
  for select
  using (
    public.customer_can_access_event(event_id)
    and is_finalized = true
  );

-- ------------------------------------------------------------------------------
-- 9. Timeline Entries Policies
-- ------------------------------------------------------------------------------
-- Admin: full access
create policy "Admin full access on timeline_entries"
  on public.timeline_entries
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer: SELECT timeline entries
create policy "Customer select timeline entries"
  on public.timeline_entries
  for select
  using (public.customer_can_access_event(event_id));

-- ------------------------------------------------------------------------------
-- 10. Guests Policies (Shared sheet: Customer and Admin can read and edit)
-- ------------------------------------------------------------------------------
-- Admin: full access
create policy "Admin full access on guests"
  on public.guests
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer: SELECT guests for own event
create policy "Customer select guests"
  on public.guests
  for select
  using (public.customer_can_access_event(event_id));

-- Customer: INSERT guests for own event
create policy "Customer insert guests"
  on public.guests
  for insert
  with check (public.customer_can_access_event(event_id));

-- Customer: UPDATE guests for own event
create policy "Customer update guests"
  on public.guests
  for update
  using (public.customer_can_access_event(event_id))
  with check (public.customer_can_access_event(event_id));

-- Customer: DELETE guests for own event
create policy "Customer delete guests"
  on public.guests
  for delete
  using (public.customer_can_access_event(event_id));

-- ------------------------------------------------------------------------------
-- 11. Enquiries Policies (Public Insert-Only; Admin Read)
-- ------------------------------------------------------------------------------
-- Public/Anon: insert only
create policy "Public insert enquiries"
  on public.enquiries
  for insert
  with check (true);

-- Admin: read-only access to review enquiries
create policy "Admin read enquiries"
  on public.enquiries
  for select
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 12. Audit Log Policies
-- ------------------------------------------------------------------------------
-- Admin: read only
create policy "Admin view audit log"
  on public.audit_log
  for select
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13. Supabase Storage Buckets & Policies
-- ------------------------------------------------------------------------------

-- Insert storage buckets if not present
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery', 'gallery', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('event-files', 'event-files', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies:
-- Gallery: public read
create policy "Public read gallery bucket"
  on storage.objects
  for select
  using (bucket_id = 'gallery');

-- Gallery: admin upload/modify
create policy "Admin manage gallery bucket"
  on storage.objects
  for all
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

-- Event-files (private): admin full access
create policy "Admin manage event-files bucket"
  on storage.objects
  for all
  using (bucket_id = 'event-files' and public.is_admin())
  with check (bucket_id = 'event-files' and public.is_admin());

-- Customers have no direct object-read policy. Server code verifies table RLS
-- before issuing short-lived signed URLs for finalized designs.
