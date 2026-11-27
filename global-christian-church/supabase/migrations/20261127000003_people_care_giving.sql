-- =====================================================================
-- People (members, visitors, volunteers), prayer and pastoral care, giving
-- =====================================================================

create type public.application_status as enum ('pending', 'approved', 'declined', 'withdrawn');
create type public.prayer_status as enum ('new', 'praying', 'follow_up', 'answered', 'closed');
create type public.prayer_visibility as enum ('private', 'public');
create type public.care_type as enum ('counseling', 'appointment', 'follow_up', 'hospital_visit');
create type public.care_status as enum ('new', 'assigned', 'scheduled', 'completed', 'closed');
create type public.giving_category as enum ('tithe', 'offering', 'missions', 'building_fund', 'benevolence', 'special_projects');
create type public.payment_provider as enum ('stripe', 'paypal');
create type public.donation_status as enum ('pending', 'succeeded', 'failed', 'refunded', 'cancelled');
create type public.gift_frequency as enum ('once', 'weekly', 'monthly', 'yearly');

-- ---------- membership ----------
create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  date_of_birth date,
  address text,
  city text,
  country text,
  marital_status text,
  is_baptized boolean not null default false,
  salvation_testimony text check (char_length(salvation_testimony) <= 4000),
  ministry_interests text[] not null default '{}',
  consent_given boolean not null,
  status public.application_status not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger membership_applications_updated before update on public.membership_applications for each row execute function public.set_updated_at();
create trigger audit_membership_applications after update or delete on public.membership_applications for each row execute function public.audit_trigger('nodata');

create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  membership_number text unique,
  joined_on date not null default current_date,
  status text not null default 'active' check (status in ('active', 'inactive', 'transferred', 'deceased')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger members_updated before update on public.members for each row execute function public.set_updated_at();
create trigger audit_members after insert or update or delete on public.members for each row execute function public.audit_trigger('nodata');

-- approving an application creates the member record
create or replace function public.on_membership_approved()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    new.reviewed_by := auth.uid(); new.reviewed_at := now();
    insert into public.members (user_id) values (new.user_id) on conflict (user_id) do update set status = 'active';
  end if;
  return new;
end $$;
create trigger membership_approved before update on public.membership_applications for each row execute function public.on_membership_approved();

-- ---------- visitors ----------
create table public.visitor_cards (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  planned_visit_date date,
  attending text not null default 'in_person' check (attending in ('in_person', 'online')),
  party_size int not null default 1 check (party_size between 1 and 30),
  has_children boolean not null default false,
  how_heard text,
  notes text check (char_length(notes) <= 2000),
  consent_given boolean not null,
  follow_up_status text not null default 'new' check (follow_up_status in ('new', 'contacted', 'visited', 'closed')),
  assigned_to uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- volunteers ----------
create table public.volunteer_opportunities (
  id uuid primary key default gen_random_uuid(),
  ministry_id uuid references public.ministries (id) on delete cascade,
  title text not null,
  description text,
  schedule text,
  slots int check (slots is null or slots > 0),
  requires_background_check boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  opportunity_id uuid references public.volunteer_opportunities (id) on delete set null,
  ministry_slug text,
  full_name text not null,
  email text not null,
  phone text,
  areas text[] not null default '{}',
  availability text[] not null default '{}',
  skills text,
  experience text check (char_length(experience) <= 4000),
  consent_given boolean not null,
  status public.application_status not null default 'pending',
  background_check_status text not null default 'not_required' check (background_check_status in ('not_required', 'pending', 'cleared', 'failed')),
  created_at timestamptz not null default now()
);

-- ---------- prayer ----------
create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users (id) on delete set null,
  name text check (char_length(name) <= 120),
  email text,
  phone text,
  category text not null default 'general',
  request text not null check (char_length(request) between 1 and 4000),
  visibility public.prayer_visibility not null default 'private',
  is_anonymous boolean not null default false,
  wants_follow_up boolean not null default false,
  consent_given boolean not null,
  status public.prayer_status not null default 'new',
  approved_for_wall boolean not null default false,
  assigned_to uuid references auth.users (id) on delete set null,
  prayer_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prayer_requests_status_idx on public.prayer_requests (status, created_at desc);
create trigger prayer_requests_updated before update on public.prayer_requests for each row execute function public.set_updated_at();
create trigger audit_prayer_requests after update or delete on public.prayer_requests for each row execute function public.audit_trigger('nodata');

create table public.prayer_notes (
  id uuid primary key default gen_random_uuid(),
  prayer_request_id uuid not null references public.prayer_requests (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  note text not null,
  created_at timestamptz not null default now()
);

-- Public prayer wall: only approved public requests, first name only, never contact details.
create view public.prayer_wall with (security_barrier = true) as
  select id,
         case when is_anonymous or name is null then 'Anonymous' else split_part(name, ' ', 1) end as display_name,
         category, request, created_at, prayer_count
  from public.prayer_requests
  where visibility = 'public' and approved_for_wall and status <> 'closed';
grant select on public.prayer_wall to anon, authenticated;

-- ---------- pastoral care ----------
create table public.pastoral_care_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  request_type public.care_type not null default 'counseling',
  preferred_times text,
  details text check (char_length(details) <= 4000),
  consent_given boolean not null,
  status public.care_status not null default 'new',
  assigned_to uuid references auth.users (id) on delete set null,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger pastoral_care_updated before update on public.pastoral_care_requests for each row execute function public.set_updated_at();
create trigger audit_pastoral_care after update or delete on public.pastoral_care_requests for each row execute function public.audit_trigger('nodata');

-- ---------- contact messages ----------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  topic text not null default 'general',
  message text not null check (char_length(message) between 1 and 5000),
  consent_given boolean not null,
  status text not null default 'new' check (status in ('new', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

-- ---------- giving ----------
create table public.giving_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text,
  category public.giving_category not null default 'special_projects',
  goal_amount_cents bigint check (goal_amount_cents is null or goal_amount_cents > 0),
  image_url text,
  starts_on date,
  ends_on date,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
create trigger audit_giving_campaigns after insert or update or delete on public.giving_campaigns for each row execute function public.audit_trigger();

-- Donations are written ONLY by Edge Functions (service role) after Stripe/PayPal confirm payment.
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references auth.users (id) on delete set null,
  donor_name text,
  donor_email text,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
  category public.giving_category not null,
  campaign_id uuid references public.giving_campaigns (id) on delete set null,
  frequency public.gift_frequency not null default 'once',
  recurring_gift_id uuid,
  provider public.payment_provider not null,
  provider_payment_id text not null,
  status public.donation_status not null default 'pending',
  is_test boolean not null default true,   -- sandbox until live payments are approved
  receipt_number text unique,
  receipt_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);
create index donations_donor_idx on public.donations (donor_id, created_at desc);
create trigger audit_donations after update or delete on public.donations for each row execute function public.audit_trigger();

create table public.recurring_gifts (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references auth.users (id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'usd',
  category public.giving_category not null,
  campaign_id uuid references public.giving_campaigns (id) on delete set null,
  frequency public.gift_frequency not null check (frequency <> 'once'),
  provider public.payment_provider not null,
  provider_subscription_id text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled', 'past_due')),
  is_test boolean not null default true,
  next_charge_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);
alter table public.donations add constraint donations_recurring_fk foreign key (recurring_gift_id) references public.recurring_gifts (id) on delete set null;

-- campaign totals for public progress bars (no donor data exposed)
create view public.campaign_totals with (security_barrier = true) as
  select c.id as campaign_id, coalesce(sum(d.amount_cents) filter (where d.status = 'succeeded' and not d.is_test), 0)::bigint as raised_cents
  from public.giving_campaigns c left join public.donations d on d.campaign_id = c.id
  where c.is_active group by c.id;
grant select on public.campaign_totals to anon, authenticated;

-- ---------- RLS ----------
alter table public.membership_applications enable row level security;
alter table public.members enable row level security;
alter table public.visitor_cards enable row level security;
alter table public.volunteer_opportunities enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.prayer_notes enable row level security;
alter table public.pastoral_care_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.giving_campaigns enable row level security;
alter table public.donations enable row level security;
alter table public.recurring_gifts enable row level security;

-- membership
create policy "membership_applications: apply self" on public.membership_applications for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending' and consent_given and reviewed_by is null);
create policy "membership_applications: read own or pastoral" on public.membership_applications for select to authenticated
  using (user_id = (select auth.uid()) or public.is_pastoral());
create policy "membership_applications: pastoral review" on public.membership_applications for update to authenticated
  using (public.is_pastoral()) with check (public.is_pastoral());

create policy "members: read own or pastoral" on public.members for select to authenticated using (user_id = (select auth.uid()) or public.is_pastoral());
create policy "members: pastoral write" on public.members for all to authenticated using (public.is_pastoral()) with check (public.is_pastoral());

-- visitors: anyone submits; pastoral team reads
create policy "visitor_cards: submit" on public.visitor_cards for insert to anon, authenticated
  with check (consent_given and follow_up_status = 'new' and assigned_to is null);
create policy "visitor_cards: pastoral read" on public.visitor_cards for select to authenticated using (public.is_pastoral());
create policy "visitor_cards: pastoral update" on public.visitor_cards for update to authenticated using (public.is_pastoral()) with check (public.is_pastoral());
create policy "visitor_cards: admins delete" on public.visitor_cards for delete to authenticated using (public.is_admin());

-- volunteers
create policy "volunteer_opportunities: public read" on public.volunteer_opportunities for select to anon, authenticated using (is_active or public.is_ministry_staff());
create policy "volunteer_opportunities: staff write" on public.volunteer_opportunities for all to authenticated
  using (public.is_pastoral() or public.leads_ministry(ministry_id)) with check (public.is_pastoral() or public.leads_ministry(ministry_id));

create policy "volunteer_applications: submit" on public.volunteer_applications for insert to anon, authenticated
  with check (consent_given and status = 'pending' and background_check_status = 'not_required'
              and (user_id is null or user_id = (select auth.uid())));
create policy "volunteer_applications: read own or staff" on public.volunteer_applications for select to authenticated
  using (user_id = (select auth.uid()) or public.is_ministry_staff());
create policy "volunteer_applications: staff update" on public.volunteer_applications for update to authenticated
  using (public.is_ministry_staff()) with check (public.is_ministry_staff());

-- prayer: strict. Anyone submits; requester reads own; prayer team and pastors read/manage.
create policy "prayer_requests: submit" on public.prayer_requests for insert to anon, authenticated
  with check (consent_given and status = 'new' and not approved_for_wall and assigned_to is null and prayer_count = 0
              and (requester_id is null or requester_id = (select auth.uid())));
create policy "prayer_requests: requester reads own" on public.prayer_requests for select to authenticated
  using (requester_id = (select auth.uid()));
create policy "prayer_requests: prayer team reads" on public.prayer_requests for select to authenticated using (public.is_prayer_team());
create policy "prayer_requests: prayer team updates" on public.prayer_requests for update to authenticated
  using (public.is_prayer_team()) with check (public.is_prayer_team());
create policy "prayer_requests: admins delete" on public.prayer_requests for delete to authenticated using (public.is_admin());

create policy "prayer_notes: prayer team only" on public.prayer_notes for all to authenticated
  using (public.is_prayer_team()) with check (public.is_prayer_team() and author_id = (select auth.uid()));

-- pastoral care: pastors and administrators only (not the wider prayer team)
create policy "pastoral_care: submit" on public.pastoral_care_requests for insert to anon, authenticated
  with check (consent_given and status = 'new' and assigned_to is null and scheduled_for is null
              and (requester_id is null or requester_id = (select auth.uid())));
create policy "pastoral_care: requester reads own" on public.pastoral_care_requests for select to authenticated
  using (requester_id = (select auth.uid()));
create policy "pastoral_care: pastoral reads" on public.pastoral_care_requests for select to authenticated using (public.is_pastoral());
create policy "pastoral_care: pastoral updates" on public.pastoral_care_requests for update to authenticated
  using (public.is_pastoral()) with check (public.is_pastoral());

-- contact messages
create policy "contact_messages: submit" on public.contact_messages for insert to anon, authenticated with check (consent_given and status = 'new');
create policy "contact_messages: staff read" on public.contact_messages for select to authenticated using (public.is_pastoral());
create policy "contact_messages: staff update" on public.contact_messages for update to authenticated using (public.is_pastoral()) with check (public.is_pastoral());

-- giving
create policy "giving_campaigns: public read active" on public.giving_campaigns for select to anon, authenticated using (is_active or public.is_finance());
create policy "giving_campaigns: finance write" on public.giving_campaigns for all to authenticated using (public.is_finance()) with check (public.is_finance());

-- donations/recurring gifts: read-only from the browser; writes come from Edge Functions (service role bypasses RLS)
create policy "donations: donor reads own" on public.donations for select to authenticated using (donor_id = (select auth.uid()));
create policy "donations: finance reads" on public.donations for select to authenticated using (public.is_finance());
create policy "recurring_gifts: donor reads own" on public.recurring_gifts for select to authenticated using (donor_id = (select auth.uid()));
create policy "recurring_gifts: finance reads" on public.recurring_gifts for select to authenticated using (public.is_finance());
