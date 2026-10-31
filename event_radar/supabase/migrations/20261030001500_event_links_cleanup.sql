alter table public.events
  drop constraint if exists events_replaced_by_fkey,
  drop constraint if exists events_updates_id_fkey;

alter table public.events
  add constraint events_replaced_by_fkey
    foreign key (replaced_by) references public.events(id) on delete set null,
  add constraint events_updates_id_fkey
    foreign key (updates_id) references public.events(id) on delete set null;

