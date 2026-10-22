-- Editable website sections (About Us and the ministries), changed from the admin dashboard.
create table if not exists content(key text primary key, title text not null, body text, leader text, image_url text, updated_at timestamptz default now());
alter table content enable row level security;
create policy content_read on content for select using (true);
create policy content_write on content for all using (is_super()) with check (is_super());
insert into content(key, title) values ('about', 'About Us'), ('women', 'Women''s Ministry'), ('youth', 'Youth Ministry'), ('children', 'Children''s Ministry') on conflict (key) do nothing;
