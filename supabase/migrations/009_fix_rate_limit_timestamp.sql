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
  v_now timestamptz := now();
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
  where updated_at < v_now - interval '1 day';

  insert into public.event_share_rate_limits (
    key_hash,
    window_started_at,
    hits,
    updated_at
  )
  values (p_key_hash, v_now, 1, v_now)
  on conflict (key_hash) do update
    set window_started_at = case
          when public.event_share_rate_limits.window_started_at
            <= v_now - make_interval(secs => p_window_seconds)
          then v_now
          else public.event_share_rate_limits.window_started_at
        end,
        hits = case
          when public.event_share_rate_limits.window_started_at
            <= v_now - make_interval(secs => p_window_seconds)
          then 1
          else public.event_share_rate_limits.hits + 1
        end,
        updated_at = v_now
  returning hits into current_hits;

  return current_hits <= p_limit;
end;
$$;

revoke all privileges on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;
