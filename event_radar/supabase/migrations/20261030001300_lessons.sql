create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lesson text not null check (char_length(lesson) between 5 and 300),
  active boolean not null default true,
  created_by text not null default '',
  from_post uuid references public.events(id)
);

alter table public.lessons enable row level security;

revoke all on table public.lessons from public, anon, authenticated;
grant select, insert (lesson, created_by, from_post), update (active) on public.lessons to authenticated;
grant all on table public.lessons to service_role;

create policy "authenticated_can_read_lessons"
  on public.lessons
  for select
  to authenticated
  using (true);

create policy "authenticated_can_create_lessons"
  on public.lessons
  for insert
  to authenticated
  with check (true);

create policy "authenticated_can_toggle_lessons"
  on public.lessons
  for update
  to authenticated
  using (true)
  with check (true);

alter table public.events
  add column if not exists lessons_used text[] not null default '{}';

