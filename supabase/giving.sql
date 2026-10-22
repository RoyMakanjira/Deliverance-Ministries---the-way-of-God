-- Tithes, donations and pledges sent from the website's Give section.
create table if not exists giving(
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  kind text not null check(kind in('Tithe','Donation','Pledge')),
  name text not null, phone text, who text,
  dest text not null, prov text,
  amount numeric(12,2) not null check(amount > 0), currency text not null default 'USD',
  method text, ref text, due date, note text,
  status text not null default 'Pending' check(status in('Pending','Received','Fulfilled','Cancelled'))
);
alter table giving enable row level security;
-- anyone can send an entry, but only as Pending; only admins can read or change entries
create policy give_insert on giving for insert with check (status = 'Pending');
create policy give_read on giving for select using (is_super() or prov = my_prov());
create policy give_update on giving for update using (is_super() or prov = my_prov()) with check (is_super() or prov = my_prov());
create policy give_delete on giving for delete using (is_super());
