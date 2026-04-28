alter table public.posts
  add column if not exists author_name text,
  add column if not exists author_slug text,
  add column if not exists author_role text,
  add column if not exists author_avatar_url text,
  add column if not exists asset_folder text;

update public.posts
set
  author_name = coalesce(nullif(trim(author_name), ''), 'Author'),
  author_slug = coalesce(nullif(trim(author_slug), ''), 'author'),
  asset_folder = coalesce(nullif(trim(asset_folder), ''), slug)
where
  author_name is null
  or author_slug is null
  or asset_folder is null
  or trim(coalesce(author_name, '')) = ''
  or trim(coalesce(author_slug, '')) = ''
  or trim(coalesce(asset_folder, '')) = '';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-assets',
  'post-assets',
  true,
  52428800,
  array[
    'application/octet-stream',
    'application/pdf',
    'audio/mpeg',
    'audio/wav',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
    'text/plain; charset=utf-8',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "post assets are publicly readable" on storage.objects;
create policy "post assets are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'post-assets');

drop policy if exists "approved users can upload post assets" on storage.objects;
create policy "approved users can upload post assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-assets'
  and public.is_approved_user(auth.uid())
);

drop policy if exists "approved users can update post assets" on storage.objects;
create policy "approved users can update post assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-assets'
  and public.is_approved_user(auth.uid())
)
with check (
  bucket_id = 'post-assets'
  and public.is_approved_user(auth.uid())
);

drop policy if exists "approved users can delete post assets" on storage.objects;
create policy "approved users can delete post assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-assets'
  and public.is_approved_user(auth.uid())
);
