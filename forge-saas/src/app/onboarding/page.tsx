"use client";

import { useActionState } from "react";
import { submitOnboarding, type OnboardingState } from "./actions";
import { Button, Card, ErrorText, Input, Label, Select } from "@/components/ui";
import { Logo } from "@/components/Logo";

const initialState: OnboardingState = {};

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(submitOnboarding, initialState);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div className="mb-2 flex justify-center">
          <Logo className="text-xl" />
        </div>
        <h1 className="text-2xl font-extrabold">Let&apos;s build your program</h1>
        <p className="mt-1 text-sm text-[var(--text-dim)]">
          A few quick questions, then your personalized 6-day plan is ready.
        </p>
      </div>

      <Card className="p-6">
        <form action={formAction} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" min={13} max={100} required placeholder="28" />
            </div>
            <div>
              <Label htmlFor="sex">Sex</Label>
              <Select id="sex" name="sex" required defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heightCm">Height (cm)</Label>
              <Input id="heightCm" name="heightCm" type="number" min={100} max={250} required placeholder="175" />
            </div>
            <div>
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input id="weightKg" name="weightKg" type="number" min={30} max={300} step="0.1" required placeholder="72" />
            </div>
          </div>

          <div>
            <Label htmlFor="goal">Primary goal</Label>
            <Select id="goal" name="goal" required defaultValue="">
              <option value="" disabled>
                Select…
              </option>
              <option value="muscle">Build muscle (hypertrophy)</option>
              <option value="strength">Get stronger</option>
              <option value="fat_loss">Lose fat</option>
              <option value="general_fitness">General fitness</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="experience">Training experience</Label>
            <Select id="experience" name="experience" required defaultValue="">
              <option value="" disabled>
                Select…
              </option>
              <option value="beginner">Beginner (0–6 months)</option>
              <option value="intermediate">Intermediate (6 months–2 years)</option>
              <option value="advanced">Advanced (2+ years)</option>
            </Select>
          </div>

          <ErrorText>{state?.error}</ErrorText>

          <Button type="submit" variant="primary" disabled={pending} className="mt-2 w-full">
            {pending ? "Building your program…" : "Generate my program"}
          </Button>
        </form>
      </Card>

      <p className="mt-5 text-center text-xs text-[var(--text-faint)]">
        Exercise selection uses a proven 6-day Push/Pull/Legs split for everyone; your answers
        personalize sets, reps, rest, and nutrition targets on top of it.
      </p>
    </main>
  );
}
