do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'approval_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.approval_status as enum ('pending', 'approved', 'rejected');
  end if;
end
$$;

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists approval_status public.approval_status not null default 'pending',
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_approved_by_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_approved_by_fkey
      foreign key (approved_by)
      references public.profiles(id)
      on delete set null;
  end if;
end
$$;

create index if not exists profiles_approval_status_idx on public.profiles (approval_status);

update public.profiles
set
  first_name = coalesce(
    nullif(trim(first_name), ''),
    nullif(split_part(trim(display_name), ' ', 1), ''),
    split_part(coalesce(email, ''), '@', 1),
    'Writer'
  ),
  last_name = case
    when nullif(trim(last_name), '') is not null then trim(last_name)
    when strpos(trim(coalesce(display_name, '')), ' ') > 0
      then nullif(trim(substring(trim(display_name) from strpos(trim(display_name), ' ') + 1)), '')
    else null
  end,
  approval_status = 'approved',
  approved_at = coalesce(approved_at, created_at, timezone('utc', now()));

create or replace function public.generate_unique_profile_slug(base_value text, profile_id uuid)
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  candidate := public.slugify(base_value);

  if candidate = '' then
    candidate := 'writer';
  end if;

  if exists (
    select 1
    from public.profiles
    where slug = candidate
      and id <> profile_id
  ) then
    candidate := candidate || '-' || left(replace(profile_id::text, '-', ''), 8);
  end if;

  return candidate;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and approval_status = 'approved'
  );
$$;

create or replace function public.is_approved_user(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles
    where id = target_user_id
      and approval_status = 'approved'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text := lower(coalesce(new.email, ''));
  metadata_first_name text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), '');
  metadata_last_name text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), '');
  fallback_label text := split_part(normalized_email, '@', 1);
  computed_first_name text := coalesce(
    metadata_first_name,
    nullif(split_part(initcap(replace(fallback_label, '.', ' ')), ' ', 1), ''),
    'Writer'
  );
  computed_last_name text := metadata_last_name;
  computed_display_name text := trim(
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      concat_ws(' ', computed_first_name, computed_last_name)
    )
  );
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    display_name,
    slug,
    role,
    approval_status
  )
  values (
    new.id,
    normalized_email,
    computed_first_name,
    computed_last_name,
    coalesce(nullif(computed_display_name, ''), fallback_label, 'Writer'),
    public.generate_unique_profile_slug(
      coalesce(nullif(computed_display_name, ''), fallback_label, 'Writer'),
      new.id
    ),
    'author',
    'pending'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    first_name = coalesce(nullif(public.profiles.first_name, ''), excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    display_name = coalesce(nullif(public.profiles.display_name, ''), excluded.display_name),
    slug = coalesce(nullif(public.profiles.slug, ''), excluded.slug);

  return new;
end;
$$;

alter table public.comments
  drop constraint if exists comments_post_slug_fkey;

alter table public.comments
  add constraint comments_post_slug_fkey
  foreign key (post_slug)
  references public.posts(slug)
  on update cascade
  on delete cascade;

drop policy if exists "profiles are publicly readable" on public.profiles;
drop policy if exists "approved profiles are publicly readable" on public.profiles;
create policy "approved profiles are publicly readable"
on public.profiles
for select
to anon, authenticated
using (
  approval_status = 'approved'
  or auth.uid() = id
  or public.is_admin()
);

drop policy if exists "admins can manage all profiles" on public.profiles;
create policy "admins can manage all profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "published posts are readable" on public.posts;
create policy "published posts are readable"
on public.posts
for select
to anon, authenticated
using (
  status = 'published'
  or auth.uid() = author_id
  or public.is_admin()
);

drop policy if exists "authors can insert posts" on public.posts;
create policy "authors can insert posts"
on public.posts
for insert
to authenticated
with check (
  auth.uid() = author_id
  and public.is_approved_user(auth.uid())
);

drop policy if exists "authors can update own posts" on public.posts;
create policy "authors can update own posts"
on public.posts
for update
to authenticated
using (
  (auth.uid() = author_id and public.is_approved_user(auth.uid()))
  or public.is_admin()
)
with check (
  (auth.uid() = author_id and public.is_approved_user(auth.uid()))
  or public.is_admin()
);

drop policy if exists "authors can delete own posts" on public.posts;
create policy "authors can delete own posts"
on public.posts
for delete
to authenticated
using (
  (auth.uid() = author_id and public.is_approved_user(auth.uid()))
  or public.is_admin()
);

drop policy if exists "authors can moderate comments on own posts" on public.comments;
create policy "authors can moderate comments on own posts"
on public.comments
for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.posts
    where public.posts.slug = public.comments.post_slug
      and public.posts.author_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.posts
    where public.posts.slug = public.comments.post_slug
      and public.posts.author_id = auth.uid()
  )
);
