-- A picture or a video on a testimony. image_url holds the file link; media_type says which it is.
alter table testimonies add column if not exists media_type text not null default 'image';
alter table testimonies drop constraint if exists testimonies_media_type_check;
alter table testimonies add constraint testimonies_media_type_check check (media_type in ('image', 'video'));

-- Visitors may upload one picture or video with their testimony, only into the testimonies-inbox folder
-- and only as picture or video files. Nothing shows on the site until the national admin publishes it.
drop policy if exists tes_upload on storage.objects;
create policy tes_upload on storage.objects for insert to anon, authenticated with check (
  bucket_id = 'team' and (storage.foldername(name))[1] = 'testimonies-inbox'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'mp4', 'mov', 'webm', '3gp', 'm4v')
);

-- A testimony sent from the site may now carry a file, but only one from that folder
drop policy if exists tes_send on testimonies;
create policy tes_send on testimonies for insert with check (
  not published and char_length(body) between 20 and 4000
  and coalesce(char_length(name), 0) <= 120 and coalesce(char_length(title), 0) <= 150
  and (image_url is null or image_url like 'https://vpkoatebwtxhyoakvtcb.supabase.co/storage/v1/object/public/team/testimonies-inbox/%')
);
