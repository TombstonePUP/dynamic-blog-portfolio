alter table public.topics
  add column if not exists is_featured boolean not null default false,
  add column if not exists homepage_order integer;

create index if not exists topics_featured_order_idx
on public.topics (is_featured desc, homepage_order asc, name asc);

drop policy if exists "admins can update topics" on public.topics;
create policy "admins can update topics"
on public.topics
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
