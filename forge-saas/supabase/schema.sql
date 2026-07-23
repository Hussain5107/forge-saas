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

-- 4. WORKOUT_SETS -------------------------------------------------------------
-- One row per logged set (actual weight/reps used), for progress charts and
-- PR detection. Separate from `progress` (which just tracks done/notes).

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  day_number int not null,
  exercise_slug text not null,
  exercise_name text not null,
  set_number int not null,
  weight_kg numeric check (weight_kg >= 0),
  reps int check (reps >= 0),
  rpe numeric check (rpe between 1 and 10),
  logged_at timestamptz not null default now()
);

alter table public.workout_sets enable row level security;

drop policy if exists "workout_sets: select own" on public.workout_sets;
create policy "workout_sets: select own" on public.workout_sets
  for select using (auth.uid() = user_id);

drop policy if exists "workout_sets: insert own" on public.workout_sets;
create policy "workout_sets: insert own" on public.workout_sets
  for insert with check (auth.uid() = user_id);

drop policy if exists "workout_sets: delete own" on public.workout_sets;
create policy "workout_sets: delete own" on public.workout_sets
  for delete using (auth.uid() = user_id);

create index if not exists workout_sets_user_exercise_idx on public.workout_sets (user_id, exercise_slug, logged_at desc);
create index if not exists workout_sets_user_date_idx on public.workout_sets (user_id, log_date);

-- 5. PERSONAL_RECORDS ---------------------------------------------------------
-- Append-only: a new row every time a PR is beaten, so history is preserved.
-- The current PR per exercise is just the latest row for that exercise.

create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  exercise_slug text not null,
  exercise_name text not null,
  weight_kg numeric not null,
  reps int not null,
  estimated_1rm numeric not null,
  achieved_at timestamptz not null default now()
);

alter table public.personal_records enable row level security;

drop policy if exists "personal_records: select own" on public.personal_records;
create policy "personal_records: select own" on public.personal_records
  for select using (auth.uid() = user_id);

drop policy if exists "personal_records: insert own" on public.personal_records;
create policy "personal_records: insert own" on public.personal_records
  for insert with check (auth.uid() = user_id);

create index if not exists personal_records_user_exercise_idx on public.personal_records (user_id, exercise_slug, achieved_at desc);

-- 6. STREAKS -------------------------------------------------------------
-- One row per user, updated whenever they log at least one set for the day.

create table if not exists public.streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_workout_date date,
  total_workouts int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.streaks enable row level security;

drop policy if exists "streaks: select own" on public.streaks;
create policy "streaks: select own" on public.streaks
  for select using (auth.uid() = user_id);

drop policy if exists "streaks: upsert own" on public.streaks;
create policy "streaks: upsert own" on public.streaks
  for insert with check (auth.uid() = user_id);

drop policy if exists "streaks: update own" on public.streaks;
create policy "streaks: update own" on public.streaks
  for update using (auth.uid() = user_id);
