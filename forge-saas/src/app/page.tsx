import Link from "next/link";
import { Button, Card } from "@/components/ui";

const FEATURES = [
  {
    icon: "🎯",
    title: "Personalized to you",
    body: "Age, sex, height, weight, goal, and experience level tune your sets, reps, rest, and nutrition targets.",
  },
  {
    icon: "📷",
    title: "Real exercise photos",
    body: "Every exercise has a real reference photo and a proper-form video, not a generic icon.",
  },
  {
    icon: "🍽️",
    title: "Nutrition dialed in",
    body: "Daily calorie, protein, and water targets computed from your numbers and your goal.",
  },
  {
    icon: "📈",
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

      <section className="mb-16 text-center">
        <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--cyan)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--volt)]" />
          Free during beta
        </div>
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Your personalized{" "}
          <span className="bg-gradient-to-br from-[var(--violet)] to-[var(--cyan)] bg-clip-text text-transparent">
            6-day program
          </span>
          , built in a minute.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--text-dim)]">
          Answer a few questions about yourself and your goal. Get a real Push/Pull/Legs program
          with photos, videos, and nutrition targets — not a generic PDF.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup">
            <Button variant="primary" className="px-7 py-3 text-base">
              Build my program
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.title} className="p-5">
            <div className="mb-2 text-2xl">{f.icon}</div>
            <h3 className="mb-1 font-bold">{f.title}</h3>
            <p className="text-sm text-[var(--text-dim)]">{f.body}</p>
          </Card>
        ))}
      </section>

      <footer className="mt-auto pt-16 text-center text-xs text-[var(--text-faint)]">
        FORGE — built for people who train, not for people who scroll fitness PDFs.
      </footer>
    </main>
  );
}
