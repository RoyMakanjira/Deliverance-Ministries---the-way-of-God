-- Anonymous messages to leadership from the Men's, Women's and Youth ministry pages.
-- No name, phone or account is stored with a message.
create table if not exists feedback(
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  ministry text not null check(ministry in('men','women','youth')),
  topic text, asm text,
  message text not null check(char_length(message) between 5 and 3000),
  status text not null default 'New' check(status in('New','Read','Being handled','Resolved'))
);

-- Ministry leaders: a staff account that can only read and handle its own ministry's messages
alter table staff drop constraint if exists staff_role_check;
alter table staff add constraint staff_role_check check(role in('super','province','ministry'));
alter table staff add column if not exists ministry text check(ministry in('men','women','youth'));
create or replace function my_ministry() returns text language sql security definer as $$ select ministry from staff where user_id=auth.uid() and role='ministry' $$;

alter table feedback enable row level security;
drop policy if exists fb_insert on feedback;
drop policy if exists fb_read on feedback;
drop policy if exists fb_update on feedback;
drop policy if exists fb_delete on feedback;
-- anyone can send (always as New); the national admin sees everything, a ministry leader sees their own ministry;
-- only the national admin can delete
create policy fb_insert on feedback for insert with check (status = 'New');
create policy fb_read on feedback for select using (is_super() or ministry = my_ministry());
create policy fb_update on feedback for update using (is_super() or ministry = my_ministry()) with check (is_super() or ministry = my_ministry());
create policy fb_delete on feedback for delete using (is_super());
-- signed-in users may change only the status of a message, never its text
revoke update on feedback from authenticated;
grant update(status) on feedback to authenticated;

-- uploads stay limited to national and province admins (not ministry leaders)
drop policy if exists team_photo_write on storage.objects;
drop policy if exists team_photo_delete on storage.objects;
create policy team_photo_write on storage.objects for insert with check (bucket_id = 'team' and exists(select 1 from public.staff where user_id=auth.uid() and role in('super','province')));
create policy team_photo_delete on storage.objects for delete using (bucket_id = 'team' and exists(select 1 from public.staff where user_id=auth.uid() and role in('super','province')));

-- To add a ministry leader:
-- 1. Supabase > Authentication > Users > Add user > Create new user (tick "Auto Confirm User")
-- 2. Run this, with their email and their ministry ('men', 'women' or 'youth'):
-- insert into staff(user_id, role, ministry) select id, 'ministry', 'youth' from auth.users where email = 'youth.leader@example.com'
--   on conflict (user_id) do update set role = excluded.role, ministry = excluded.ministry, province = null;
