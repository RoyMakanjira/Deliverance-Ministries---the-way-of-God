insert into storage.buckets(id, name, public) values ('team', 'team', true) on conflict (id) do nothing;
create policy team_photo_read on storage.objects for select using (bucket_id = 'team');
create policy team_photo_write on storage.objects for insert with check (bucket_id = 'team' and public.is_super());
create policy team_photo_delete on storage.objects for delete using (bucket_id = 'team' and public.is_super());
