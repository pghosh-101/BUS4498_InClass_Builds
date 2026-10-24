create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'archive-past-events',
  '0 10 * * *',
  $$
    update public.events
    set status = 'archived'
    where status in ('published', 'waiting')
      and event_date < (now() at time zone 'America/Los_Angeles')::date;
  $$
);
