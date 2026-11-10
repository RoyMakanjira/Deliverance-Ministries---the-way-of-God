-- Church gallery page (/gallery): pictures, our goals, and what we have achieved.
-- Pictures go in the public 'team' storage bucket. Anyone can view; only the national admin can change.
create table if not exists gallery(
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  kind text not null check(kind in('photo','goal','achievement')),
  title text, detail text, date date, image_url text
);
alter table gallery enable row level security;
drop policy if exists gal_read on gallery;
drop policy if exists gal_write on gallery;
create policy gal_read on gallery for select using (true);
create policy gal_write on gallery for all using (is_super()) with check (is_super());
