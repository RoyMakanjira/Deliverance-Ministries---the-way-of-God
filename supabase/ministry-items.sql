-- Pictures and details on a ministry page: recent events, upcoming events, leadership and programs.
-- Pictures go in the public 'team' storage bucket. Anyone can view; only the national admin can change.
create table if not exists ministry_items(
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  ministry text not null default 'youth',
  kind text not null check(kind in('recent','upcoming','leader','program')),
  title text not null, detail text, date date, image_url text
);
alter table ministry_items enable row level security;
drop policy if exists mi_read on ministry_items;
drop policy if exists mi_write on ministry_items;
create policy mi_read on ministry_items for select using (true);
create policy mi_write on ministry_items for all using (is_super()) with check (is_super());
