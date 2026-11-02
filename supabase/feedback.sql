-- Anonymous messages to leadership from the Men's, Women's and Youth ministry pages.
-- No name, phone or account is stored with a message.
create table if not exists feedback(
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  ministry text not null check(ministry in('men','women','youth')),
  topic text, asm text,
  message text not null check(char_length(message) between 5 and 3000),
  status text not null default 'New' check(status in('New','Read','Being handled','Resolved'))
);
alter table feedback enable row level security;
drop policy if exists fb_insert on feedback;
drop policy if exists fb_read on feedback;
drop policy if exists fb_update on feedback;
drop policy if exists fb_delete on feedback;
-- anyone can send (always as New); only the national admin can read, update or delete
create policy fb_insert on feedback for insert with check (status = 'New');
create policy fb_read on feedback for select using (is_super());
create policy fb_update on feedback for update using (is_super()) with check (is_super());
create policy fb_delete on feedback for delete using (is_super());
