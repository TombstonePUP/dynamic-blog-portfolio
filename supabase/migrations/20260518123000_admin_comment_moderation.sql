drop policy if exists "admins can inspect all comments" on public.comments;
create policy "admins can inspect all comments"
on public.comments
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can delete comments" on public.comments;
create policy "admins can delete comments"
on public.comments
for delete
to authenticated
using (public.is_admin());
