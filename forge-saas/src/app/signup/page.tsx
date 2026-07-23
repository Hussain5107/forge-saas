"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, ErrorText, Input, Label } from "@/components/ui";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-center font-[family-name:var(--font-display)] text-xl font-extrabold">
        FORGE
      </Link>

      <Card className="p-6">
        {sent ? (
          <div className="text-center">
            <h1 className="mb-2 text-lg font-bold">Check your email</h1>
            <p className="text-sm text-[var(--text-dim)]">
              We sent a confirmation link to <b className="text-[var(--text)]">{email}</b>. Click it
              to finish creating your account.
            </p>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-lg font-bold">Create your account</h1>
            <p className="mb-5 text-sm text-[var(--text-dim)]">
              Free during beta — get your personalized 6-day program in under a minute.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <ErrorText>{error}</ErrorText>
              <Button type="submit" variant="primary" disabled={loading} className="mt-2 w-full">
                {loading ? "Creating account…" : "Sign up"}
              </Button>
            </form>
          </>
        )}
      </Card>

      <p className="mt-5 text-center text-sm text-[var(--text-dim)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--cyan)]">
          Log in
        </Link>
      </p>
    </main>
  );
}
