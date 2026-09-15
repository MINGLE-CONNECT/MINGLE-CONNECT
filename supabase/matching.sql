-- Mingle-Connect Stage 5: likes and matches
create table if not exists public.likes (
 id uuid primary key default gen_random_uuid(),
 liker_id uuid not null references public.profiles(id) on delete cascade,
 liked_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz default now(),
 unique(liker_id,liked_id),
 check(liker_id <> liked_id)
);
alter table public.likes enable row level security;
drop policy if exists "Users can create their own likes" on public.likes;
create policy "Users can create their own likes" on public.likes for insert to authenticated with check(auth.uid()=liker_id);
drop policy if exists "Users can view their likes" on public.likes;
create policy "Users can view their likes" on public.likes for select to authenticated using(auth.uid()=liker_id or auth.uid()=liked_id);
drop policy if exists "Users can delete their own likes" on public.likes;
create policy "Users can delete their own likes" on public.likes for delete to authenticated using(auth.uid()=liker_id);

create table if not exists public.matches (
 id uuid primary key default gen_random_uuid(),
 user1_id uuid not null references public.profiles(id) on delete cascade,
 user2_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz default now(),
 unique(user1_id,user2_id),
 check(user1_id <> user2_id)
);
alter table public.matches enable row level security;
create policy "Users can view their matches" on public.matches for select to authenticated using(auth.uid()=user1_id or auth.uid()=user2_id);

create or replace function public.create_match_on_mutual_like()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if exists(select 1 from public.likes where liker_id=new.liked_id and liked_id=new.liker_id) then
   insert into public.matches(user1_id,user2_id)
   values(least(new.liker_id,new.liked_id),greatest(new.liker_id,new.liked_id))
   on conflict(user1_id,user2_id) do nothing;
 end if;
 return new;
end;
$$;

drop trigger if exists on_like_create_match on public.likes;
create trigger on_like_create_match after insert on public.likes
for each row execute function public.create_match_on_mutual_like();
