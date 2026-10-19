-- Run against the DEV Supabase project after migrations 001-007.
-- Exercises anonymous and authenticated non-admin access; all fixture rows
-- created by this script are removed before it returns the results.

drop table if exists pg_temp.phase4a_rls_results;
create temp table phase4a_rls_results (
  n serial,
  test text not null,
  result text not null,
  detail text not null
);

create or replace function pg_temp.phase4a_count_as(
  as_role text,
  query_text text
)
returns bigint
language plpgsql
as $$
declare
  row_count bigint;
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', '00000000-0000-0000-0000-000000000001',
      'role', as_role,
      'aal', 'aal2'
    )::text,
    true
  );
  execute format('set local role %I', as_role);
  begin
    execute 'select count(*) from (' || query_text || ') rows_found'
      into row_count;
  exception when insufficient_privilege then
    row_count := -1;
  end;
  reset role;
  return row_count;
end;
$$;

create or replace function pg_temp.phase4a_write_as(
  as_role text,
  command_text text
)
returns bigint
language plpgsql
as $$
declare
  affected_rows bigint;
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', '00000000-0000-0000-0000-000000000001',
      'role', as_role,
      'aal', 'aal2'
    )::text,
    true
  );
  execute format('set local role %I', as_role);
  begin
    execute command_text;
    get diagnostics affected_rows = row_count;
    raise exception using
      errcode = 'ZX001',
      message = 'roll back RLS write probe';
  exception when insufficient_privilege then
    affected_rows := -1;
  when sqlstate 'ZX001' then
    null;
  end;
  reset role;
  return affected_rows;
end;
$$;

do $$
declare
  test_event uuid;
  test_function uuid;
  test_item uuid;
  test_timeline uuid;
  test_guest uuid;
  share_token text := 'phase4aRlsTestToken0123456789ABC';
  as_role text;
  table_name text;
  row_count bigint;
  affected_rows bigint;
  read_query text;
  insert_query text;
  update_query text;
  delete_query text;
  fixture_tables text[] := array[
    'events',
    'event_functions',
    'event_items',
    'timeline_entries',
    'guests',
    'event_share_links'
  ];
begin
  insert into public.events (name, type, date, venue, client_name, client_phone)
  values ('RLS test fixture', 'function', current_date, 'Test venue', 'Test client', '000')
  returning id into test_event;

  insert into public.event_functions (event_id, name, date)
  values (test_event, 'RLS test function', current_date)
  returning id into test_function;

  insert into public.event_items (function_id, category, title)
  values (test_function, 'other', 'RLS test item')
  returning id into test_item;

  insert into public.timeline_entries (event_id, function_id, starts_at, title)
  values (test_event, test_function, now(), 'RLS test timeline')
  returning id into test_timeline;

  insert into public.guests (event_id, name, party_size)
  values (test_event, 'RLS test guest', 1)
  returning id into test_guest;

  insert into public.event_share_links (event_id, token, expires_at)
  values (test_event, share_token, now() + interval '1 day');

  foreach as_role in array array['anon', 'authenticated'] loop
    foreach table_name in array fixture_tables loop
      read_query := format('select 1 from public.%I', table_name);
      row_count := pg_temp.phase4a_count_as(as_role, read_query);
      insert into pg_temp.phase4a_rls_results(test, result, detail)
      values (
        as_role || ' cannot read ' || table_name,
        case when row_count in (0, -1) then 'PASS' else 'FAIL' end,
        'rows=' || row_count
      );
    end loop;
  end loop;

  foreach as_role in array array['anon', 'authenticated'] loop
    foreach table_name in array fixture_tables loop
      if table_name = 'events' then
        insert_query := 'insert into public.events (name,type,date,venue) values (''Blocked test'',''function'',current_date,''Blocked venue'')';
        update_query := format('update public.events set name = ''Blocked update'' where id = %L', test_event);
        delete_query := format('delete from public.events where id = %L', test_event);
      elsif table_name = 'event_functions' then
        insert_query := format('insert into public.event_functions (event_id,name,date) values (%L,''Blocked test'',current_date)', test_event);
        update_query := format('update public.event_functions set name = ''Blocked update'' where id = %L', test_function);
        delete_query := format('delete from public.event_functions where id = %L', test_function);
      elsif table_name = 'event_items' then
        insert_query := format('insert into public.event_items (function_id,category,title) values (%L,''other'',''Blocked test'')', test_function);
        update_query := format('update public.event_items set title = ''Blocked update'' where id = %L', test_item);
        delete_query := format('delete from public.event_items where id = %L', test_item);
      elsif table_name = 'timeline_entries' then
        insert_query := format('insert into public.timeline_entries (event_id,starts_at,title) values (%L,now(),''Blocked test'')', test_event);
        update_query := format('update public.timeline_entries set title = ''Blocked update'' where id = %L', test_timeline);
        delete_query := format('delete from public.timeline_entries where id = %L', test_timeline);
      elsif table_name = 'guests' then
        insert_query := format('insert into public.guests (event_id,name,party_size) values (%L,''Blocked test'',1)', test_event);
        update_query := format('update public.guests set name = ''Blocked update'' where id = %L', test_guest);
        delete_query := format('delete from public.guests where id = %L', test_guest);
      else
        insert_query := format('insert into public.event_share_links (event_id,token,expires_at) values (%L,''BlockedShareToken0123456789ABCDE'',now() + interval ''1 day'')', test_event);
        update_query := format('update public.event_share_links set expires_at = now() + interval ''2 days'' where token = %L', share_token);
        delete_query := format('delete from public.event_share_links where token = %L', share_token);
      end if;

      foreach read_query in array array[insert_query, update_query, delete_query] loop
        affected_rows := pg_temp.phase4a_write_as(as_role, read_query);
        insert into pg_temp.phase4a_rls_results(test, result, detail)
        values (
          as_role || ' cannot write ' || table_name,
          case when affected_rows in (0, -1) then 'PASS' else 'FAIL' end,
          'affected=' || affected_rows
        );
      end loop;
    end loop;
  end loop;

  delete from public.event_share_links where token = share_token;
  delete from public.events where id = test_event;
end;
$$;

select n, test, result, detail
from pg_temp.phase4a_rls_results
order by n;
