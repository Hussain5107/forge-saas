import Link from "next/link";
import Image from "next/image";
import { Button, Card } from "@/components/ui";

const FEATURES = [
  {
    icon: "🎯",
    image: "/hero/personalized-leg-press.jpg",
    title: "Personalized to you",
    body: "Age, sex, height, weight, goal, and experience level tune your sets, reps, rest, and nutrition targets.",
  },
  {
    icon: "📷",
    image: "/hero/incline-press-spot.jpg",
    title: "Real exercise photos",
    body: "Every exercise has a real reference photo and a proper-form video, not a generic icon.",
  },
  {
    icon: "🍽️",
    image: "/hero/core-crunches.jpg",
    title: "Nutrition dialed in",
    body: "Daily calorie, protein, and water targets computed from your numbers and your goal.",
  },
  {
    icon: "📈",
    image: "/hero/group-kettlebell.jpg",
    title: "Track every session",
    body: "Mark exercises done, jot notes, and build a streak — synced to your account.",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <header className="mb-16 flex items-center justify-between">
        <div className="font-[family-name:var(--font-display)] text-xl font-extrabold">FORGE</div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-[var(--text-dim)] hover:text-[var(--text)]">
            Pricing
          </Link>
          <Link href="/login" className="text-[var(--text-dim)] hover:text-[var(--text)]">
            Log in
          </Link>
          <Link href="/signup">
            <Button variant="primary">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="mb-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--cyan)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--volt)]" />
            Free during beta
          </div>
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl lg:mx-0">
            Your personalized{" "}
            <span className="bg-gradient-to-br from-[var(--violet)] to-[var(--cyan)] bg-clip-text text-transparent">
              6-day program
            </span>
            , built in a minute.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[var(--text-dim)] lg:mx-0">
            Answer a few questions about yourself and your goal. Get a real Push/Pull/Legs program
            with photos, videos, and nutrition targets — not a generic PDF.
          </p>
          <div className="mt-8 flex justify-center gap-3 lg:justify-start">
            <Link href="/signup">
              <Button variant="primary" className="px-7 py-3 text-base">
                Build my program
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-[var(--border)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <Image
            src="/hero/training-partners.jpg"
            alt="Training with intensity"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/70 via-transparent to-transparent" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.title} className="overflow-hidden p-0">
            <div className="relative h-32 w-full">
              <Image src={f.image} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/10 to-transparent" />
              <span className="absolute bottom-2 left-3 text-2xl">{f.icon}</span>
            </div>
            <div className="p-5 pt-3">
              <h3 className="mb-1 font-bold">{f.title}</h3>
              <p className="text-sm text-[var(--text-dim)]">{f.body}</p>
            </div>
          </Card>
        ))}
      </section>

      <footer className="mt-auto pt-16 text-center text-xs text-[var(--text-faint)]">
        FORGE — built for people who train, not for people who scroll fitness PDFs.
      </footer>
    </main>
  );
}
