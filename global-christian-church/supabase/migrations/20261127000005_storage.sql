-- =====================================================================
-- Storage buckets and policies
-- =====================================================================
insert into storage.buckets (id, name, public) values
  ('public-media', 'public-media', true),       -- site images, pastor photo, thumbnails, event photos
  ('sermon-media', 'sermon-media', true),       -- published sermon audio/video and notes PDFs
  ('avatars', 'avatars', true),                 -- member profile photos, one folder per user id
  ('member-resources', 'member-resources', false) -- members-only PDFs and e-books (signed URLs)
on conflict (id) do nothing;

-- public-media: anyone reads (bucket is public); content editors and media team write
create policy "public-media: editors upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and (public.is_content_editor() or public.is_media() or public.is_pastoral()));
create policy "public-media: editors update" on storage.objects for update to authenticated
  using (bucket_id = 'public-media' and (public.is_content_editor() or public.is_media() or public.is_pastoral()));
create policy "public-media: editors delete" on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and (public.is_content_editor() or public.is_media()));

-- sermon-media: sermon editors write
create policy "sermon-media: editors upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'sermon-media' and public.is_sermon_editor());
create policy "sermon-media: editors update" on storage.objects for update to authenticated
  using (bucket_id = 'sermon-media' and public.is_sermon_editor());
create policy "sermon-media: media delete" on storage.objects for delete to authenticated
  using (bucket_id = 'sermon-media' and public.is_media());

-- avatars: each user manages files under avatars/<their user id>/...
create policy "avatars: own folder write" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: own folder update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: own folder delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- member-resources: private; signed-in members read, editors write
create policy "member-resources: members read" on storage.objects for select to authenticated
  using (bucket_id = 'member-resources');
create policy "member-resources: editors write" on storage.objects for insert to authenticated
  with check (bucket_id = 'member-resources' and (public.is_pastoral() or public.is_media()));
create policy "member-resources: editors delete" on storage.objects for delete to authenticated
  using (bucket_id = 'member-resources' and (public.is_pastoral() or public.is_media()));
