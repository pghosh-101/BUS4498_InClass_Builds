-- Stage 14: read GroupMe messages and send them through submit-event.
alter table public.events
  add column if not exists source text not null default '',
  add column if not exists source_id text not null default '',
  add column if not exists source_name text not null default '';

create unique index if not exists events_one_per_message
  on public.events (source, source_id)
  where source_id <> '';

create table if not exists public.channel_cursor (
  source text primary key,
  last_id text not null default '',
  read_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.channel_cursor enable row level security;
revoke all on public.channel_cursor from anon, authenticated;
grant all on public.channel_cursor to service_role;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

do $$
declare
  old_job_id bigint;
begin
  select jobid into old_job_id from cron.job where jobname = 'read-chat-channel';
  if old_job_id is not null then
    perform cron.unschedule(old_job_id);
  end if;
  perform cron.schedule(
    'read-chat-channel',
    '* * * * *',
    $job$
      select net.http_post(
        url := 'https://vetrkxckhucemfbdguvj.supabase.co/functions/v1/read-channel',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'apikey', 'sb_publishable_DqNTIGDyEv-nayRA4USmcw_UVhuZVNM'
        ),
        body := '{}'::jsonb
      );
    $job$
  );
end $$;
