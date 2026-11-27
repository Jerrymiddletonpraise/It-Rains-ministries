-- =====================================================================
-- Global Christian Church: core identity, roles, helpers, audit log
-- =====================================================================
-- Security model
--  * Every table has Row Level Security enabled.
--  * Roles live in public.user_roles (never on profiles) so users cannot edit their own role.
--  * Role checks use SECURITY DEFINER helpers to avoid recursive RLS.
--  * Secrets (service-role key, Stripe/PayPal secrets, Restream/stream keys, Resend, Twilio)
--    are NEVER stored in tables. They live in Supabase Edge Function secrets.
-- =====================================================================

create type public.app_role as enum (
  'super_admin', 'church_admin', 'senior_pastor', 'pastor', 'ministry_leader',
  'media_team', 'finance_team', 'prayer_team', 'volunteer', 'member'
);

-- ---------- shared trigger: updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text check (char_length(full_name) <= 200),
  phone text check (char_length(phone) <= 40),
  avatar_url text,
  city text,
  country text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

-- ---------- user_roles ----------
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
create index user_roles_user_idx on public.user_roles (user_id);
-- second FK lets the API embed roles when listing profiles (profiles.id = auth.users.id)
alter table public.user_roles add constraint user_roles_profile_fk foreign key (user_id) references public.profiles (id) on delete cascade;

-- ---------- role helpers (SECURITY DEFINER: bypass RLS on user_roles, no recursion) ----------
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.has_any_role(_roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = any (_roles))
$$;

create or replace function public.is_super_admin() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin']::public.app_role[]) $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin','church_admin']::public.app_role[]) $$;
create or replace function public.is_pastoral() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin','church_admin','senior_pastor','pastor']::public.app_role[]) $$;
create or replace function public.is_content_editor() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin','church_admin','senior_pastor']::public.app_role[]) $$;
create or replace function public.is_media() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin','church_admin','media_team']::public.app_role[]) $$;
create or replace function public.is_sermon_editor() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin','church_admin','senior_pastor','pastor','media_team']::public.app_role[]) $$;
create or replace function public.is_finance() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin','church_admin','senior_pastor','finance_team']::public.app_role[]) $$;
create or replace function public.is_prayer_team() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin','church_admin','senior_pastor','pastor','prayer_team']::public.app_role[]) $$;
create or replace function public.is_ministry_staff() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin','church_admin','senior_pastor','pastor','ministry_leader']::public.app_role[]) $$;
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public as
$$ select public.has_any_role(array['super_admin','church_admin','senior_pastor','pastor','ministry_leader','media_team','finance_team','prayer_team']::public.app_role[]) $$;

-- ---------- new user bootstrap: profile + Registered Member role ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, marketing_consent)
  values (
    new.id, new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false)
  );
  insert into public.user_roles (user_id, role) values (new.id, 'member');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep profiles.email in sync when a user changes email
create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end $$;
create trigger on_auth_user_email_changed after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- ---------- guard: never remove the last Super Administrator ----------
create or replace function public.protect_last_super_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'super_admin'
     and (select count(*) from public.user_roles where role = 'super_admin') <= 1 then
    raise exception 'Cannot remove the last Super Administrator';
  end if;
  return old;
end $$;
create trigger user_roles_protect_last before delete on public.user_roles
  for each row execute function public.protect_last_super_admin();

-- record who granted a role
create or replace function public.set_granted_by()
returns trigger language plpgsql set search_path = public as $$
begin new.granted_by = coalesce(new.granted_by, auth.uid()); return new; end $$;
create trigger user_roles_granted_by before insert on public.user_roles
  for each row execute function public.set_granted_by();

-- ---------- audit log ----------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  action text not null,
  table_name text not null,
  record_id text,
  old_data jsonb,
  new_data jsonb
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- Trigger argument 'nodata' records the action without copying row contents
-- (used for confidential tables such as prayer and pastoral care requests).
create or replace function public.audit_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  include_data boolean := coalesce(tg_argv[0], 'data') <> 'nodata';
  row_json jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into public.audit_logs (actor_id, actor_email, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    (select email from auth.users where id = auth.uid()),
    lower(tg_op), tg_table_name,
    coalesce(row_json ->> 'id', row_json ->> 'key', row_json ->> 'provider'),
    case when include_data and tg_op <> 'INSERT' then to_jsonb(old) end,
    case when include_data and tg_op <> 'DELETE' then to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

create trigger audit_user_roles after insert or update or delete on public.user_roles
  for each row execute function public.audit_trigger();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles: read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles: pastoral and admins read all" on public.profiles for select to authenticated using (public.is_pastoral());
create policy "profiles: update own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles: admins update" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "user_roles: read own" on public.user_roles for select to authenticated using (user_id = (select auth.uid()));
create policy "user_roles: admins read all" on public.user_roles for select to authenticated using (public.is_admin());
create policy "user_roles: super admin grants" on public.user_roles for insert to authenticated with check (public.is_super_admin());
create policy "user_roles: super admin revokes" on public.user_roles for delete to authenticated using (public.is_super_admin());

-- audit log: admins read; nobody writes directly (only the SECURITY DEFINER trigger)
create policy "audit_logs: admins read" on public.audit_logs for select to authenticated using (public.is_admin());
