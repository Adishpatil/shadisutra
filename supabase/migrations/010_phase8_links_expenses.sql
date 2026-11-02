alter table public.events
  add column if not exists show_payments_to_customer boolean not null default false;

create table public.event_client_links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  token text not null unique
    check (token ~ '^[A-Za-z0-9_-]{32}$'),
  pin_hash text
    check (pin_hash is null or pin_hash ~ '^scrypt\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$'),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create unique index event_client_links_one_active_per_event_idx
  on public.event_client_links (event_id)
  where revoked_at is null;
create index event_client_links_active_token_idx
  on public.event_client_links (token, expires_at)
  where revoked_at is null;

alter table public.event_client_links enable row level security;
alter table public.event_client_links force row level security;
create policy "AAL2 admins manage client links"
  on public.event_client_links
  for all
  to authenticated
  using (public.is_admin_aal2())
  with check (public.is_admin_aal2());
revoke all privileges on table public.event_client_links
  from public, anon, authenticated;
grant select, insert, update, delete on table public.event_client_links
  to authenticated;

create table public.event_expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  function_id uuid references public.event_functions(id) on delete set null,
  item_id uuid references public.event_items(id) on delete set null,
  category text not null check (category in (
    'lighting', 'flowers', 'decor', 'instruments', 'venue',
    'food', 'staff', 'travel', 'other'
  )),
  expense_date date not null,
  vendor text not null default '' check (char_length(vendor) <= 200),
  description text not null check (char_length(description) between 1 and 500),
  quantity numeric(10, 3) not null default 1 check (quantity > 0),
  unit_cost bigint not null check (unit_cost >= 0),
  amount bigint not null default 0 check (amount >= 0),
  tax_amount bigint not null default 0 check (tax_amount >= 0),
  status text not null default 'unpaid'
    check (status in ('unpaid', 'part_paid', 'paid')),
  amount_paid bigint not null default 0 check (amount_paid >= 0),
  payment_mode text check (
    payment_mode is null or payment_mode in ('cash', 'upi', 'bank', 'cheque', 'card', 'other')
  ),
  notes text check (notes is null or char_length(notes) <= 5000),
  receipt_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_paid <= amount + tax_amount),
  check (
    receipt_path is null or receipt_path ~ (
      '^' || event_id::text ||
      '/[0-9a-f-]{36}/[A-Za-z0-9_-]+[.](png|jpg|webp|pdf)$'
    )
  )
);

create index event_expenses_event_date_idx
  on public.event_expenses (event_id, expense_date desc);
create index event_expenses_category_idx
  on public.event_expenses (event_id, category, status);
create index event_expenses_function_idx
  on public.event_expenses (function_id);
create index event_expenses_item_idx
  on public.event_expenses (item_id);

alter table public.event_expenses enable row level security;
alter table public.event_expenses force row level security;
create policy "AAL2 admins manage event expenses"
  on public.event_expenses
  for all
  to authenticated
  using (public.is_admin_aal2())
  with check (public.is_admin_aal2());
revoke all privileges on table public.event_expenses
  from public, anon, authenticated;
grant select, insert, update, delete on table public.event_expenses
  to authenticated;

create or replace function public.prepare_event_expense()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  total_due bigint;
begin
  if new.function_id is not null and not exists (
    select 1 from public.event_functions f
    where f.id = new.function_id and f.event_id = new.event_id
  ) then
    raise exception 'Expense function must belong to its event.'
      using errcode = '23514';
  end if;

  if new.item_id is not null and not exists (
    select 1
    from public.event_items i
    join public.event_functions f on f.id = i.function_id
    where i.id = new.item_id
      and f.event_id = new.event_id
      and (new.function_id is null or i.function_id = new.function_id)
  ) then
    raise exception 'Expense item must belong to its event and function.'
      using errcode = '23514';
  end if;

  new.amount := round(new.quantity * new.unit_cost)::bigint;
  total_due := new.amount + new.tax_amount;
  if new.amount_paid > total_due then
    raise exception 'Expense payment exceeds the amount due.'
      using errcode = '23514';
  end if;
  new.status := case
    when new.amount_paid = 0 then 'unpaid'
    when new.amount_paid = total_due then 'paid'
    else 'part_paid'
  end;
  new.updated_at := now();
  return new;
end;
$$;

create trigger prepare_event_expense_before_write
  before insert or update on public.event_expenses
  for each row execute function public.prepare_event_expense();

create or replace function public.log_event_expense_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_values jsonb;
  new_values jsonb;
  target_id uuid;
  target_event_id uuid;
begin
  if tg_op <> 'INSERT' then
    old_values := jsonb_build_object(
      'category', old.category,
      'expense_date', old.expense_date,
      'quantity', old.quantity,
      'unit_cost', old.unit_cost,
      'amount', old.amount,
      'tax_amount', old.tax_amount,
      'amount_paid', old.amount_paid,
      'status', old.status
    );
  end if;
  if tg_op <> 'DELETE' then
    new_values := jsonb_build_object(
      'category', new.category,
      'expense_date', new.expense_date,
      'quantity', new.quantity,
      'unit_cost', new.unit_cost,
      'amount', new.amount,
      'tax_amount', new.tax_amount,
      'amount_paid', new.amount_paid,
      'status', new.status
    );
  end if;
  target_id := case when tg_op = 'DELETE' then old.id else new.id end;
  target_event_id := case when tg_op = 'DELETE' then old.event_id else new.event_id end;

  insert into public.audit_log (actor_id, action, table_name, row_id, payload)
  values (
    auth.uid(),
    'EVENT_EXPENSE_' || tg_op,
    'event_expenses',
    target_id,
    jsonb_build_object(
      'event_id', target_event_id,
      'old', old_values,
      'new', new_values
    )
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger audit_event_expense_change
  after insert or update or delete on public.event_expenses
  for each row execute function public.log_event_expense_change();

revoke all privileges on function public.prepare_event_expense()
  from public, anon, authenticated;
revoke all privileges on function public.log_event_expense_change()
  from public, anon, authenticated;

drop policy if exists "Admin manages event share links"
  on public.event_share_links;
create policy "AAL2 admins manage guest links"
  on public.event_share_links
  for all
  to authenticated
  using (public.is_admin_aal2())
  with check (public.is_admin_aal2());
