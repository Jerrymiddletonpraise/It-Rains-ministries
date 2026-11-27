\set ON_ERROR_STOP 1
-- Every table in public must have RLS on
do $$ declare t text; begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity loop
    raise exception 'RLS disabled on %', t; end loop; end $$;
select count(*) as tables_with_rls from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity;

-- assertion helpers
create or replace function pg_temp.expect_fail(sql text, label text) returns text language plpgsql as $$
begin execute sql; raise exception 'EXPECTED FAILURE but succeeded: %', label;
exception when others then if sqlerrm like 'EXPECTED FAILURE%' then raise; end if; return 'ok (blocked): ' || label || ' -> ' || sqlerrm; end $$;
create or replace function pg_temp.expect_count(sql text, n int, label text) returns text language plpgsql as $$
declare c int; begin execute 'select count(*) from (' || sql || ') x' into c;
if c <> n then raise exception 'COUNT MISMATCH % : got % expected %', label, c, n; end if; return 'ok: ' || label || ' = ' || c; end $$;
grant execute on all functions in schema pg_temp to anon, authenticated;

insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-0000000000a1','admin@example.test','{"full_name":"Ada Admin"}'),
 ('00000000-0000-0000-0000-0000000000b2','member@example.test','{"full_name":"Mo Member"}'),
 ('00000000-0000-0000-0000-0000000000c3','prayer@example.test','{"full_name":"Pat Prayer"}'),
 ('00000000-0000-0000-0000-0000000000d4','other@example.test','{"full_name":"Oli Other"}');
select pg_temp.expect_count('select * from public.user_roles where role = ''member''', 4, 'signup gives everyone Registered Member');
select pg_temp.expect_count('select * from public.profiles where full_name is not null', 4, 'signup creates profiles');
insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-0000000000a1','super_admin'), ('00000000-0000-0000-0000-0000000000c3','prayer_team');
insert into public.events (id,slug,title,starts_at,registration_required,capacity,status) values (gen_random_uuid(),'night','Night',now()+interval '3 days',true,2,'published'), ('00000000-0000-0000-0000-00000000e0e0','draft-ev','Draft',now()+interval '3 days',true,null,'draft');
insert into public.testimonials (author_name,email,body,consent_to_publish,status) values ('T One','t1@example.test','approved body',true,'approved'),('T Two','t2@example.test','pending body',true,'pending');
insert into public.prayer_requests (name,email,request,visibility,consent_given,approved_for_wall) values ('Wall Person','w@example.test','please pray (public approved)','public',true,true),('Secret Person','s@example.test','private need','private',true,false);
insert into public.pastoral_care_requests (name,email,details,consent_given) values ('Care Person','c@example.test','confidential',true);

-- ===== anon =====
set role anon; select set_config('request.jwt.claim.sub','',false);
select pg_temp.expect_count('select * from public.prayer_requests', 0, 'anon cannot read prayer requests');
select pg_temp.expect_count('select * from public.prayer_wall', 1, 'anon sees only approved public prayer on wall');
select pg_temp.expect_count('select * from public.prayer_wall where request like ''%private%''', 0, 'wall never shows private');
select pg_temp.expect_count('select * from public.testimonials', 0, 'anon cannot read testimonials table (emails)');
select pg_temp.expect_count('select * from public.published_testimonials', 1, 'anon reads approved testimonials view');
select pg_temp.expect_count('select * from public.events', 1, 'anon sees published events only');
select pg_temp.expect_count('select * from public.ministries', 13, 'anon sees seeded ministries');
select pg_temp.expect_count('select * from public.integration_settings', 0, 'anon cannot read integration settings');
select pg_temp.expect_count('select * from public.public_integration_status where status = ''awaiting_configuration''', 12, 'all integrations awaiting configuration');
insert into public.prayer_requests (request, consent_given) values ('anon request', true);
select 'ok: anon can submit prayer request';
insert into public.newsletter_subscriptions (email, consent_given) values ('n@example.test', true);
select pg_temp.expect_fail($q$insert into public.newsletter_subscriptions (email, consent_given) values ('x@example.test', false)$q$, 'newsletter without consent');
select pg_temp.expect_fail($q$insert into public.prayer_requests (request, consent_given, approved_for_wall) values ('sneak onto wall', true, true)$q$, 'anon self-approving prayer for wall');
select pg_temp.expect_fail($q$insert into public.testimonials (author_name, body, consent_to_publish, status) values ('x','y',true,'approved')$q$, 'anon self-approving testimony');
select pg_temp.expect_fail($q$insert into public.donations (amount_cents, category, provider, provider_payment_id) values (100,'tithe','stripe','fake')$q$, 'anon writing a donation');
select pg_temp.expect_fail($q$insert into public.site_settings (key, value) values ('hero','{}')$q$, 'anon editing site settings');
select pg_temp.expect_count('select * from public.site_settings', 0, 'anon can read site settings (none yet)');

-- ===== member =====
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b2',false);
select pg_temp.expect_fail($q$insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-0000000000b2','super_admin')$q$, 'member self-escalating to super admin');
select pg_temp.expect_count('select * from public.user_roles', 1, 'member sees only own role');
select pg_temp.expect_count('select * from public.profiles', 1, 'member sees only own profile');
update public.profiles set full_name = 'Hacked' where id = '00000000-0000-0000-0000-0000000000d4';
select pg_temp.expect_count($q$select * from public.profiles where full_name = 'Hacked'$q$, 0, 'member cannot edit someone else (0 rows)');
insert into public.prayer_requests (requester_id, request, consent_given) values ('00000000-0000-0000-0000-0000000000b2', 'my request', true);
select pg_temp.expect_count('select * from public.prayer_requests', 1, 'member reads only own prayer request');
select pg_temp.expect_fail($q$insert into public.prayer_requests (requester_id, request, consent_given) values ('00000000-0000-0000-0000-0000000000d4', 'impersonate', true)$q$, 'member submitting as another user');
select pg_temp.expect_count('select * from public.pastoral_care_requests', 0, 'member cannot read pastoral care');
select pg_temp.expect_count('select * from public.visitor_cards', 0, 'member cannot read visitor cards');
select pg_temp.expect_count('select * from public.audit_logs', 0, 'member cannot read audit log');
insert into public.event_registrations (event_id, user_id) select id, auth.uid() from public.events where slug='night';
select pg_temp.expect_count($q$select * from public.event_registrations where status='registered'$q$, 1, 'member registered for event');
select pg_temp.expect_fail($q$insert into public.event_registrations (event_id, user_id) values ('00000000-0000-0000-0000-00000000e0e0', auth.uid())$q$, 'registering for unpublished event');
insert into public.membership_applications (user_id, full_name, consent_given) values (auth.uid(), 'Mo Member', true);
update public.membership_applications set status='approved';
select pg_temp.expect_count($q$select * from public.membership_applications where status='pending'$q$, 1, 'application still pending after member tried to approve');

-- ===== other member fills capacity -> waitlist =====
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000d4',false);
insert into public.event_registrations (event_id, user_id, party_size) select id, auth.uid(), 2 from public.events where slug='night';
select pg_temp.expect_count($q$select * from public.event_registrations where status='waitlisted'$q$, 1, 'over-capacity registration is waitlisted');
select pg_temp.expect_count('select * from public.membership_applications', 0, 'other member cannot see others applications');

-- ===== prayer team =====
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c3',false);
select pg_temp.expect_count('select * from public.prayer_requests', 4, 'prayer team reads all prayer requests');
select pg_temp.expect_count('select * from public.pastoral_care_requests', 0, 'prayer team cannot read confidential pastoral care');
update public.prayer_requests set status='praying' where requester_id is null and name is null;
select 'ok: prayer team updates status';

-- ===== super admin =====
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',false);
select pg_temp.expect_count('select * from public.pastoral_care_requests', 1, 'admin reads pastoral care');
insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-0000000000b2','media_team');
select pg_temp.expect_count($q$select * from public.audit_logs where table_name='user_roles' and action='insert' and actor_email='admin@example.test'$q$, 1, 'role grant is audited with actor');
select pg_temp.expect_count($q$select * from public.audit_logs where table_name='prayer_requests' and old_data is null and new_data is null$q$, 1, 'prayer update audited without copying confidential text');
select pg_temp.expect_fail($q$delete from public.user_roles where role='super_admin'$q$, 'removing last super admin');
insert into public.site_settings (key, value) values ('senior_pastor', '{"name":"Test"}');
select pg_temp.expect_count($q$select * from public.site_settings where updated_by = auth.uid()$q$, 1, 'admin edits settings, updated_by stamped');
update public.membership_applications set status='approved';
select pg_temp.expect_count('select * from public.members', 1, 'approving application creates member record');
select pg_temp.expect_fail($q$update public.integration_settings set mode='live' where provider='stripe'$q$, 'switching Stripe live without a successful test and approval');

-- ===== new media team member: can schedule broadcasts, cannot see giving =====
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b2',false);
insert into public.broadcast_schedules (title, scheduled_start) values ('Sunday', now() + interval '1 day');
select 'ok: media team schedules broadcast';
select pg_temp.expect_count('select * from public.donations', 0, 'media team cannot read donations');
select pg_temp.expect_fail($q$insert into public.streaming_destinations (provider, display_name, secret_name) values ('youtube','YT','sk-live-123')$q$, 'storing a raw key in secret_name');
insert into public.streaming_destinations (provider, display_name, secret_name) values ('youtube','YouTube','YOUTUBE_STREAM_KEY');
select 'ok: media team registers destination by secret NAME';
insert into public.live_chat_messages (broadcast_id, display_name, body) select id, 'Mo', 'Amen' from public.broadcast_schedules limit 1;
select 'ok: member posts chat';
reset role;
select 'ALL RLS CHECKS PASSED';
