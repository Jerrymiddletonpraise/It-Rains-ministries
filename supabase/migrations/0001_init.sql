-- IT RAINS MINISTRIES — core schema
-- Run with `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
create type public.app_role as enum (
  'super_admin', 'pastor', 'media_team', 'finance_team', 'department_leader', 'moderator'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  country text,
  city text,
  bio text,
  avatar_url text,
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- security definer so policies can call it without recursive RLS
create or replace function public.has_any_role(roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and (ur.role = any(roles) or ur.role = 'super_admin')
  );
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid());
$$;

-- new auth user -> profile row
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, newsletter_opt_in)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''),
          coalesce((new.raw_user_meta_data->>'newsletter_opt_in')::boolean, false));
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Site content (homepage, contact, socials, service times)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  summary text not null default '',
  description text not null default '',
  activities text[] not null default '{}',
  schedule text not null default '',
  leader_name text,
  contact_email text,
  contact_phone text,
  image_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger departments_touch before update on public.departments
for each row execute function public.touch_updated_at();

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  link_url text,
  published boolean not null default true,
  members_only boolean not null default false,
  pinned boolean not null default false,
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null default '',
  description text not null default '',
  category text not null default 'program',
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'UTC',
  location text,
  map_query text,
  is_online boolean not null default false,
  online_url text,
  capacity int check (capacity is null or capacity > 0),
  image_url text,
  registration_open boolean not null default true,
  published boolean not null default true,
  department_id uuid references public.departments(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index events_starts_idx on public.events(starts_at);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  guests int not null default 0 check (guests between 0 and 20),
  notes text,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','waitlist')),
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

-- enforce capacity atomically
create or replace function public.check_event_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare cap int; taken int; open boolean;
begin
  select capacity, registration_open into cap, open from public.events where id = new.event_id for update;
  if not open then raise exception 'Registration is closed for this event'; end if;
  if cap is not null then
    select coalesce(sum(1 + guests), 0) into taken from public.event_registrations
      where event_id = new.event_id and status = 'confirmed';
    if taken + 1 + new.guests > cap then raise exception 'This event is full'; end if;
  end if;
  return new;
end; $$;
create trigger event_capacity before insert on public.event_registrations
for each row execute function public.check_event_capacity();

create or replace function public.event_seats_taken(e uuid)
returns int language sql stable security definer set search_path = public as $$
  select coalesce(sum(1 + guests), 0)::int from public.event_registrations
  where event_id = e and status = 'confirmed';
$$;

-- ---------------------------------------------------------------------------
-- Sermons & media library
-- ---------------------------------------------------------------------------
create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  speaker text,
  category text not null default 'sunday_service' check (category in (
    'sunday_service','bible_study','prayer_meeting','revival','conference',
    'teaching','inspirational','audio','resource','live_replay')),
  media_type text not null default 'video' check (media_type in ('video','audio','document')),
  video_url text,          -- YouTube/Vimeo URL or storage URL (mp4)
  audio_url text,
  file_path text,          -- path in the 'media' storage bucket (downloads)
  thumbnail_url text,
  scripture text,
  preached_on date,
  duration_minutes int,
  featured boolean not null default false,
  published boolean not null default false,
  members_only boolean not null default false,
  views int not null default 0,
  stream_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index media_search_idx on public.media_items
  using gin (to_tsvector('english', title || ' ' || coalesce(description,'') || ' ' || coalesce(speaker,'') || ' ' || coalesce(scripture,'')));

create or replace function public.increment_media_views(m uuid)
returns void language sql security definer set search_path = public as $$
  update public.media_items set views = views + 1 where id = m and published;
$$;

-- ---------------------------------------------------------------------------
-- Prayer requests & testimonies
-- ---------------------------------------------------------------------------
create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  country text,
  request text not null,
  kind text not null default 'prayer' check (kind in ('prayer','urgent','counseling','followup')),
  wants_followup boolean not null default false,
  is_private boolean not null default true,
  source text not null default 'web' check (source in ('web','live')),
  stream_id uuid,
  status text not null default 'new' check (status in ('new','praying','responded','closed')),
  assigned_to uuid references auth.users(id),
  internal_notes text,
  response text,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.testimonies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  location text,
  title text not null,
  body text not null,
  is_answered_prayer boolean not null default false,
  consent_to_publish boolean not null default false,
  show_name boolean not null default true,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Giving (rows written only by verified payment webhooks / captures)
-- ---------------------------------------------------------------------------
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  donor_name text,
  donor_email text,
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'usd',
  fund text not null check (fund in ('offering','tithe','special','projects','missions')),
  frequency text not null default 'one_time' check (frequency in ('one_time','monthly')),
  provider text not null check (provider in ('stripe','paypal')),
  provider_ref text not null,
  provider_subscription_id text,
  status text not null default 'succeeded' check (status in ('succeeded','refunded','failed')),
  note text,
  receipt_number text unique default ('IRM-' || to_char(now(),'YYYY') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  receipt_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_ref)
);
create index donations_user_idx on public.donations(user_id);

create table public.recurring_gifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  donor_email text,
  provider text not null default 'stripe',
  provider_subscription_id text unique not null,
  provider_customer_id text,
  amount_cents int not null,
  currency text not null,
  fund text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Communication
-- ---------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  unsubscribe_token uuid not null default gen_random_uuid(),
  subscribed boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  audience text not null default 'subscribers' check (audience in ('subscribers','members','all')),
  sent_count int not null default 0,
  sent_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'contact' check (kind in ('contact','greeting')),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new','read','replied')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Live streaming
-- ---------------------------------------------------------------------------
create table public.streams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled','live','paused','ended')),
  source text not null default 'browser' check (source in ('browser','rtmp','youtube')),
  room_name text unique not null default ('irm-' || substr(replace(gen_random_uuid()::text,'-',''),1,12)),
  youtube_url text,
  scheduled_for timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  record boolean not null default true,
  recording_url text,
  peak_viewers int not null default 0,
  chat_enabled boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- secrets kept apart: only media team / pastors can read
create table public.stream_secrets (
  stream_id uuid primary key references public.streams(id) on delete cascade,
  ingress_id text,
  rtmp_url text,
  stream_key text,
  egress_id text
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references public.streams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  body text not null check (char_length(body) between 1 and 500),
  kind text not null default 'chat' check (kind in ('chat','prayer','greeting','testimony','moderator')),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index chat_stream_idx on public.chat_messages(stream_id, created_at);

create table public.chat_bans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text,
  banned_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Groups (member portal)
-- ---------------------------------------------------------------------------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  department_id uuid references public.departments(id) on delete set null,
  meeting_info text,
  created_at timestamptz not null default now()
);
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create table public.group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- First-party analytics & rate limiting (service role only)
-- ---------------------------------------------------------------------------
create table public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  country text,
  device text,
  created_at timestamptz not null default now()
);
create index page_views_created_idx on public.page_views(created_at);

create table public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);
create index rate_limit_idx on public.rate_limit_hits(bucket, created_at);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.site_settings enable row level security;
alter table public.departments enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.media_items enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.testimonies enable row level security;
alter table public.donations enable row level security;
alter table public.recurring_gifts enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletters enable row level security;
alter table public.contact_messages enable row level security;
alter table public.streams enable row level security;
alter table public.stream_secrets enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_bans enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_posts enable row level security;
alter table public.page_views enable row level security;
alter table public.rate_limit_hits enable row level security;

-- profiles
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- roles: users see their own; super admin manages (has_any_role always admits super_admin)
create policy "roles read" on public.user_roles for select using (user_id = auth.uid() or public.has_any_role('{super_admin}'));
create policy "roles manage" on public.user_roles for all using (public.has_any_role('{super_admin}')) with check (public.has_any_role('{super_admin}'));

-- site settings
create policy "settings public read" on public.site_settings for select using (true);
create policy "settings manage" on public.site_settings for all using (public.has_any_role('{pastor}')) with check (public.has_any_role('{pastor}'));

-- departments
create policy "departments read" on public.departments for select using (published or public.is_staff());
create policy "departments manage" on public.departments for all
  using (public.has_any_role('{pastor,department_leader}')) with check (public.has_any_role('{pastor,department_leader}'));

-- announcements
create policy "announcements read" on public.announcements for select using (
  (published and (expires_at is null or expires_at > now()) and (not members_only or auth.uid() is not null)) or public.is_staff());
create policy "announcements manage" on public.announcements for all
  using (public.has_any_role('{pastor,department_leader}')) with check (public.has_any_role('{pastor,department_leader}'));

-- events
create policy "events read" on public.events for select using (published or public.is_staff());
create policy "events manage" on public.events for all
  using (public.has_any_role('{pastor,department_leader}')) with check (public.has_any_role('{pastor,department_leader}'));

-- registrations: anyone can register; users see their own; staff see all
create policy "registrations insert" on public.event_registrations for insert with check (user_id is null or user_id = auth.uid());
create policy "registrations read" on public.event_registrations for select using (user_id = auth.uid() or public.has_any_role('{pastor,department_leader}'));
create policy "registrations update" on public.event_registrations for update using (user_id = auth.uid() or public.has_any_role('{pastor,department_leader}'));
create policy "registrations delete" on public.event_registrations for delete using (public.has_any_role('{pastor,department_leader}'));

-- media
create policy "media read" on public.media_items for select using (
  (published and (not members_only or auth.uid() is not null)) or public.has_any_role('{pastor,media_team}'));
create policy "media manage" on public.media_items for all
  using (public.has_any_role('{pastor,media_team}')) with check (public.has_any_role('{pastor,media_team}'));

-- prayer requests: private by design
create policy "prayer insert" on public.prayer_requests for insert with check (user_id is null or user_id = auth.uid());
create policy "prayer read" on public.prayer_requests for select using (user_id = auth.uid() or public.has_any_role('{pastor,moderator}'));
create policy "prayer manage" on public.prayer_requests for update using (public.has_any_role('{pastor,moderator}'));
create policy "prayer delete" on public.prayer_requests for delete using (public.has_any_role('{pastor}'));

-- testimonies: published only when consented AND approved
create policy "testimony insert" on public.testimonies for insert with check ((user_id is null or user_id = auth.uid()) and status = 'pending');
create policy "testimony read" on public.testimonies for select using (
  (status = 'approved' and consent_to_publish) or user_id = auth.uid() or public.has_any_role('{pastor,moderator}'));
create policy "testimony manage" on public.testimonies for update using (public.has_any_role('{pastor,moderator}'));
create policy "testimony delete" on public.testimonies for delete using (public.has_any_role('{pastor}'));

-- donations: inserted by server (service role) only
create policy "donations read" on public.donations for select using (user_id = auth.uid() or public.has_any_role('{finance_team}'));
create policy "donations finance update" on public.donations for update using (public.has_any_role('{finance_team}'));
create policy "recurring read" on public.recurring_gifts for select using (user_id = auth.uid() or public.has_any_role('{finance_team}'));

-- newsletter (inserts go through the server)
create policy "subscribers staff" on public.newsletter_subscribers for select using (public.has_any_role('{pastor}'));
create policy "newsletters staff" on public.newsletters for all using (public.has_any_role('{pastor}')) with check (public.has_any_role('{pastor}'));

-- contact
create policy "contact staff read" on public.contact_messages for select using (public.has_any_role('{pastor,moderator}'));
create policy "contact staff update" on public.contact_messages for update using (public.has_any_role('{pastor,moderator}'));

-- streams
create policy "streams read" on public.streams for select using (true);
create policy "streams manage" on public.streams for all
  using (public.has_any_role('{pastor,media_team}')) with check (public.has_any_role('{pastor,media_team}'));
create policy "stream secrets" on public.stream_secrets for all
  using (public.has_any_role('{pastor,media_team}')) with check (public.has_any_role('{pastor,media_team}'));

-- chat: reads public (hidden ones only for moderators); writes via server for rate limiting
create policy "chat read" on public.chat_messages for select using (not hidden or public.has_any_role('{moderator,pastor,media_team}'));
create policy "chat moderate" on public.chat_messages for update using (public.has_any_role('{moderator,pastor,media_team}'));
create policy "chat delete" on public.chat_messages for delete using (public.has_any_role('{moderator,pastor,media_team}'));
create policy "bans manage" on public.chat_bans for all
  using (public.has_any_role('{moderator,pastor,media_team}')) with check (public.has_any_role('{moderator,pastor,media_team}'));

-- groups
create policy "groups read" on public.groups for select using (auth.uid() is not null);
create policy "groups manage" on public.groups for all
  using (public.has_any_role('{pastor,department_leader}')) with check (public.has_any_role('{pastor,department_leader}'));
create policy "group members read" on public.group_members for select using (auth.uid() is not null);
create policy "group join" on public.group_members for insert with check (user_id = auth.uid());
create policy "group leave" on public.group_members for delete using (user_id = auth.uid() or public.has_any_role('{pastor,department_leader}'));
create policy "group posts read" on public.group_posts for select using (
  exists (select 1 from public.group_members gm where gm.group_id = group_posts.group_id and gm.user_id = auth.uid()) or public.is_staff());
create policy "group posts write" on public.group_posts for insert with check (
  user_id = auth.uid() and exists (select 1 from public.group_members gm where gm.group_id = group_posts.group_id and gm.user_id = auth.uid()));
create policy "group posts delete" on public.group_posts for delete using (user_id = auth.uid() or public.has_any_role('{pastor,department_leader,moderator}'));

-- analytics readable by staff
create policy "page views staff" on public.page_views for select using (public.is_staff());

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.streams;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('public-assets', 'public-assets', true),   -- images, thumbnails, banners
  ('media', 'media', false),                  -- sermon files & downloadable resources (signed URLs)
  ('recordings', 'recordings', false)         -- live stream recordings written by LiveKit Egress
on conflict (id) do nothing;

create policy "public assets read" on storage.objects for select using (bucket_id = 'public-assets');
create policy "staff upload assets" on storage.objects for insert with check (
  bucket_id in ('public-assets','media') and public.is_staff());
create policy "staff update assets" on storage.objects for update using (
  bucket_id in ('public-assets','media') and public.is_staff());
create policy "staff delete assets" on storage.objects for delete using (
  bucket_id in ('public-assets','media','recordings') and public.has_any_role('{pastor,media_team}'));
create policy "staff read private media" on storage.objects for select using (
  bucket_id in ('media','recordings') and public.is_staff());

-- used by the payment webhook to attach gifts to member accounts (service role only)
create or replace function public.user_id_by_email(e text)
returns uuid language sql stable security definer set search_path = public, auth as $$
  select id from auth.users where lower(email) = lower(e) limit 1;
$$;
revoke execute on function public.user_id_by_email(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Web push notifications
-- ---------------------------------------------------------------------------
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "push staff count" on public.push_subscriptions for select using (public.is_staff());
