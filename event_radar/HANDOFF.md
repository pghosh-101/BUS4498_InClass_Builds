# Club Event Radar Handoff for Akhil

## What works now

Website: https://pghosh-101.github.io/BUS4498_InClass_Builds/event_radar/

The site lists published campus events and lets visitors submit an announcement with an optional JPG or PNG flyer. The Supabase Edge Function `submit-event` uses the AI to build an event card, checks posting rules and duplicates, and sends posts with flyers to moderator review. Moderator sign-in, waiting-post review, flyer storage, and approve/reject actions are included in the current local files; upload the pending Stage 8 and Stage 9 files with GitHub Desktop to put the latest website code online.

## Where things live

- Repository: `BUS4498_InClass_Builds`, in the `event_radar` folder.
- Supabase project: `event-radar`.
- Project URL: https://vetrkxckhucemfbdguvj.supabase.co
- Website files: `event_radar/index.html`, `app.js`, `style.css`, and `config.js`.
- Database migrations: `event_radar/supabase/migrations/`.
- AI agent: `event_radar/supabase/functions/submit-event/index.ts`.
- Database table: `public.events`; flyer storage bucket: `flyers`.

## Secrets

The AI key name is `ANTHROPIC_API_KEY`, stored in Supabase → Edge Functions → Secrets. The function also uses the Supabase-managed secret key setting `SUPABASE_SECRET_KEYS` (with `SUPABASE_SERVICE_ROLE_KEY` as a compatibility fallback). Akhil does not need any secret values, database passwords, or private keys; do not add them to the repository.

## How to test

1. Post sample announcement A from `event_radar/test/sample-announcements.md`; it should be **Published** with the University Union details and free-food tag.
2. Post sample announcement C after A; it should say **Already posted** because the date, start time, and place match.
3. Send `event_radar/test/sample-flyer.png` with the flyer text; it should be **Waiting for a moderator**, show the Clothing Swap details, and save the flyer. Sign in as moderator, approve it, and confirm it appears on the website with the photo.

## What’s next

Upload the current Stage 8 and Stage 9 changes with GitHub Desktop, then test moderator sign-in and approve the flyer post. Possible later improvements are nightly cleanup of past events, stronger moderator authorization if more staff accounts are added, and clearer handling of flyers whose date text conflicts with the weekday.

## How we take turns

Before starting, download or pull the latest repository changes. When stopping, upload or push your changes with GitHub Desktop and tell the other person what you changed. Do not work on the same files at the same time without telling each other.
