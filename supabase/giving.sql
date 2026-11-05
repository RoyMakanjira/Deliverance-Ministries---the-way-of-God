-- Tithes, donations, pledges and Evangelism Financial Partners sent from the website.
create table if not exists giving(
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  kind text not null,
  name text not null, phone text, who text,
  dest text not null, prov text,
  amount numeric(12,2) not null check(amount > 0), currency text not null default 'USD',
  method text, ref text, due date, note text,
  status text not null default 'Pending' check(status in('Pending','Received','Fulfilled','Cancelled'))
);
alter table giving add column if not exists frequency text;
alter table giving drop constraint if exists giving_kind_check;
alter table giving add constraint giving_kind_check check(kind in('Tithe','Donation','Pledge','Partnership'));
alter table giving enable row level security;
drop policy if exists give_insert on giving;
drop policy if exists give_read on giving;
drop policy if exists give_update on giving;
drop policy if exists give_delete on giving;
-- anyone can send an entry, but only as Pending; only admins can read or change entries
create policy give_insert on giving for insert with check (status = 'Pending');
create policy give_read on giving for select using (is_super() or prov = my_prov());
create policy give_update on giving for update using (is_super() or prov = my_prov()) with check (is_super() or prov = my_prov());
create policy give_delete on giving for delete using (is_super());
