alter table public.events
  drop constraint if exists events_status_check;

alter table public.events
  add constraint events_status_check
  check (status in ('published', 'waiting', 'rejected', 'archived', 'replaced'));

alter table public.events
  add column if not exists replaced_by uuid references public.events(id),
  add column if not exists updates_id uuid references public.events(id);

drop policy if exists "authenticated_can_review_events" on public.events;

create policy "authenticated_can_review_events"
  on public.events
  for update
  to authenticated
  using (true)
  with check (status in ('published', 'waiting', 'rejected', 'replaced'));

