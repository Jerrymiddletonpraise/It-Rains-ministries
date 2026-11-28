-- Phase 7/9/10/11 backend additions: live chat in real time, "I prayed" on the
-- prayer wall, and staff housekeeping for the inbox. Everything here runs on the
-- Supabase free plan.

-- ---------- Realtime: live chat and broadcast status update viewers instantly ----------
-- RLS still applies to every realtime message, so hidden chat messages are never sent.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.live_chat_messages; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.broadcast_schedules; exception when duplicate_object then null; end;
  end if;
end $$;

-- ---------- Prayer wall: anyone can say "I prayed" ----------
-- Only increments the counter of a request that is visible on the public wall.
-- No other column can be touched, and private requests cannot be reached.
create or replace function public.pray_for(request_id uuid)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update public.prayer_requests
     set prayer_count = prayer_count + 1
   where id = request_id and visibility = 'public' and approved_for_wall and status <> 'closed'
  returning prayer_count into n;
  return n;  -- null when the request is not on the wall
end $$;
revoke all on function public.pray_for(uuid) from public;
grant execute on function public.pray_for(uuid) to anon, authenticated;

-- ---------- Inbox housekeeping ----------
create policy "contact_messages: admins delete" on public.contact_messages for delete to authenticated using (public.is_admin());
create policy "pastoral_care: admins delete" on public.pastoral_care_requests for delete to authenticated using (public.is_admin());
create index if not exists contact_messages_status_idx on public.contact_messages (status, created_at desc);
