-- Assembly pages: where each assembly is, its service time, and pictures of the church and of a normal Sunday.
-- Anyone can view. The national admin can change every assembly; a province admin only their own province's.
create table if not exists assembly_info(
  asm text primary key, prov text not null,
  address text, map_link text, service_time text,
  updated_at timestamptz default now()
);
create table if not exists assembly_photos(
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  asm text not null, prov text not null,
  kind text not null check(kind in('church','sunday')),
  image_url text not null, caption text
);
alter table assembly_info enable row level security;
alter table assembly_photos enable row level security;
drop policy if exists ai_read on assembly_info;
drop policy if exists ai_write on assembly_info;
drop policy if exists ap_read on assembly_photos;
drop policy if exists ap_write on assembly_photos;
create policy ai_read on assembly_info for select using (true);
create policy ai_write on assembly_info for all using (is_super() or prov = my_prov()) with check (is_super() or prov = my_prov());
create policy ap_read on assembly_photos for select using (true);
create policy ap_write on assembly_photos for all using (is_super() or prov = my_prov()) with check (is_super() or prov = my_prov());
