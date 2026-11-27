-- =====================================================================
-- Public content: settings, leadership, ministries, events, sermons/media,
-- resources, devotionals, FAQs, testimonials
-- =====================================================================

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.media_kind as enum ('video_sermon', 'audio_sermon', 'podcast', 'bible_teaching', 'worship', 'conference');
create type public.review_status as enum ('pending', 'approved', 'rejected');

-- ---------- site_settings (editable website content, e.g. senior_pastor, church_profile) ----------
create table public.site_settings (
  key text primary key check (key ~ '^[a-z_]{2,40}$'),
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);
create or replace function public.set_updated_by()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_by = auth.uid(); new.updated_at = now(); return new; end $$;
create trigger site_settings_by before insert or update on public.site_settings for each row execute function public.set_updated_by();
create trigger audit_site_settings after insert or update or delete on public.site_settings for each row execute function public.audit_trigger();

-- ---------- leaders (Leadership page) ----------
create table public.leaders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  title text not null,
  bio text,
  photo_url text,
  email text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger leaders_updated before update on public.leaders for each row execute function public.set_updated_at();
create trigger audit_leaders after insert or update or delete on public.leaders for each row execute function public.audit_trigger();

-- ---------- ministries ----------
create table public.ministries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  summary text,
  description text,
  audience text,
  meeting_info text,
  image_url text,
  contact_email text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger ministries_updated before update on public.ministries for each row execute function public.set_updated_at();
create trigger audit_ministries after insert or update or delete on public.ministries for each row execute function public.audit_trigger();

create table public.ministry_leaders (
  id uuid primary key default gen_random_uuid(),
  ministry_id uuid not null references public.ministries (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  title text not null default 'Ministry Leader',
  bio text,
  photo_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index ministry_leaders_ministry_idx on public.ministry_leaders (ministry_id);
create index ministry_leaders_user_idx on public.ministry_leaders (user_id);

-- true when the current user is a listed leader of the ministry
create or replace function public.leads_ministry(_ministry_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select _ministry_id is not null and exists (
    select 1 from public.ministry_leaders where ministry_id = _ministry_id and user_id = auth.uid()
  ) and public.has_any_role(array['ministry_leader']::public.app_role[])
$$;

create table public.ministry_members (
  id uuid primary key default gen_random_uuid(),
  ministry_id uuid not null references public.ministries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'interested' check (status in ('interested', 'active', 'inactive')),
  created_at timestamptz not null default now(),
  unique (ministry_id, user_id)
);

-- ---------- events ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text,
  location text,
  online_url text,
  image_url text,
  ministry_id uuid references public.ministries (id) on delete set null,
  registration_required boolean not null default false,
  capacity int check (capacity is null or capacity > 0),
  is_recurring boolean not null default false,
  recurrence_rule text, -- iCalendar RRULE, e.g. FREQ=WEEKLY;BYDAY=SU
  reminder_hours_before int[] not null default '{24}',
  status public.content_status not null default 'draft',
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create index events_starts_idx on public.events (starts_at);
create trigger events_updated before update on public.events for each row execute function public.set_updated_at();
create trigger audit_events after insert or update or delete on public.events for each row execute function public.audit_trigger();

create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create type public.registration_status as enum ('registered', 'waitlisted', 'cancelled', 'attended');
create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  party_size int not null default 1 check (party_size between 1 and 20),
  status public.registration_status not null default 'registered',
  notes text,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
create index event_registrations_event_idx on public.event_registrations (event_id);

-- registration rules: event must be published and accept registration; overflow goes to waitlist
create or replace function public.enforce_event_registration()
returns trigger language plpgsql security definer set search_path = public as $$
declare ev public.events; taken int;
begin
  select * into ev from public.events where id = new.event_id;
  if ev.id is null or ev.status <> 'published' or not ev.registration_required then
    raise exception 'This event is not open for registration';
  end if;
  if not public.is_ministry_staff() then
    new.status := 'registered'; new.checked_in_at := null;  -- members cannot self check-in
  end if;
  if ev.capacity is not null and new.status = 'registered' then
    select coalesce(sum(party_size), 0) into taken from public.event_registrations
      where event_id = new.event_id and status in ('registered', 'attended');
    if taken + new.party_size > ev.capacity then new.status := 'waitlisted'; end if;
  end if;
  return new;
end $$;
create trigger event_registrations_rules before insert on public.event_registrations
  for each row execute function public.enforce_event_registration();

-- ---------- sermons and media library ----------
create table public.sermons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  kind public.media_kind not null default 'video_sermon',
  speaker text,
  speaker_leader_id uuid references public.leaders (id) on delete set null,
  scripture_reference text,
  description text,
  series text,
  category text,
  tags text[] not null default '{}',
  video_url text,
  audio_url text,
  thumbnail_url text,
  notes_url text,
  preached_on timestamptz,
  duration_minutes int check (duration_minutes is null or duration_minutes > 0),
  is_featured boolean not null default false,
  status public.content_status not null default 'draft',
  search tsvector generated always as (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(speaker,'') || ' ' || coalesce(scripture_reference,'') || ' ' || coalesce(series,'') || ' ' || coalesce(description,''))
  ) stored,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sermons_search_idx on public.sermons using gin (search);
create index sermons_preached_idx on public.sermons (preached_on desc);
create trigger sermons_updated before update on public.sermons for each row execute function public.set_updated_at();
create trigger audit_sermons after insert or update or delete on public.sermons for each row execute function public.audit_trigger();

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  bucket text not null,
  storage_path text not null,
  public_url text,
  mime_type text,
  size_bytes bigint,
  sermon_id uuid references public.sermons (id) on delete set null,
  status public.content_status not null default 'draft',
  uploaded_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (bucket, storage_path)
);
create trigger audit_media_assets after insert or update or delete on public.media_assets for each row execute function public.audit_trigger();

create table public.saved_sermons (
  user_id uuid not null references auth.users (id) on delete cascade,
  sermon_id uuid not null references public.sermons (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, sermon_id)
);

-- ---------- resources, devotionals, FAQs ----------
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  file_url text,       -- public bucket file
  storage_path text,   -- members-only file in the private member-resources bucket
  external_url text,
  ministry_id uuid references public.ministries (id) on delete set null,
  is_members_only boolean not null default false,
  is_published boolean not null default false,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.devotionals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  scripture_reference text,
  scripture_text text,
  scripture_translation text default 'KJV',
  body text not null,
  author text,
  publish_on date not null default current_date,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- testimonials (moderated) ----------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references auth.users (id) on delete set null,
  author_name text not null check (char_length(author_name) <= 120),
  email text,
  location text,
  title text check (char_length(title) <= 200),
  body text not null check (char_length(body) between 1 and 5000),
  consent_to_publish boolean not null default false,
  status public.review_status not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create trigger audit_testimonials after update or delete on public.testimonials for each row execute function public.audit_trigger();

-- Public read model: approved testimonials without private columns (email, submitter).
create view public.published_testimonials with (security_barrier = true) as
  select id, author_name, location, title, body, created_at
  from public.testimonials where status = 'approved' and consent_to_publish;

-- ---------- RLS ----------
alter table public.site_settings enable row level security;
alter table public.leaders enable row level security;
alter table public.ministries enable row level security;
alter table public.ministry_leaders enable row level security;
alter table public.ministry_members enable row level security;
alter table public.events enable row level security;
alter table public.event_photos enable row level security;
alter table public.event_registrations enable row level security;
alter table public.sermons enable row level security;
alter table public.media_assets enable row level security;
alter table public.saved_sermons enable row level security;
alter table public.resources enable row level security;
alter table public.devotionals enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;

-- site settings: public read, admins write
create policy "site_settings: public read" on public.site_settings for select to anon, authenticated using (true);
create policy "site_settings: admins write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- leaders
create policy "leaders: public read published" on public.leaders for select to anon, authenticated using (is_published or public.is_content_editor());
create policy "leaders: editors write" on public.leaders for all to authenticated using (public.is_content_editor()) with check (public.is_content_editor());

-- ministries
create policy "ministries: public read active" on public.ministries for select to anon, authenticated using (is_active or public.is_ministry_staff());
create policy "ministries: pastoral insert" on public.ministries for insert to authenticated with check (public.is_pastoral());
create policy "ministries: pastoral or own leader update" on public.ministries for update to authenticated using (public.is_pastoral() or public.leads_ministry(id)) with check (public.is_pastoral() or public.leads_ministry(id));
create policy "ministries: admins delete" on public.ministries for delete to authenticated using (public.is_admin());

create policy "ministry_leaders: public read" on public.ministry_leaders for select to anon, authenticated using (true);
create policy "ministry_leaders: pastoral write" on public.ministry_leaders for all to authenticated using (public.is_pastoral()) with check (public.is_pastoral());

create policy "ministry_members: read own or leaders" on public.ministry_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_pastoral() or public.leads_ministry(ministry_id));
create policy "ministry_members: join self" on public.ministry_members for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'interested');
create policy "ministry_members: leaders update" on public.ministry_members for update to authenticated
  using (public.is_pastoral() or public.leads_ministry(ministry_id)) with check (public.is_pastoral() or public.leads_ministry(ministry_id));
create policy "ministry_members: leave self or leaders remove" on public.ministry_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_pastoral() or public.leads_ministry(ministry_id));

-- events
create policy "events: public read published" on public.events for select to anon, authenticated
  using (status = 'published' or public.is_ministry_staff());
create policy "events: staff insert" on public.events for insert to authenticated
  with check (public.is_pastoral() or public.leads_ministry(ministry_id));
create policy "events: staff update" on public.events for update to authenticated
  using (public.is_pastoral() or public.leads_ministry(ministry_id)) with check (public.is_pastoral() or public.leads_ministry(ministry_id));
create policy "events: pastoral delete" on public.events for delete to authenticated using (public.is_pastoral());

create policy "event_photos: public read" on public.event_photos for select to anon, authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.status = 'published') or public.is_ministry_staff());
create policy "event_photos: staff write" on public.event_photos for all to authenticated
  using (public.is_pastoral() or public.is_media()) with check (public.is_pastoral() or public.is_media());

create policy "event_registrations: read own or staff" on public.event_registrations for select to authenticated
  using (user_id = (select auth.uid()) or public.is_pastoral()
         or public.leads_ministry((select ministry_id from public.events e where e.id = event_id)));
create policy "event_registrations: register self" on public.event_registrations for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "event_registrations: cancel own" on public.event_registrations for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and status = 'cancelled' and checked_in_at is null);
create policy "event_registrations: staff manage" on public.event_registrations for update to authenticated
  using (public.is_pastoral() or public.leads_ministry((select ministry_id from public.events e where e.id = event_id)))
  with check (public.is_pastoral() or public.leads_ministry((select ministry_id from public.events e where e.id = event_id)));
create policy "event_registrations: staff delete" on public.event_registrations for delete to authenticated using (public.is_pastoral());

-- sermons and media
create policy "sermons: public read published" on public.sermons for select to anon, authenticated using (status = 'published' or public.is_sermon_editor());
create policy "sermons: editors insert" on public.sermons for insert to authenticated with check (public.is_sermon_editor());
create policy "sermons: editors update" on public.sermons for update to authenticated using (public.is_sermon_editor()) with check (public.is_sermon_editor());
create policy "sermons: media or admin delete" on public.sermons for delete to authenticated using (public.is_media());

create policy "media_assets: media team read" on public.media_assets for select to authenticated using (public.is_sermon_editor());
create policy "media_assets: media team write" on public.media_assets for all to authenticated using (public.is_media()) with check (public.is_media());

create policy "saved_sermons: own" on public.saved_sermons for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- resources: members-only rows need a signed-in user
create policy "resources: read published" on public.resources for select to anon, authenticated
  using ((is_published and (not is_members_only or (select auth.uid()) is not null)) or public.is_pastoral() or public.is_media());
create policy "resources: editors write" on public.resources for all to authenticated
  using (public.is_pastoral() or public.is_media() or public.leads_ministry(ministry_id))
  with check (public.is_pastoral() or public.is_media() or public.leads_ministry(ministry_id));

create policy "devotionals: read published" on public.devotionals for select to anon, authenticated
  using ((status = 'published' and publish_on <= current_date) or public.is_pastoral());
create policy "devotionals: pastoral write" on public.devotionals for all to authenticated using (public.is_pastoral()) with check (public.is_pastoral());

create policy "faqs: public read" on public.faqs for select to anon, authenticated using (is_published or public.is_admin());
create policy "faqs: admins write" on public.faqs for all to authenticated using (public.is_content_editor()) with check (public.is_content_editor());

-- testimonials: anyone may submit (pending only); submitters read their own; pastoral moderate
create policy "testimonials: submit" on public.testimonials for insert to anon, authenticated
  with check (status = 'pending' and consent_to_publish and reviewed_by is null
              and (submitted_by is null or submitted_by = (select auth.uid())));
create policy "testimonials: read own or moderators" on public.testimonials for select to authenticated
  using (submitted_by = (select auth.uid()) or public.is_content_editor() or public.is_pastoral());
create policy "testimonials: moderators update" on public.testimonials for update to authenticated
  using (public.is_pastoral()) with check (public.is_pastoral());
create policy "testimonials: moderators delete" on public.testimonials for delete to authenticated using (public.is_pastoral());

grant select on public.published_testimonials to anon, authenticated;
