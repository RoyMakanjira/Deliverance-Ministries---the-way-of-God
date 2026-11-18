-- Testimonies page (/testimonies). Anyone can send one in from the site; it stays hidden until the national admin publishes it.
-- Visitors can only add unpublished testimonies: they cannot read unpublished ones, change or delete anything.
create table if not exists testimonies(
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  name text, asm text, title text, body text not null, image_url text,
  published boolean not null default false
);
alter table testimonies enable row level security;
drop policy if exists tes_read on testimonies;
drop policy if exists tes_send on testimonies;
drop policy if exists tes_admin on testimonies;
create policy tes_read on testimonies for select using (published or is_super());
create policy tes_send on testimonies for insert with check (not published and image_url is null and char_length(body) between 20 and 4000 and coalesce(char_length(name), 0) <= 120 and coalesce(char_length(title), 0) <= 150);
create policy tes_admin on testimonies for all using (is_super()) with check (is_super());
