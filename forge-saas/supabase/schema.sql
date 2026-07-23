-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- for a brand new project. Safe to re-run: uses "if not exists" / "or replace"
-- throughout.

-- 1. PROFILES ---------------------------------------------------------------
-- One row per signed-up user, created automatically by the trigger below.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  age int check (age between 13 and 100),
  sex text check (sex in ('male', 'female')),
  height_cm numeric check (height_cm between 100 and 250),
  weight_kg numeric check (weight_kg between 30 and 300),
  goal text check (goal in ('muscle', 'strength', 'fat_loss', 'general_fitness')),
  experience text check (experience in ('beginner', 'intermediate', 'advanced')),
  onboarded boolean not null default false,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. PROGRAMS ----------------------------------------------------------------
-- The latest generated program per user (regenerating overwrites this row).

create table if not exists public.programs (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  program jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.programs enable row level security;

drop policy if exists "programs: select own" on public.programs;
create policy "programs: select own" on public.programs
  for select using (auth.uid() = user_id);

drop policy if exists "programs: upsert own" on public.programs;
create policy "programs: upsert own" on public.programs
  for insert with check (auth.uid() = user_id);

drop policy if exists "programs: update own" on public.programs;
create policy "programs: update own" on public.programs
  for update using (auth.uid() = user_id);

-- 3. PROGRESS ------------------------------------------------------------
-- One row per exercise, per calendar date, per user.

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  day_number int not null,
  exercise_slug text not null,
  done boolean not null default false,
  note text,
  updated_at timestamptz not null default now(),
  unique (user_id, log_date, exercise_slug)
);

alter table public.progress enable row level security;

drop policy if exists "progress: select own" on public.progress;
create policy "progress: select own" on public.progress
  for select using (auth.uid() = user_id);

drop policy if exists "progress: upsert own" on public.progress;
create policy "progress: upsert own" on public.progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "progress: update own" on public.progress;
create policy "progress: update own" on public.progress
  for update using (auth.uid() = user_id);

create index if not exists progress_user_date_idx on public.progress (user_id, log_date);
