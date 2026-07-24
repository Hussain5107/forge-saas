"use client";

import { useState } from "react";
import type { NutritionTargets } from "@/lib/exercises/types";
import { Card } from "./ui";

interface Props {
  nutrition: NutritionTargets;
  waterMl: number;
  proteinG: number;
  onLogIntake: (waterMlDelta: number, proteinGDelta: number) => Promise<{ error: string | null }>;
}

export default function NutritionPanel({ nutrition, waterMl, proteinG, onLogIntake }: Props) {
  const [water, setWater] = useState(waterMl);
  const [protein, setProtein] = useState(proteinG);
  const [proteinInput, setProteinInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const targetWaterMl = Math.round(nutrition.waterL * 1000);

  async function addWater(ml: number) {
    setPending(true);
    setError(null);
    const prev = water;
    setWater((w) => Math.max(0, w + ml));
    const result = await onLogIntake(ml, 0);
    setPending(false);
    if (result.error) {
      setWater(prev);
      setError(result.error);
    }
  }

  async function addProtein() {
    const grams = parseInt(proteinInput, 10);
    if (!grams || grams <= 0) return;
    setPending(true);
    setError(null);
    const prev = protein;
    setProtein((p) => p + grams);
    const result = await onLogIntake(0, grams);
    setPending(false);
    if (result.error) {
      setProtein(prev);
      setError(result.error);
    } else {
      setProteinInput("");
    }
  }

  const items = [
    { label: "Calories / day", value: nutrition.calorieTarget.toLocaleString() },
    { label: "Maintenance (TDEE)", value: nutrition.tdee.toLocaleString() },
  ];

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-bold">Your nutrition targets</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i.label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-3 text-center">
            <div className="font-mono text-lg font-bold text-[var(--volt)]">{i.value}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--text-faint)]">{i.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-faint)]">💧 Water today</span>
            <span className="font-mono text-sm font-bold text-[var(--cyan)]">
              {(water / 1000).toFixed(1)} / {nutrition.waterL} L
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--cyan)] transition-all"
              style={{ width: `${Math.min(100, (water / targetWaterMl) * 100)}%` }}
            />
          </div>
          <div className="mt-2.5 flex gap-1.5">
            {[250, 500, 1000].map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => void addWater(ml)}
                disabled={pending}
                className="flex-1 rounded-full border border-[var(--border-hi)] bg-[var(--surface-hi)] py-1.5 text-xs font-bold hover:border-[var(--cyan)] disabled:opacity-40"
              >
                +{ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-faint)]">🥩 Protein today</span>
            <span className="font-mono text-sm font-bold text-[var(--volt)]">
              {protein} / {nutrition.proteinG} g
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--volt)] transition-all"
              style={{ width: `${Math.min(100, (protein / nutrition.proteinG) * 100)}%` }}
            />
          </div>
          <div className="mt-2.5 flex gap-1.5">
            <input
              type="number"
              min={1}
              placeholder="grams"
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
              className="w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-2)] px-3 py-1.5 text-xs outline-none focus:border-[var(--cyan)]"
            />
            <button
              type="button"
              onClick={() => void addProtein()}
              disabled={pending || !proteinInput}
              className="rounded-full border border-[var(--border-hi)] bg-[var(--surface-hi)] px-3 py-1.5 text-xs font-bold hover:border-[var(--cyan)] disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-[var(--rose)]">Couldn&apos;t log intake: {error}</p>}
    </Card>
  );
}
