-- Mingle-Connect Stage 7: blocking, reporting, and admin access

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id),
  check(blocker_id <> blocked_id)
);
alter table public.blocks enable row level security;

create policy "Users can create their own blocks"
on public.blocks for insert to authenticated
with check(auth.uid()=blocker_id);

create policy "Users can view their own blocks"
on public.blocks for select to authenticated
using(auth.uid()=blocker_id);

create policy "Users can delete their own blocks"
on public.blocks for delete to authenticated
using(auth.uid()=blocker_id);


create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text check(details is null or char_length(details)<=1000),
  status text not null default 'open' check(status in ('open','reviewed','resolved')),
  created_at timestamptz default now(),
  check(reporter_id <> reported_user_id)
);
alter table public.reports enable row level security;

create policy "Users can submit their own reports"
on public.reports for insert to authenticated
with check(auth.uid()=reporter_id);

create policy "Users can view their own submitted reports"
on public.reports for select to authenticated
using(auth.uid()=reporter_id);


create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.admin_users enable row level security;

-- Admins can identify themselves for admin-only reads/writes through membership.
create policy "Admins can view admin membership"
on public.admin_users for select to authenticated
using(auth.uid()=user_id);

-- Reports are visible/updateable to administrators only.
create policy "Admins can view all reports"
on public.reports for select to authenticated
using(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

create policy "Admins can update reports"
on public.reports for update to authenticated
using(exists(select 1 from public.admin_users a where a.user_id=auth.uid()))
with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

-- Hide blocked users from profile discovery at the database-query level via a helper.
create or replace function public.is_blocked_between(a uuid,b uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.blocks
    where (blocker_id=a and blocked_id=b)
       or (blocker_id=b and blocked_id=a)
  );
$$;
