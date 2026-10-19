-- Shadi Sutra: RLS test script
-- Run in the Supabase SQL Editor on the DEV project only, after seeding.
-- It acts as the seeded admin, customer 1, customer 2 and an anonymous visitor.
-- Temporary changes it makes are rolled back. Result table appears at the end.

drop table if exists pg_temp.rls_results;
create temp table rls_results (n serial, test text, result text, detail text);

-- Count rows a query returns while acting as a given user.
-- Returns -1 when Postgres refuses with "permission denied" (also a pass for "must not see").
create or replace function pg_temp.cnt(uid uuid, q text, as_role text default 'authenticated')
returns bigint language plpgsql as $f$
declare n bigint;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', as_role, 'aal', 'aal2')::text, true);
  execute format('set local role %I', as_role);
  begin
    execute 'select count(*) from (' || q || ') t' into n;
  exception when insufficient_privilege then
    n := -1;
  end;
  reset role;
  return n;
end $f$;

create or replace function pg_temp.rec(t text, ok boolean, d text)
returns void language plpgsql as $f$
begin
  insert into pg_temp.rls_results(test, result, detail)
  values (t, case when ok then 'PASS' else 'FAIL' end, d);
end $f$;

do $$
declare
  a uuid; c1 uuid; c2 uuid; e1 uuid; e2 uuid;
  n bigint; role_after text; esc boolean := null;
  anon_tables text[] := array['events','guests','profiles','payments','budgets','event_items','designs'];
  t text;
begin
  select id into a  from public.profiles where role::text = 'admin'    order by created_at limit 1;
  select id into c1 from public.profiles where role::text = 'customer' order by created_at limit 1;
  select id into c2 from public.profiles where role::text = 'customer' order by created_at offset 1 limit 1;
  select id into e1 from public.events where customer_id = c1 limit 1;
  select id into e2 from public.events where customer_id = c2 limit 1;

  if a is null or c1 is null or c2 is null or e1 is null or e2 is null then
    raise exception 'Seed data not found: need 1 admin and 2 customers who each have an event.';
  end if;

  -- Customer 1 own data
  n := pg_temp.cnt(c1, format('select 1 from public.events where id = %L', e1));
  perform pg_temp.rec('Customer 1 can see their own event', n = 1, 'rows=' || n);

  -- Customer 1 must not see customer 2's data
  n := pg_temp.cnt(c1, format('select 1 from public.events where id = %L', e2));
  perform pg_temp.rec('Customer 1 cannot see customer 2 event', n in (0,-1), 'rows=' || n);

  n := pg_temp.cnt(c1, format('select 1 from public.guests where event_id = %L', e2));
  perform pg_temp.rec('Customer 1 cannot see customer 2 guests', n in (0,-1), 'rows=' || n);

  n := pg_temp.cnt(c1, format('select 1 from public.profiles where id <> %L', c1));
  perform pg_temp.rec('Customer 1 cannot see other profiles', n in (0,-1), 'rows=' || n);

  -- Customer must not see admin-only tables
  foreach t in array array['payments','budgets','event_items'] loop
    n := pg_temp.cnt(c1, format('select 1 from public.%I', t));
    perform pg_temp.rec('Customer cannot read ' || t, n in (0,-1), 'rows=' || n);
  end loop;

  n := pg_temp.cnt(c1, 'select 1 from public.designs where is_finalized = false');
  perform pg_temp.rec('Customer cannot see non-finalized designs', n in (0,-1), 'rows=' || n);

  -- Anonymous visitor sees nothing
  foreach t in array anon_tables loop
    n := pg_temp.cnt(null, format('select 1 from public.%I', t), 'anon');
    perform pg_temp.rec('Anonymous cannot read ' || t, n in (0,-1), 'rows=' || n);
  end loop;

  -- Admin sees everything
  n := pg_temp.cnt(a, 'select 1 from public.events');
  perform pg_temp.rec('Admin can see all events', n >= 2, 'rows=' || n);

  -- Customer cannot make themselves admin (changes rolled back)
  begin
    begin
      perform set_config('request.jwt.claims',
        json_build_object('sub', c1, 'role', 'authenticated')::text, true);
      set local role authenticated;
      update public.profiles set role = 'admin' where id = c1;
      reset role;
      select role::text into role_after from public.profiles where id = c1;
      esc := (role_after = 'admin');
    exception when insufficient_privilege then
      reset role;
      esc := false;
    end;
    raise exception 'undo' using errcode = 'P0001';
  exception when sqlstate 'P0001' then
    null;
  end;
  perform pg_temp.rec('Customer cannot change own role to admin', coalesce(esc,true) = false, 'escalated=' || coalesce(esc::text,'unknown'));

  -- Customer with access disabled sees nothing (changes rolled back)
  begin
    update public.profiles set access_enabled = false where id = c1;
    n := pg_temp.cnt(c1, 'select 1 from public.events');
    raise exception 'undo' using errcode = 'P0001';
  exception when sqlstate 'P0001' then
    null;
  end;
  perform pg_temp.rec('Customer with access_enabled=false sees no events', n in (0,-1), 'rows=' || n);
end $$;

select n, test, result, detail from pg_temp.rls_results order by n;
