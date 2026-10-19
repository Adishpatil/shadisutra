-- Enforce the final Phase 2 policies, including MFA-gated admin access.

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

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    auth.uid() is not null
    and (auth.jwt() ->> 'aal') = 'aal2'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.access_enabled = true
    ),
    false
  );
$$;

create or replace function public.customer_can_access_event(target_event_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    auth.uid() is not null
    and target_event_id is not null
    and exists (
      select 1
      from public.events e
      join public.profiles p on p.id = e.customer_id
      where e.id = target_event_id
        and e.customer_id = auth.uid()
        and p.role = 'customer'
        and p.access_enabled = true
    ),
    false
  );
$$;

drop policy if exists "Customer update own basic profile" on public.profiles;
drop policy if exists "Customer select budget if allowed" on public.budgets;
drop policy if exists "Customer select payments if allowed" on public.payments;
drop policy if exists "Admin read and manage enquiries" on public.enquiries;
drop policy if exists "Admin read enquiries" on public.enquiries;
alter table public.designs
  drop constraint if exists designs_file_path_event_prefix_check;
alter table public.designs
  add constraint designs_file_path_event_prefix_check
  check (file_path like event_id::text || '/%');
create policy "Admin read enquiries"
  on public.enquiries
  for select
  using (public.is_admin());

create or replace view public.customer_event_financial_summary
with (security_barrier = true)
as
select
  e.id as event_id,
  b.agreed_total,
  coalesce(p.total_paid, 0)::numeric(12, 2) as total_paid
from public.events e
left join public.budgets b on b.event_id = e.id
left join lateral (
  select sum(pay.amount) as total_paid
  from public.payments pay
  where pay.event_id = e.id
) p on true
where public.is_admin()
   or (
     e.show_payments_to_customer = true
     and public.customer_can_access_event(e.id)
   );

revoke all on public.customer_event_financial_summary from public, anon;
grant select on public.customer_event_financial_summary to authenticated;

create or replace function public.log_payment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return coalesce(new, old);
  end if;

  insert into public.audit_log (actor_id, action, table_name, row_id, payload)
  values (
    auth.uid(),
    TG_OP,
    'payments',
    coalesce(new.id, old.id),
    jsonb_build_object(
      'amount', coalesce(new.amount, old.amount),
      'event_id', coalesce(new.event_id, old.event_id),
      'mode', coalesce(new.mode, old.mode)
    )
  );
  return coalesce(new, old);
end;
$$;

create or replace function public.log_profile_access_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if old.access_enabled is distinct from new.access_enabled
     or old.role is distinct from new.role then
    insert into public.audit_log (actor_id, action, table_name, row_id, payload)
    values (
      auth.uid(),
      'UPDATE_ACCESS',
      'profiles',
      new.id,
      jsonb_build_object(
        'old_access_enabled', old.access_enabled,
        'new_access_enabled', new.access_enabled,
        'old_role', old.role,
        'new_role', new.role,
        'username', new.username
      )
    );
  end if;
  return new;
end;
$$;

drop policy if exists "Customer read accessible event files" on storage.objects;
drop policy if exists "Customer read finalized event design files" on storage.objects;
