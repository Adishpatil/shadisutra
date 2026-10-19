alter table public.events
  add column if not exists client_name text,
  add column if not exists client_phone text;

drop policy if exists "Customer select own active event" on public.events;
drop policy if exists "Customer select event functions" on public.event_functions;
drop policy if exists "Customer select timeline entries" on public.timeline_entries;
drop policy if exists "Customer select guests" on public.guests;
drop policy if exists "Customer insert guests" on public.guests;
drop policy if exists "Customer update guests" on public.guests;
drop policy if exists "Customer delete guests" on public.guests;
