# FORGE

A personalized strength-training web app. Answer a short intake quiz and get a
real 6-day Push/Pull/Legs program built around your goal, experience level and —
crucially — wherever you actually train: a gym, home with dumbbells, or nothing
but your own bodyweight (home or a park).

Built with Next.js 16 (App Router) and Supabase, deployed on Vercel. Installs to
a phone home screen as a PWA.

## What it does

**Program generation**
- Intake quiz: age, sex, height, weight, goal, experience, training location
- Three genuinely different exercise libraries — gym, home-with-dumbbells, and
  fully bodyweight — not one list with things greyed out
- Sets, reps, rest and RPE tuned per goal and experience
- Training location is changeable later from Settings, which regenerates the
  program (with a confirmation step first — logged sets, PRs and streaks are kept)
- Each user's weekday-to-workout mapping is offset by a hash of their user id, so
  people sharing the app don't all hit leg day on the same Tuesday

**Training**
- Per-set logging (weight × reps) with previous-session recall
- Automatic personal-record detection and an estimated 1RM
- Streak tracking, weekly volume charts, progress photos
- Per-exercise form cues, common mistakes, breathing notes and a form-video link

**Health & habits**
- Calorie, protein and water targets derived from your profile (Mifflin-St Jeor)
- Daily water and protein logging against those targets
- Optional blood-pressure logging
- Opt-in daily push reminders for water and workouts

## Layout

The Next.js application lives in [`forge-saas/`](forge-saas/).

```
forge-saas/
├── src/app/            # routes: landing, auth, onboarding, dashboard, settings
├── src/components/     # UI components
├── src/lib/exercises/  # the three exercise libraries + program generator
└── supabase/schema.sql # database schema, RLS policies, triggers
```

## Setup

1. Create a Supabase project and run [`forge-saas/supabase/schema.sql`](forge-saas/supabase/schema.sql)
   in its SQL editor.
2. Copy `forge-saas/.env.example` to `.env.local` and fill in your Supabase URL
   and anon key (plus VAPID keys if you want push reminders).
3. `cd forge-saas && npm install && npm run dev`

## Status

Free during beta. Exercise selection is rules-based, not AI-generated — the same
proven split for everyone, with volume, intensity and equipment personalized on
top of it.

## Note

This is a training aid, not medical advice. Anyone with a health condition or
injury should talk to a doctor before starting a new program.
