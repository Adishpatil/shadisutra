-- Run against the DEV Supabase project after migration 010_phase8_links_expenses.sql.
-- Creates and removes isolated fixtures; no production data is changed.

drop table if exists pg_temp.phase8_rls_results;
create temp table phase8_rls_results (
  n serial,
  test text not null,
  result text not null,
  detail text not null
);

create or replace function pg_temp.phase8_count_as(
  user_id uuid,
  as_role text,
  query_text text
)
returns bigint
language plpgsql
as $$
declare row_count bigint;
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_id, 'role', as_role, 'aal', 'aal2')::text,
    true
  );
  execute format('set local role %I', as_role);
  begin
    execute 'select count(*) from (' || query_text || ') rows_found' into row_count;
  exception when insufficient_privilege then
    row_count := -1;
  end;
  reset role;
  return row_count;
end;
$$;

create or replace function pg_temp.phase8_write_as(
  user_id uuid,
  as_role text,
  command_text text
)
returns bigint
language plpgsql
as $$
declare affected_rows bigint;
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_id, 'role', as_role, 'aal', 'aal2')::text,
    true
  );
  execute format('set local role %I', as_role);
  begin
    execute command_text;
    get diagnostics affected_rows = row_count;
    raise exception using errcode = 'ZX801', message = 'roll back RLS write probe';
  exception
    when insufficient_privilege then affected_rows := -1;
    when sqlstate 'ZX801' then null;
  end;
  reset role;
  return affected_rows;
end;
$$;

do $$
declare
  non_admin uuid;
  test_event uuid;
  test_function uuid;
  test_item uuid;
  test_expense uuid;
  receipt_name text;
  guest_token text := 'Phase8GuestToken0123456789ABCDEF';
  client_token text := 'Phase8ClientToken0123456789ABCDE';
  as_role text;
  table_name text;
  row_count bigint;
  affected_rows bigint;
  query_text text;
  insert_text text;
  update_text text;
  delete_text text;
begin
  select id into non_admin
  from public.profiles
  where role::text = 'customer'
  order by created_at
  limit 1;
  if non_admin is null then
    raise exception 'Seed a non-admin customer profile before running this test.';
  end if;

  insert into public.events (name, type, date, venue)
  values ('Phase 8 RLS fixture', 'function', current_date, 'Private test venue')
  returning id into test_event;
  insert into public.event_functions (event_id, name, date)
  values (test_event, 'Phase 8 fixture function', current_date)
  returning id into test_function;
  insert into public.event_items (function_id, category, title)
  values (test_function, 'other', 'Phase 8 fixture item')
  returning id into test_item;
  insert into public.event_expenses (
    event_id, function_id, item_id, category, expense_date, description, unit_cost
  ) values (
    test_event, test_function, test_item, 'other', current_date, 'Phase 8 fixture expense', 100
  ) returning id into test_expense;
  insert into public.event_share_links (event_id, token, expires_at)
  values (test_event, guest_token, now() + interval '1 day');
  insert into public.event_client_links (event_id, token, pin_hash, expires_at)
  values (
    test_event,
    client_token,
    'scrypt$' || repeat('A', 22) || '$' || repeat('A', 86),
    now() + interval '1 day'
  );
  receipt_name := test_event::text || '/' || test_expense::text || '/phase8-receipt.png';
  insert into storage.objects (bucket_id, name)
  values ('event-files', receipt_name);

  foreach as_role in array array['anon', 'authenticated'] loop
    foreach table_name in array array['event_expenses', 'event_client_links', 'event_share_links'] loop
      query_text := format('select 1 from public.%I', table_name);
      row_count := pg_temp.phase8_count_as(
        case when as_role = 'anon' then null else non_admin end,
        as_role,
        query_text
      );
      insert into pg_temp.phase8_rls_results(test, result, detail)
      values (
        as_role || ' cannot read ' || table_name,
        case when row_count in (0, -1) then 'PASS' else 'FAIL' end,
        'rows=' || row_count
      );
    end loop;

    foreach table_name in array array['event_expenses', 'event_client_links', 'event_share_links'] loop
      if table_name = 'event_expenses' then
        insert_text := format(
          'insert into public.event_expenses (event_id,category,expense_date,description,unit_cost) values (%L,''other'',current_date,''Blocked expense'',1)',
          test_event
        );
        update_text := format('update public.event_expenses set notes = ''blocked'' where id = %L', test_expense);
        delete_text := format('delete from public.event_expenses where id = %L', test_expense);
      elsif table_name = 'event_client_links' then
        insert_text := format(
          'insert into public.event_client_links (event_id,token,expires_at) values (%L,md5(''blocked-client-token''),now() + interval ''1 day'')',
          test_event
        );
        update_text := format('update public.event_client_links set pin_hash = null where token = %L', client_token);
        delete_text := format('delete from public.event_client_links where token = %L', client_token);
      else
        insert_text := format(
          'insert into public.event_share_links (event_id,token,expires_at) values (%L,md5(''blocked-guest-token''),now() + interval ''1 day'')',
          test_event
        );
        update_text := format('update public.event_share_links set revoked_at = now() where token = %L', guest_token);
        delete_text := format('delete from public.event_share_links where token = %L', guest_token);
      end if;

      foreach query_text in array array[insert_text, update_text, delete_text] loop
        affected_rows := pg_temp.phase8_write_as(
          case when as_role = 'anon' then null else non_admin end,
          as_role,
          query_text
        );
        insert into pg_temp.phase8_rls_results(test, result, detail)
        values (
          as_role || ' cannot write ' || table_name,
          case when affected_rows in (0, -1) then 'PASS' else 'FAIL' end,
          'affected=' || affected_rows
        );
      end loop;
    end loop;
  end loop;

  row_count := pg_temp.phase8_count_as(null, 'anon',
    format('select 1 from public.event_client_links where token = %L', guest_token));
  insert into pg_temp.phase8_rls_results(test, result, detail)
  values ('guest token cannot read client-link record', case when row_count in (0, -1) then 'PASS' else 'FAIL' end, 'rows=' || row_count);

  row_count := pg_temp.phase8_count_as(null, 'service_role',
    format('select 1 from public.event_client_links where token = %L', guest_token));
  insert into pg_temp.phase8_rls_results(test, result, detail)
  values ('guest token does not resolve to a client link', case when row_count = 0 then 'PASS' else 'FAIL' end, 'rows=' || row_count);

  row_count := pg_temp.phase8_count_as(null, 'service_role',
    format('select 1 from public.event_share_links where token = %L', client_token));
  insert into pg_temp.phase8_rls_results(test, result, detail)
  values ('client token does not resolve to a guest link', case when row_count = 0 then 'PASS' else 'FAIL' end, 'rows=' || row_count);

  foreach as_role in array array['anon', 'authenticated'] loop
    row_count := pg_temp.phase8_count_as(
      case when as_role = 'anon' then null else non_admin end,
      as_role,
      format('select 1 from storage.objects where bucket_id = %L and name = %L', 'event-files', receipt_name)
    );
    insert into pg_temp.phase8_rls_results(test, result, detail)
    values (as_role || ' cannot read private receipts', case when row_count in (0, -1) then 'PASS' else 'FAIL' end, 'rows=' || row_count);

    affected_rows := pg_temp.phase8_write_as(
      case when as_role = 'anon' then null else non_admin end,
      as_role,
      format(
        'insert into storage.objects (bucket_id,name) values (''event-files'',%L)',
        test_event::text || '/' || test_expense::text || '/blocked-upload.png'
      )
    );
    insert into pg_temp.phase8_rls_results(test, result, detail)
    values (as_role || ' cannot upload private receipts', case when affected_rows in (0, -1) then 'PASS' else 'FAIL' end, 'affected=' || affected_rows);
  end loop;

  delete from public.event_client_links where token = client_token;
  delete from public.event_share_links where token = guest_token;
  delete from storage.objects where bucket_id = 'event-files' and name = receipt_name;
  delete from public.events where id = test_event;
end;
$$;

select n, test, result, detail
from pg_temp.phase8_rls_results
order by n;
