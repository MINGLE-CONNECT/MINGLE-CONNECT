-- Mingle-Connect Stage 6: matched-user messaging
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(),
 match_id uuid not null references public.matches(id) on delete cascade,
 sender_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(char_length(trim(body)) between 1 and 2000),
 created_at timestamptz default now()
);

alter table public.messages enable row level security;

drop policy if exists "Matched users can read messages" on public.messages;
create policy "Matched users can read messages"
on public.messages for select to authenticated
using (
 exists (
   select 1 from public.matches m
   where m.id=messages.match_id
   and (m.user1_id=auth.uid() or m.user2_id=auth.uid())
 )
);

drop policy if exists "Matched users can send their own messages" on public.messages;
create policy "Matched users can send their own messages"
on public.messages for insert to authenticated
with check (
 sender_id=auth.uid()
 and exists (
   select 1 from public.matches m
   where m.id=messages.match_id
   and (m.user1_id=auth.uid() or m.user2_id=auth.uid())
 )
);

-- Allow the frontend to receive INSERT events through Supabase Realtime.
alter table public.messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
