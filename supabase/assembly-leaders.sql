-- Let province admins add/edit leaders (and their photos) for their own province.
drop policy if exists team_write on team;
create policy team_write on team for all using (is_super() or prov=my_prov()) with check (is_super() or prov=my_prov());
drop policy if exists team_photo_write on storage.objects;
drop policy if exists team_photo_delete on storage.objects;
create policy team_photo_write on storage.objects for insert with check (bucket_id = 'team' and exists(select 1 from public.staff where user_id=auth.uid()));
create policy team_photo_delete on storage.objects for delete using (bucket_id = 'team' and exists(select 1 from public.staff where user_id=auth.uid()));
