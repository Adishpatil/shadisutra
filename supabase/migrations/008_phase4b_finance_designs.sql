create or replace function public.is_admin_aal2()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_admin()
    and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

revoke all privileges on function public.is_admin_aal2() from public, anon;
grant execute on function public.is_admin_aal2() to authenticated;

drop policy if exists "Admin full access on budgets" on public.budgets;
create policy "Admin full access on budgets"
  on public.budgets
  for all
  to authenticated
  using (public.is_admin_aal2())
  with check (public.is_admin_aal2());

drop policy if exists "Admin full access on payments" on public.payments;
create policy "Admin full access on payments"
  on public.payments
  for all
  to authenticated
  using (public.is_admin_aal2())
  with check (public.is_admin_aal2());

drop policy if exists "Admin full access on event_items" on public.event_items;
create policy "Admin full access on event_items"
  on public.event_items
  for all
  to authenticated
  using (public.is_admin_aal2())
  with check (public.is_admin_aal2());

drop policy if exists "Customer select finalized designs" on public.designs;
drop policy if exists "Admin full access on designs" on public.designs;
create policy "Admin full access on designs"
  on public.designs
  for all
  to authenticated
  using (public.is_admin_aal2())
  with check (public.is_admin_aal2());

drop policy if exists "Admin view audit log" on public.audit_log;
create policy "Admin view audit log"
  on public.audit_log
  for select
  to authenticated
  using (public.is_admin_aal2());

alter table public.payments
  drop constraint if exists payments_mode_check;
alter table public.payments disable trigger trigger_audit_payments;
update public.payments
set mode = case
  when lower(mode) like '%cash%' then 'cash'
  when lower(mode) like '%upi%' then 'upi'
  when lower(mode) like '%cheque%' or lower(mode) like '%check%' then 'cheque'
  when lower(mode) like '%card%' then 'card'
  else 'bank'
end;
alter table public.payments enable trigger trigger_audit_payments;
alter table public.payments
  add constraint payments_mode_check
  check (mode in ('cash', 'upi', 'bank', 'cheque', 'card'));

create or replace function public.log_payment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_values jsonb;
  new_values jsonb;
begin
  if tg_op <> 'INSERT' then
    old_values := jsonb_build_object(
      'amount', old.amount,
      'paid_on', old.paid_on,
      'mode', old.mode
    );
  end if;
  if tg_op <> 'DELETE' then
    new_values := jsonb_build_object(
      'amount', new.amount,
      'paid_on', new.paid_on,
      'mode', new.mode
    );
  end if;

  insert into public.audit_log (actor_id, action, table_name, row_id, payload)
  values (
    auth.uid(),
    'PAYMENT_' || tg_op,
    'payments',
    case when tg_op = 'DELETE' then old.id else new.id end,
    jsonb_build_object(
      'event_id', case when tg_op = 'DELETE' then old.event_id else new.event_id end,
      'old', old_values,
      'new', new_values
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.log_budget_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_values jsonb;
  new_values jsonb;
begin
  if tg_op = 'UPDATE'
     and old.agreed_total is not distinct from new.agreed_total then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    old_values := jsonb_build_object('agreed_total', old.agreed_total);
  end if;
  new_values := jsonb_build_object('agreed_total', new.agreed_total);

  insert into public.audit_log (actor_id, action, table_name, row_id, payload)
  values (
    auth.uid(),
    'BUDGET_' || tg_op,
    'budgets',
    new.id,
    jsonb_build_object(
      'event_id', new.event_id,
      'old', old_values,
      'new', new_values
    )
  );
  return new;
end;
$$;

drop trigger if exists trigger_audit_budgets on public.budgets;
create trigger trigger_audit_budgets
  after insert or update on public.budgets
  for each row execute function public.log_budget_change();

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Audit log is append-only.'
    using errcode = '55000';
end;
$$;

drop trigger if exists prevent_audit_log_row_mutation on public.audit_log;
create trigger prevent_audit_log_row_mutation
  before update or delete on public.audit_log
  for each row execute function public.prevent_audit_log_mutation();

drop trigger if exists prevent_audit_log_truncate on public.audit_log;
create trigger prevent_audit_log_truncate
  before truncate on public.audit_log
  for each statement execute function public.prevent_audit_log_mutation();

revoke all privileges on table public.audit_log
  from public, anon, authenticated, service_role;
grant select on table public.audit_log to authenticated;
revoke insert, update, delete, truncate on table public.audit_log
  from public, anon, authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-files',
  'event-files',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admin manage event-files bucket" on storage.objects;
drop policy if exists "Admin AAL2 manage event-files bucket" on storage.objects;
create policy "Admin AAL2 manage event-files bucket"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'event-files'
    and public.is_admin_aal2()
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[A-Za-z0-9_-]+[.](png|jpg|webp|pdf)$'
  )
  with check (
    bucket_id = 'event-files'
    and public.is_admin_aal2()
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[A-Za-z0-9_-]+[.](png|jpg|webp|pdf)$'
  );

revoke all privileges on function public.log_payment_change() from public, anon, authenticated;
revoke all privileges on function public.log_budget_change() from public, anon, authenticated;
revoke all privileges on function public.prevent_audit_log_mutation() from public, anon, authenticated;
