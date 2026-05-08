update public.posts
set
  author_name = coalesce(public.posts.author_name, p.display_name, 'Author'),
  author_slug = coalesce(public.posts.author_slug, p.slug, 'author'),
  author_role = coalesce(public.posts.author_role, p.role, 'author'),
  author_avatar_url = coalesce(public.posts.author_avatar_url, p.avatar_url),
  asset_folder = coalesce(public.posts.asset_folder, public.posts.slug)
from public.profiles p
where
  public.posts.author_id = p.id
  and (
    public.posts.author_name is null
    or public.posts.author_slug is null
    or public.posts.author_role is null
    or public.posts.asset_folder is null
  );
