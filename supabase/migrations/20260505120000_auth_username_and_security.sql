alter table public.profiles
  add column if not exists username text;

update public.profiles
set username = nullif(lower(trim(username)), '')
where username is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_username_format_check'
  ) then
    alter table public.profiles
      add constraint profiles_username_format_check
      check (username is null or username ~ '^[a-z0-9_]{3,30}$');
  end if;
end;
$$;

create unique index if not exists profiles_username_lower_idx
on public.profiles (lower(username)) 
where username is not null;

create table if not exists public.auth_login_attempts (
  subject_key text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  identifier text not null,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_attempt_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists auth_login_attempts_user_id_idx
on public.auth_login_attempts (user_id);

create index if not exists auth_login_attempts_locked_until_idx
on public.auth_login_attempts (locked_until)
where locked_until is not null;

drop trigger if exists set_auth_login_attempts_updated_at on public.auth_login_attempts;
create trigger set_auth_login_attempts_updated_at
before update on public.auth_login_attempts
for each row
execute function public.set_updated_at();

create table if not exists public.auth_security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  username text,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info', 'warn', 'error')),
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists auth_security_events_user_id_idx
on public.auth_security_events (user_id);

create index if not exists auth_security_events_event_type_created_at_idx
on public.auth_security_events (event_type, created_at desc);

alter table public.auth_login_attempts enable row level security;
alter table public.auth_security_events enable row level security;

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
  metadata_username text := nullif(lower(trim(coalesce(new.raw_user_meta_data ->> 'username', ''))), '');
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
  if metadata_username is not null and metadata_username !~ '^[a-z0-9_]{3,30}$' then
    metadata_username := null;
  end if;

  insert into public.profiles (
    id,
    email,
    username,
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
    metadata_username,
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
    username = coalesce(nullif(public.profiles.username, ''), excluded.username),
    first_name = coalesce(nullif(public.profiles.first_name, ''), excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    display_name = coalesce(nullif(public.profiles.display_name, ''), excluded.display_name),
    slug = coalesce(nullif(public.profiles.slug, ''), excluded.slug);

  return new;
end;
$$;
