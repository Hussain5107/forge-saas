import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <header className="mb-16 flex items-center justify-between">
        <Link href="/" className="font-[family-name:var(--font-display)] text-xl font-extrabold">
          FORGE
        </Link>
        <Link href="/signup">
          <Button variant="primary">Get started</Button>
        </Link>
      </header>

      <section className="text-center">
        <h1 className="text-3xl font-extrabold">Simple pricing</h1>
        <p className="mt-2 text-[var(--text-dim)]">Free for everyone right now, while we're in beta.</p>
      </section>

      <div className="mx-auto mt-10 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--volt)]">Free</div>
          <div className="mb-4 text-3xl font-extrabold">$0</div>
          <ul className="flex flex-col gap-2 text-sm text-[var(--text-dim)]">
            <li>✓ Personalized 6-day program</li>
            <li>✓ Real exercise photos + videos</li>
            <li>✓ Nutrition targets</li>
            <li>✓ Progress tracking</li>
          </ul>
          <Link href="/signup" className="mt-6 block">
            <Button variant="primary" className="w-full">
              Start free
            </Button>
          </Link>
        </Card>

        <Card className="p-6 opacity-60">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">
            Pro — coming soon
          </div>
          <div className="mb-4 text-3xl font-extrabold text-[var(--text-faint)]">TBD</div>
          <ul className="flex flex-col gap-2 text-sm text-[var(--text-dim)]">
            <li>Everything in Free</li>
            <li>Program regeneration on demand</li>
            <li>Advanced periodization</li>
            <li>Priority support</li>
          </ul>
          <Button disabled className="mt-6 w-full">
            Not yet available
          </Button>
        </Card>
      </div>
    </main>
  );
}
