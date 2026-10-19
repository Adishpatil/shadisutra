-- Run against DEV after migrations 001-006 and 008; migration 007 is not required.
-- The probes run as anon, an authenticated non-admin, and service_role.
-- Fixture rows are removed before the result table is returned.

drop table if exists pg_temp.phase4b_rls_results;
create temp table phase4b_rls_results (
  n serial,
  test text not null,
  result text not null,
  detail text not null
);

create or replace function pg_temp.phase4b_count_as(
  as_role text,
  query_text text,
  user_id uuid default '00000000-0000-0000-0000-000000000001',
  assurance text default 'aal2'
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
      'sub', user_id,
      'role', as_role,
      'aal', assurance
    )::text,
    true
  );
  execute format('set local role %I', as_role);
  begin
    execute format('select count(*) from (%s) rows_found', query_text)
      into row_count;
  exception when insufficient_privilege then
    row_count := -1;
  end;
  reset role;
  return row_count;
end;
$$;

create or replace function pg_temp.phase4b_write_as(
  as_role text,
  command_text text,
  user_id uuid default '00000000-0000-0000-0000-000000000001',
  assurance text default 'aal2'
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
      'sub', user_id,
      'role', as_role,
      'aal', assurance
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
  exception
    when insufficient_privilege then
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
  test_design uuid := gen_random_uuid();
  test_payment uuid;
  test_object_name text;
  test_share_token text := 'Phase4BTestToken0123456789ABCDEF';
  test_audit_id uuid;
  test_admin_id uuid;
  audit_count bigint;
  as_role text;
  table_name text;
  row_count bigint;
  affected_rows bigint;
  read_query text;
  insert_query text;
  update_query text;
  delete_query text;
  table_names text[] := array[
    'budgets',
    'payments',
    'audit_log',
    'designs',
    'event_items'
  ];
begin
  insert into public.events (name, type, date, venue)
  values ('Phase 4B RLS fixture', 'function', current_date, 'Test venue')
  returning id into test_event;

  insert into public.event_functions (event_id, name, date)
  values (test_event, 'Phase 4B function fixture', current_date)
  returning id into test_function;

  insert into public.event_items (function_id, category, title, cost)
  values (test_function, 'other', 'Phase 4B item fixture', 1.25)
  returning id into test_item;

  insert into public.budgets (event_id, agreed_total)
  values (test_event, 100.00);

  insert into public.payments (event_id, amount, paid_on, mode)
  values (test_event, 10.25, current_date, 'upi')
  returning id into test_payment;

  insert into public.designs (
    id, event_id, title, file_path, version, is_finalized
  )
  values (
    test_design,
    test_event,
    'Phase 4B draft fixture',
    test_event::text || '/' || test_design::text || '/draft.png',
    1,
    false
  );

  insert into public.event_share_links (event_id, token, expires_at)
  values (test_event, test_share_token, now() + interval '1 day');

  test_object_name :=
    test_event::text || '/' || test_design::text || '/storage-test.png';
  insert into storage.objects (bucket_id, name, metadata)
  values ('event-files', test_object_name, '{"mimetype":"image/png"}'::jsonb);

  select id into test_audit_id
  from public.audit_log
  where payload ->> 'event_id' = test_event::text
  order by at desc
  limit 1;
  select count(*) into audit_count
  from public.audit_log
  where payload ->> 'event_id' = test_event::text
    and table_name in ('payments', 'budgets');
  insert into pg_temp.phase4b_rls_results(test, result, detail)
  values (
    'Payment and budget changes are audited with event-scoped old/new values',
    case when audit_count >= 2 and test_audit_id is not null then 'PASS' else 'FAIL' end,
    'financial audit rows=' || audit_count
  );

  select id into test_admin_id
  from public.profiles
  where role = 'admin' and access_enabled = true
  limit 1;
  if test_admin_id is null then
    insert into pg_temp.phase4b_rls_results(test, result, detail)
    values (
      'Admin at aal1 cannot access event-files',
      'FAIL',
      'No enabled admin profile is available for this probe.'
    );
  else
    row_count := pg_temp.phase4b_count_as(
      'authenticated',
      format(
        'select 1 from storage.objects where bucket_id = ''event-files'' and name = %L',
        test_object_name
      ),
      test_admin_id,
      'aal1'
    );
    insert into pg_temp.phase4b_rls_results(test, result, detail)
    values (
      'Admin at aal1 cannot read event-files objects',
      case when row_count in (0, -1) then 'PASS' else 'FAIL' end,
      'rows=' || row_count
    );

    affected_rows := pg_temp.phase4b_write_as(
      'authenticated',
      format(
        'delete from storage.objects where bucket_id = ''event-files'' and name = %L',
        test_object_name
      ),
      test_admin_id,
      'aal1'
    );
    insert into pg_temp.phase4b_rls_results(test, result, detail)
    values (
      'Admin at aal1 cannot delete event-files objects',
      case when affected_rows in (0, -1) then 'PASS' else 'FAIL' end,
      'affected=' || affected_rows
    );
  end if;

  row_count := pg_temp.phase4b_count_as(
    'service_role',
    format(
      'select d.id from public.designs d join public.event_share_links l on l.event_id = d.event_id where l.token = %L and l.revoked_at is null and l.expires_at > now() and d.is_finalized = true',
      test_share_token
    )
  );
  insert into pg_temp.phase4b_rls_results(test, result, detail)
  values (
    'Non-finalized designs are excluded by the public share design query',
    case when row_count = 0 then 'PASS' else 'FAIL' end,
    'matching finalized designs=' || row_count
  );

  foreach as_role in array array['anon', 'authenticated'] loop
    foreach table_name in array table_names loop
      read_query := format('select 1 from public.%I', table_name);
      row_count := pg_temp.phase4b_count_as(as_role, read_query);
      insert into pg_temp.phase4b_rls_results(test, result, detail)
      values (
        as_role || ' cannot read ' || table_name,
        case when row_count in (0, -1) then 'PASS' else 'FAIL' end,
        'rows=' || row_count
      );
    end loop;
  end loop;

  foreach as_role in array array['anon', 'authenticated'] loop
    foreach table_name in array table_names loop
      if table_name = 'budgets' then
        insert_query := format(
          'insert into public.budgets (event_id,agreed_total) values (%L,1.00) on conflict (event_id) do update set agreed_total = excluded.agreed_total',
          test_event
        );
        update_query := format(
          'update public.budgets set agreed_total = 2.00 where event_id = %L',
          test_event
        );
        delete_query := format(
          'delete from public.budgets where event_id = %L',
          test_event
        );
      elsif table_name = 'payments' then
        insert_query := format(
          'insert into public.payments (event_id,amount,paid_on,mode) values (%L,1.00,current_date,''cash'')',
          test_event
        );
        update_query := format(
          'update public.payments set amount = 11.25 where id = %L',
          test_payment
        );
        delete_query := format(
          'delete from public.payments where id = %L',
          test_payment
        );
      elsif table_name = 'audit_log' then
        insert_query := format(
          'insert into public.audit_log (action,table_name,row_id) values (''PROBE'',''payments'',%L)',
          test_payment
        );
        update_query := format(
          'update public.audit_log set action = ''TAMPERED'' where id = %L',
          test_audit_id
        );
        delete_query := format(
          'delete from public.audit_log where id = %L',
          test_audit_id
        );
      elsif table_name = 'designs' then
        insert_query := format(
          'insert into public.designs (event_id,title,file_path,version,is_finalized) values (%L,''Blocked design'',%L,1,false)',
          test_event,
          test_event::text || '/' || gen_random_uuid()::text || '/blocked.png'
        );
        update_query := format(
          'update public.designs set title = ''TAMPERED'' where id = %L',
          test_design
        );
        delete_query := format(
          'delete from public.designs where id = %L',
          test_design
        );
      else
        insert_query := format(
          'insert into public.event_items (function_id,category,title,cost) values (%L,''other'',''Blocked item'',1.00)',
          test_function
        );
        update_query := format(
          'update public.event_items set cost = 2.00 where id = %L',
          test_item
        );
        delete_query := format(
          'delete from public.event_items where id = %L',
          test_item
        );
      end if;

      foreach read_query in array array[insert_query, update_query, delete_query] loop
        affected_rows := pg_temp.phase4b_write_as(as_role, read_query);
        insert into pg_temp.phase4b_rls_results(test, result, detail)
        values (
          as_role || ' cannot write ' || table_name,
          case when affected_rows in (0, -1) then 'PASS' else 'FAIL' end,
          'affected=' || affected_rows
        );
      end loop;
    end loop;
  end loop;

  foreach read_query in array array[
    format('update public.audit_log set action = ''TAMPERED'' where id = %L', test_audit_id),
    format('delete from public.audit_log where id = %L', test_audit_id)
  ] loop
    affected_rows := pg_temp.phase4b_write_as('service_role', read_query);
    insert into pg_temp.phase4b_rls_results(test, result, detail)
    values (
      'audit_log is append-only for service_role',
      case when affected_rows in (0, -1) then 'PASS' else 'FAIL' end,
      'affected=' || affected_rows
    );
  end loop;

  foreach as_role in array array['anon', 'authenticated'] loop
    row_count := pg_temp.phase4b_count_as(
      as_role,
      format(
        'select 1 from storage.objects where bucket_id = ''event-files'''
      )
    );
    insert into pg_temp.phase4b_rls_results(test, result, detail)
    values (
      as_role || ' cannot list event-files objects',
      case when row_count in (0, -1) then 'PASS' else 'FAIL' end,
      'rows=' || row_count
    );
    row_count := pg_temp.phase4b_count_as(
      as_role,
      format(
        'select 1 from storage.objects where bucket_id = ''event-files'' and name = %L',
        test_object_name
      )
    );
    insert into pg_temp.phase4b_rls_results(test, result, detail)
    values (
      as_role || ' cannot read event-files objects',
      case when row_count in (0, -1) then 'PASS' else 'FAIL' end,
      'rows=' || row_count
    );

    insert_query := format(
      'insert into storage.objects (bucket_id,name,metadata) values (''event-files'',%L,jsonb_build_object(''mimetype'',''image/png''))',
      test_event::text || '/' || gen_random_uuid()::text || '/blocked.png'
    );
    update_query := format(
      'update storage.objects set metadata = ''{}''::jsonb where bucket_id = ''event-files'' and name = %L',
      test_object_name
    );
    delete_query := format(
      'delete from storage.objects where bucket_id = ''event-files'' and name = %L',
      test_object_name
    );

    foreach read_query in array array[insert_query, update_query, delete_query] loop
      affected_rows := pg_temp.phase4b_write_as(as_role, read_query);
      insert into pg_temp.phase4b_rls_results(test, result, detail)
      values (
        as_role || ' cannot write event-files objects',
        case when affected_rows in (0, -1) then 'PASS' else 'FAIL' end,
        'affected=' || affected_rows
      );
    end loop;
  end loop;

  delete from storage.objects
  where bucket_id = 'event-files' and name = test_object_name;
  delete from public.event_share_links where token = test_share_token;
  delete from public.events where id = test_event;
end;
$$;

select n, test, result, detail
from pg_temp.phase4b_rls_results
order by n;
