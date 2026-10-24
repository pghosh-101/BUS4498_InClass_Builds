create policy "authenticated_can_select_all_events"
  on public.events
  for select
  to authenticated
  using (true);

create policy "authenticated_can_review_events"
  on public.events
  for update
  to authenticated
  using (true)
  with check (status in ('published', 'waiting', 'rejected'));

grant select on public.events to authenticated;
grant update (status, status_reason, reviewed_at, reviewed_by) on public.events to authenticated;
