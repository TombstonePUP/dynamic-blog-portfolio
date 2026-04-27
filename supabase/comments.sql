create extension if not exists pgcrypto;

create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'post_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.post_status as enum ('draft', 'published', 'archived');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default '',
  slug text unique,
  bio text,
  avatar_url text,
  role text not null default 'author' check (role in ('author', 'editor', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null default '' check (char_length(excerpt) <= 500),
  content_mdx text not null default '',
  cover_image_url text,
  thumbnail_url text,
  status public.post_status not null default 'draft',
  tags text[] not null default '{}'::text[],
  published_on date,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop table if exists public.comments cascade;

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null references public.posts(slug) on delete cascade,
  user_id uuid default auth.uid() references public.profiles(id) on delete set null,
  author text not null check (char_length(trim(author)) between 1 and 120),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  status text not null default 'approved' check (status in ('approved', 'pending', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_slug_idx on public.profiles (slug);
create index if not exists posts_author_status_idx on public.posts (author_id, status, updated_at desc);
create index if not exists posts_published_idx on public.posts (status, published_on desc, created_at desc);
create index if not exists posts_tags_idx on public.posts using gin (tags);
create index if not exists comments_post_slug_idx on public.comments (post_slug, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, slug)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    public.slugify(
      coalesce(
        new.raw_user_meta_data ->> 'slug',
        new.raw_user_meta_data ->> 'display_name',
        split_part(coalesce(new.email, ''), '@', 1)
      )
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "published posts are readable" on public.posts;
create policy "published posts are readable"
on public.posts
for select
to anon, authenticated
using (status = 'published' or auth.uid() = author_id);

drop policy if exists "authors can insert posts" on public.posts;
create policy "authors can insert posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "authors can update own posts" on public.posts;
create policy "authors can update own posts"
on public.posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "authors can delete own posts" on public.posts;
create policy "authors can delete own posts"
on public.posts
for delete
to authenticated
using (auth.uid() = author_id);

drop policy if exists "approved comments are publicly readable" on public.comments;
create policy "approved comments are publicly readable"
on public.comments
for select
to anon, authenticated
using (
  status = 'approved'
  and exists (
    select 1
    from public.posts
    where public.posts.slug = public.comments.post_slug
      and public.posts.status = 'published'
  )
);

drop policy if exists "anyone can comment on published posts" on public.comments;
create policy "anyone can comment on published posts"
on public.comments
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.posts
    where public.posts.slug = public.comments.post_slug
      and public.posts.status = 'published'
  )
);

drop policy if exists "authors can moderate comments on own posts" on public.comments;
create policy "authors can moderate comments on own posts"
on public.comments
for update
to authenticated
using (
  exists (
    select 1
    from public.posts
    where public.posts.slug = public.comments.post_slug
      and public.posts.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.posts
    where public.posts.slug = public.comments.post_slug
      and public.posts.author_id = auth.uid()
  )
);
