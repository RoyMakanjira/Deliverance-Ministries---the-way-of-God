-- Posters / videos on events, uploaded from the admin dashboard into the public 'team' storage bucket.
alter table events add column if not exists media_url text;
alter table events add column if not exists media_type text;
-- let every admin (national and province) upload and remove files
drop policy if exists team_photo_write on storage.objects;
drop policy if exists team_photo_delete on storage.objects;
create policy team_photo_write on storage.objects for insert with check (bucket_id = 'team' and exists(select 1 from public.staff where user_id=auth.uid()));
create policy team_photo_delete on storage.objects for delete using (bucket_id = 'team' and exists(select 1 from public.staff where user_id=auth.uid()));
