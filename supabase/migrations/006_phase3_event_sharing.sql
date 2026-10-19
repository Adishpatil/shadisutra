create table if not exists public.event_share_links (
  event_id uuid not null references public.events(id) on delete cascade,
  token text not null unique
    check (token ~ '^[A-Za-z0-9_-]{32}$'),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (event_id, token),
  check (expires_at > created_at)
);

create index if not exists event_share_links_active_token_idx
  on public.event_share_links (token, expires_at)
  where revoked_at is null;

create unique index if not exists event_share_links_one_active_per_event_idx
  on public.event_share_links (event_id)
  where revoked_at is null;

alter table public.event_share_links enable row level security;
alter table public.event_share_links force row level security;

drop policy if exists "Admin manages event share links"
  on public.event_share_links;
create policy "Admin manages event share links"
  on public.event_share_links
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.event_share_rate_limits (
  key_hash text primary key
    check (key_hash ~ '^[A-Za-z0-9_-]{43}$'),
  window_started_at timestamptz not null,
  hits integer not null check (hits > 0),
  updated_at timestamptz not null default now()
);

create index if not exists event_share_rate_limits_updated_at_idx
  on public.event_share_rate_limits (updated_at);

alter table public.event_share_rate_limits enable row level security;
alter table public.event_share_rate_limits force row level security;

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  current_hits integer;
  current_time timestamptz := now();
begin
  if p_key_hash !~ '^[A-Za-z0-9_-]{43}$'
     or p_limit < 1
     or p_limit > 1000
     or p_window_seconds < 1
     or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit parameters.'
      using errcode = '22023';
  end if;

  delete from public.event_share_rate_limits
  where updated_at < current_time - interval '1 day';

  insert into public.event_share_rate_limits (
    key_hash,
    window_started_at,
    hits,
    updated_at
  )
  values (p_key_hash, current_time, 1, current_time)
  on conflict (key_hash) do update
    set window_started_at = case
          when public.event_share_rate_limits.window_started_at
            <= current_time - make_interval(secs => p_window_seconds)
          then current_time
          else public.event_share_rate_limits.window_started_at
        end,
        hits = case
          when public.event_share_rate_limits.window_started_at
            <= current_time - make_interval(secs => p_window_seconds)
          then 1
          else public.event_share_rate_limits.hits + 1
        end,
        updated_at = current_time
  returning hits into current_hits;

  return current_hits <= p_limit;
end;
$$;

revoke all privileges on table public.event_share_links
  from public, anon, authenticated;
revoke all privileges on table public.event_share_rate_limits
  from public, anon, authenticated;
grant select, insert, update, delete on table public.event_share_links
  to authenticated;
grant all privileges on table public.event_share_links,
  public.event_share_rate_limits to service_role;

revoke all privileges on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;

drop view if exists public.customer_event_financial_summary;
