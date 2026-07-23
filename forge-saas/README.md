# FORGE — personalized workout SaaS

A Next.js + Supabase app: users sign up, answer a short intake form (age, sex,
height, weight, goal, experience level), and get a personalized 6-day
Push/Pull/Legs program with real exercise photos, video links, form cues, and
nutrition targets. Free for now — a `plan` column on `profiles` is already in
place for adding paid tiers later.

## How personalization works

Exercise **selection** is a fixed, proven 6-day PPL split (the same one from
the original FORGE app) for every user — a well-designed compound-focused
split works across goals. What's personalized per-profile:

- **Sets, reps, rest, RPE** — adjusted by goal (muscle / strength / fat loss /
  general fitness) and experience level (beginner / intermediate / advanced).
  See `src/lib/exercises/generator.ts` for the exact rules.
- **Nutrition targets** — calories, protein, and water computed from age,
  sex, height, and weight (Mifflin-St Jeor BMR formula) and the user's goal.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Supabase** — Postgres database + email/password auth
- Deploy target: **Vercel** (or anywhere that runs Next.js)

## 1. Create your Supabase project (free)

1. Go to [supabase.com](https://supabase.com) → sign up (no credit card needed) → **New project**.
2. Once it's created, go to **Project Settings → API**. Copy the **Project URL**
   and the **anon public** key.
3. Go to **SQL Editor → New query**, paste the entire contents of
   `supabase/schema.sql` from this repo, and run it. This creates the
   `profiles`, `programs`, and `progress` tables with row-level security so
   users can only ever see their own data.
4. Go to **Authentication → Sign In / Providers** and confirm **Email** is
   enabled (it is by default). Optional: under **Authentication → Emails**
   you can customize the confirmation email template later.
5. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: your production URL once you have one (e.g.
     `https://your-app.vercel.app`) — use `http://localhost:3000` for now
     while testing locally.
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` (and later
     your production `/auth/callback` URL too).

## 2. Run it locally

```bash
cp .env.local.example .env.local
# paste your Supabase Project URL + anon key into .env.local

npm install
npm run dev
```

Open `http://localhost:3000`, sign up with a real email you can check, click
the confirmation link, fill in the intake form, and you should land on your
personalized dashboard.

## 3. Deploy (Vercel, free tier)

Easiest path — no GitHub repo required:

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts (accept the defaults). When it asks about environment
variables, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
with the same values from your `.env.local`. Vercel gives you a URL like
`https://forge-saas.vercel.app` — update your Supabase **Site URL** and
**Redirect URLs** (step 1.5 above) to match it, then redeploy with:

```bash
vercel --prod
```

If you'd rather connect a GitHub repo (for auto-deploy on every push), push
this folder to a new repo and import it at [vercel.com/new](https://vercel.com/new)
instead — same environment variables.

## Adding subscriptions later

The `profiles.plan` column already exists (`'free'` | `'pro'`). When you're
ready to charge:

1. Add Stripe, create a Product + Price for the paid tier.
2. Add a Stripe webhook route (`src/app/api/stripe/webhook/route.ts`) that
   flips `profiles.plan` to `'pro'` on successful checkout/subscription
   events.
3. Gate whatever you want to be paid-only (e.g. program regeneration, extra
   features) behind a check on `profile.plan === 'pro'`.
4. Update `/pricing` with real prices and a checkout button.

## Project structure

```
src/
  app/
    page.tsx              landing page
    pricing/page.tsx
    signup/, login/       auth pages
    onboarding/           intake form -> generates + saves the program
    dashboard/             the app itself
    auth/callback/         email confirmation link handler
    auth/signout/
  components/              ExerciseCard, DashboardClient, NutritionPanel, ui.tsx
  lib/
    exercises/             the exercise library + personalization generator
    supabase/              client/server/middleware helpers
  middleware.ts            redirects signed-out users away from protected pages
supabase/schema.sql        run this once in the Supabase SQL editor
public/images/             43 real exercise photos
```

## What hasn't been tested

I built and verified this without a live Supabase project (I don't have
access to create one on your behalf) — I've confirmed:
- The app builds cleanly (`npm run build`) with no type errors.
- The personalization generator produces correct, sane output for beginner/
  intermediate/advanced across all four goals (verified with a standalone
  script).
- Middleware correctly redirects signed-out visitors away from
  `/onboarding` and `/dashboard`.
- All public pages (landing, pricing, signup, login) render with zero
  console errors.

What I could **not** test end-to-end: real signup → email confirmation →
onboarding → dashboard, since that needs your actual Supabase project.
Once you've done steps 1–2 above, run through that flow once and tell me if
anything breaks — happy to fix it.
