import type { NutritionTargets } from "@/lib/exercises/types";
import { Card } from "./ui";

export default function NutritionPanel({ nutrition }: { nutrition: NutritionTargets }) {
  const items = [
    { label: "Calories / day", value: nutrition.calorieTarget.toLocaleString() },
    { label: "Protein / day", value: `${nutrition.proteinG} g` },
    { label: "Water / day", value: `${nutrition.waterL} L` },
    { label: "Maintenance (TDEE)", value: nutrition.tdee.toLocaleString() },
  ];

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-bold">Your nutrition targets</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-3 text-center">
            <div className="font-mono text-lg font-bold text-[var(--volt)]">{i.value}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--text-faint)]">{i.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
