create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.topics enable row level security;

drop trigger if exists set_topics_updated_at on public.topics;
create trigger set_topics_updated_at
before update on public.topics
for each row
execute function public.set_updated_at();

alter table public.posts
  add column if not exists topic_id uuid references public.topics(id) on delete set null;

create index if not exists posts_topic_id_idx on public.posts (topic_id);

insert into public.topics (name, slug)
select distinct on (public.slugify(tag_value)) tag_value, public.slugify(tag_value)
from public.posts
cross join lateral (
  select trim(tag) as tag_value
  from unnest(public.posts.tags) as tag
  where trim(tag) <> ''
    and lower(trim(tag)) <> 'featured'
) existing_tags
where public.slugify(tag_value) <> ''
order by public.slugify(tag_value), tag_value
on conflict (slug) do nothing;

update public.posts
set topic_id = public.topics.id
from public.topics
where public.posts.topic_id is null
  and public.topics.slug = public.slugify(
    coalesce(
      (
        select trim(tag)
        from unnest(public.posts.tags) as tag
        where trim(tag) <> ''
          and lower(trim(tag)) <> 'featured'
        limit 1
      ),
      ''
    )
  );

drop policy if exists "topics are publicly readable" on public.topics;
create policy "topics are publicly readable"
on public.topics
for select
to anon, authenticated
using (true);

drop policy if exists "approved users can create topics" on public.topics;
create policy "approved users can create topics"
on public.topics
for insert
to authenticated
with check (public.is_approved_user(auth.uid()));
