-- Multi-platform live streams: one broadcast can be watched on the website
-- and on YouTube, Facebook, Instagram, TikTok and other apps.

alter table public.streams drop constraint if exists streams_source_check;
alter table public.streams add constraint streams_source_check
  check (source in ('browser','rtmp','youtube','facebook'));

alter table public.streams
  add column if not exists facebook_url text,
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  -- any other platform: [{ "label": "Twitch", "url": "https://..." }]
  add column if not exists extra_links jsonb not null default '[]'::jsonb;

-- New social setting keys (existing rows keep their values).
update public.site_settings
   set value = jsonb_build_object('whatsapp_channel', '', 'telegram', '') || value
 where key = 'social';
