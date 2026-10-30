-- Stage 11: the editable club list and the agent's lookup notes.
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  nicknames text not null default '',
  usual_place_code text not null default '',
  usual_place_detail text not null default '',
  active boolean not null default true,
  note text not null default ''
);

alter table public.clubs enable row level security;
revoke all on public.clubs from anon, authenticated;
grant select (id, name, nicknames, active) on public.clubs to anon, authenticated;
grant all on public.clubs to service_role;

create policy "visitors can read active clubs"
  on public.clubs for select
  to anon, authenticated
  using (active);

alter table public.events
  add column if not exists agent_notes text[] not null default '{}';

create policy "authenticated users can delete events"
  on public.events for delete
  to authenticated
  using (true);

grant delete on public.events to authenticated;

insert into public.clubs (name, nicknames, usual_place_code, usual_place_detail, active, note)
values
  ('Board Game Guild', 'BGG, board game club', 'UU', 'Room 220', true, ''),
  ('Mustang Pitch Society', 'MPS, pitch society', 'UU-PLAZA', '', true, ''),
  ('Women in Finance Circle', 'WIF, women in finance', 'BUSINESS', '', true, ''),
  ('Sustainability Crew', 'SC, sustainability club', 'DEXTER-LAWN', '', true, ''),
  ('Accounting Society', 'AS, accounting club', 'BUSINESS', 'Room 212', true, ''),
  ('Cal Poly Ski & Snowboard Club', 'Ski Club, snowboard club', 'MOTT', '', true, '')
on conflict (name) do nothing;
