alter table public.posts
  add column if not exists image_url text;

update public.posts
set image_url = coalesce(
  nullif(trim(image_url), ''),
  nullif(trim(cover_image_url), ''),
  nullif(trim(thumbnail_url), '')
);

alter table public.posts
  drop column if exists cover_image_url,
  drop column if exists thumbnail_url;
