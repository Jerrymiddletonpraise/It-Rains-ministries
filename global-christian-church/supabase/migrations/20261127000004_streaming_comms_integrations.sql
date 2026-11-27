-- =====================================================================
-- Live streaming, live chat, communications, notifications, integrations
-- =====================================================================
-- Stream keys, RTMP credentials and OAuth tokens are NEVER stored here.
-- They belong in Supabase Edge Function secrets (or Supabase Vault) and are
-- only read by server-side functions.
-- =====================================================================

create type public.broadcast_status as enum ('scheduled', 'live', 'ended', 'cancelled');
create type public.stream_provider as enum ('restream', 'youtube', 'facebook', 'instagram', 'tiktok', 'twitch', 'custom_rtmp');
create type public.integration_status as enum ('awaiting_configuration', 'configured_untested', 'connected', 'error', 'disabled');

-- ---------- broadcasts ----------
create table public.broadcast_schedules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  status public.broadcast_status not null default 'scheduled',
  embed_url text,                -- public player URL (Restream player, YouTube, Facebook)
  scripture_reference text,
  scripture_text text,
  recording_status text not null default 'not_recording' check (recording_status in ('not_recording', 'recording', 'processing', 'available', 'failed')),
  recording_sermon_id uuid references public.sermons (id) on delete set null,
  chat_enabled boolean not null default true,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index broadcast_schedules_start_idx on public.broadcast_schedules (scheduled_start);
create trigger broadcast_schedules_updated before update on public.broadcast_schedules for each row execute function public.set_updated_at();
create trigger audit_broadcast_schedules after insert or update or delete on public.broadcast_schedules for each row execute function public.audit_trigger();

-- ---------- streaming destinations (non-secret metadata only) ----------
create table public.streaming_destinations (
  id uuid primary key default gen_random_uuid(),
  provider public.stream_provider not null,
  display_name text not null,
  channel_url text,               -- public watch URL shown to viewers
  status public.integration_status not null default 'awaiting_configuration',
  is_enabled boolean not null default false,
  requires_manual_authorization boolean not null default true,
  secret_name text,               -- NAME of the Edge Function secret holding the key, never the key itself
  public_config jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (secret_name is null or secret_name ~ '^[A-Z][A-Z0-9_]{2,63}$')
);
create trigger streaming_destinations_updated before update on public.streaming_destinations for each row execute function public.set_updated_at();
create trigger audit_streaming_destinations after insert or update or delete on public.streaming_destinations for each row execute function public.audit_trigger();

create table public.stream_health_events (
  id bigint generated always as identity primary key,
  broadcast_id uuid references public.broadcast_schedules (id) on delete cascade,
  destination_id uuid references public.streaming_destinations (id) on delete cascade,
  source text not null,           -- e.g. 'restream_webhook'
  status text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- live chat (moderated) ----------
create table public.live_chat_messages (
  id uuid primary key default gen_random_uuid(),
  broadcast_id uuid not null references public.broadcast_schedules (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  display_name text not null check (char_length(display_name) between 1 and 60),
  body text not null check (char_length(body) between 1 and 500),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'flagged')),
  moderated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index live_chat_broadcast_idx on public.live_chat_messages (broadcast_id, created_at);

create table public.chat_bans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  reason text,
  banned_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

-- ---------- communications ----------
create table public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  full_name text,
  consent_given boolean not null check (consent_given),
  consent_at timestamptz not null default now(),
  source text,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed', 'bounced')),
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create unique index newsletter_email_unique on public.newsletter_subscriptions (lower(email));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,  -- null = all signed-in members
  title text not null,
  body text,
  link text,
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'sms', 'push', 'whatsapp')),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create table public.notification_reads (
  notification_id uuid not null references public.notifications (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

create table public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  email_opt_in boolean not null default false,
  sms_opt_in boolean not null default false,
  push_opt_in boolean not null default false,
  whatsapp_opt_in boolean not null default false,
  event_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table public.message_log (
  id bigint generated always as identity primary key,
  channel text not null check (channel in ('email', 'sms', 'push', 'whatsapp')),
  template text not null,          -- welcome, event_reminder, donation_receipt, ...
  recipient text not null,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped_no_consent', 'skipped_not_configured')),
  provider_message_id text,
  error text,
  created_at timestamptz not null default now()
);

-- ---------- integrations registry ----------
create table public.integration_settings (
  provider text primary key,
  label text not null,
  category text not null,
  status public.integration_status not null default 'awaiting_configuration',
  mode text not null default 'sandbox' check (mode in ('sandbox', 'live')),
  required_secrets text[] not null default '{}',
  setup_url text,
  live_approved_by uuid references auth.users (id) on delete set null,
  live_approved_at timestamptz,
  last_tested_at timestamptz,
  last_test_result text,
  public_config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  -- live mode can only be switched on after a successful test and an explicit approval
  check (mode = 'sandbox' or (status = 'connected' and live_approved_at is not null and live_approved_by is not null))
);
create trigger integration_settings_updated before update on public.integration_settings for each row execute function public.set_updated_at();
create trigger audit_integration_settings after insert or update or delete on public.integration_settings for each row execute function public.audit_trigger();

-- public read model so the website can show "awaiting configuration" honestly
create view public.public_integration_status with (security_barrier = true) as
  select provider, label, category, status, mode from public.integration_settings;
grant select on public.public_integration_status to anon, authenticated;

-- ---------- RLS ----------
alter table public.broadcast_schedules enable row level security;
alter table public.streaming_destinations enable row level security;
alter table public.stream_health_events enable row level security;
alter table public.live_chat_messages enable row level security;
alter table public.chat_bans enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_reads enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.message_log enable row level security;
alter table public.integration_settings enable row level security;

create policy "broadcasts: public read" on public.broadcast_schedules for select to anon, authenticated using (status <> 'cancelled' or public.is_media());
create policy "broadcasts: media write" on public.broadcast_schedules for all to authenticated using (public.is_media()) with check (public.is_media());

create policy "streaming_destinations: media only" on public.streaming_destinations for all to authenticated using (public.is_media()) with check (public.is_media());
create policy "stream_health: media read" on public.stream_health_events for select to authenticated using (public.is_media());

create policy "live_chat: read visible" on public.live_chat_messages for select to anon, authenticated
  using (status = 'visible' or public.is_media() or public.is_pastoral());
create policy "live_chat: members post" on public.live_chat_messages for insert to authenticated
  with check (
    user_id = (select auth.uid()) and status = 'visible' and moderated_by is null
    and not exists (select 1 from public.chat_bans b where b.user_id = (select auth.uid()))
    and exists (select 1 from public.broadcast_schedules b where b.id = broadcast_id and b.chat_enabled and b.status in ('scheduled', 'live'))
  );
create policy "live_chat: moderators update" on public.live_chat_messages for update to authenticated
  using (public.is_media() or public.is_pastoral()) with check (public.is_media() or public.is_pastoral());
create policy "live_chat: moderators delete" on public.live_chat_messages for delete to authenticated using (public.is_media() or public.is_pastoral());
create policy "chat_bans: moderators" on public.chat_bans for all to authenticated using (public.is_media() or public.is_pastoral()) with check (public.is_media() or public.is_pastoral());

create policy "newsletter: subscribe with consent" on public.newsletter_subscriptions for insert to anon, authenticated
  with check (consent_given and status = 'subscribed');
create policy "newsletter: admins read" on public.newsletter_subscriptions for select to authenticated using (public.is_content_editor());
create policy "newsletter: admins update" on public.newsletter_subscriptions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "newsletter: admins delete" on public.newsletter_subscriptions for delete to authenticated using (public.is_admin());

create policy "notifications: read own or broadcast" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()) or user_id is null or public.is_content_editor());
create policy "notifications: editors write" on public.notifications for all to authenticated using (public.is_content_editor()) with check (public.is_content_editor());
create policy "notification_reads: own" on public.notification_reads for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "notification_preferences: own" on public.notification_preferences for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "push_subscriptions: own" on public.push_subscriptions for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "message_log: admins read" on public.message_log for select to authenticated using (public.is_admin());

create policy "integration_settings: admins read" on public.integration_settings for select to authenticated using (public.is_admin() or public.is_media() or public.is_finance());
create policy "integration_settings: super admin approves" on public.integration_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- seed the integrations registry (all start as awaiting configuration) ----------
insert into public.integration_settings (provider, label, category, required_secrets, setup_url) values
  ('stripe',   'Stripe',               'giving',        '{STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET}', 'https://dashboard.stripe.com/test/apikeys'),
  ('paypal',   'PayPal',               'giving',        '{PAYPAL_CLIENT_ID,PAYPAL_CLIENT_SECRET,PAYPAL_WEBHOOK_ID}', 'https://developer.paypal.com/dashboard/applications/sandbox'),
  ('restream', 'Restream',             'streaming',     '{RESTREAM_CLIENT_ID,RESTREAM_CLIENT_SECRET}', 'https://developers.restream.io/'),
  ('youtube',  'YouTube Live',         'streaming',     '{}', 'https://studio.youtube.com/'),
  ('facebook', 'Facebook Live',        'streaming',     '{}', 'https://www.facebook.com/live/producer'),
  ('instagram','Instagram Live',       'streaming',     '{}', 'https://help.instagram.com/'),
  ('tiktok',   'TikTok LIVE',          'streaming',     '{}', 'https://www.tiktok.com/live/studio'),
  ('twitch',   'Twitch',               'streaming',     '{}', 'https://dashboard.twitch.tv/'),
  ('resend',   'Resend email',         'communication', '{RESEND_API_KEY,RESEND_FROM_EMAIL}', 'https://resend.com/api-keys'),
  ('twilio',   'Twilio SMS',           'communication', '{TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,TWILIO_FROM_NUMBER}', 'https://console.twilio.com/'),
  ('web_push', 'Web push',             'communication', '{VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY,VAPID_SUBJECT}', null),
  ('whatsapp', 'WhatsApp contact link','communication', '{}', null);
