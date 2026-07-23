"use client";

import { useMemo, useState } from "react";
import type { GeneratedProgram } from "@/lib/exercises/types";
import { MUSCLE_LABELS } from "@/lib/exercises/types";
import ExerciseCard from "./ExerciseCard";
import NutritionPanel from "./NutritionPanel";
import { Button } from "./ui";
import { toggleExerciseDone, saveExerciseNote } from "@/app/dashboard/actions";

interface ProgressRow {
  log_date: string;
  day_number: number;
  exercise_slug: string;
  done: boolean;
  note: string | null;
}

interface Props {
  email: string;
  program: GeneratedProgram;
  progressRows: ProgressRow[];
  weekDates: string[]; // 7 ISO dates, index 0 = Sunday
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DashboardClient({ email, program, progressRows, weekDates }: Props) {
  const today = new Date();
  const [selectedIndex, setSelectedIndex] = useState(today.getDay());
  const [muscleFilter, setMuscleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Local optimistic copy of progress, keyed by `${date}__${slug}`.
  const [progress, setProgress] = useState<Record<string, { done: boolean; note: string }>>(() => {
    const map: Record<string, { done: boolean; note: string }> = {};
    for (const row of progressRows) {
      map[`${row.log_date}__${row.exercise_slug}`] = { done: row.done, note: row.note ?? "" };
    }
    return map;
  });

  const selectedDate = weekDates[selectedIndex];
  const day = program.days.find((d) => d.dayNumber === selectedIndex);

  const musclesToday = useMemo(
    () => (day ? [...new Set(day.exercises.flatMap((e) => e.primary))] : []),
    [day],
  );

  const filteredExercises = useMemo(() => {
    if (!day) return [];
    let list = day.exercises;
    if (muscleFilter !== "all") list = list.filter((e) => e.primary.includes(muscleFilter as never));
    if (search) list = list.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [day, muscleFilter, search]);

  const completedCount = day
    ? day.exercises.filter((e) => progress[`${selectedDate}__${e.slug}`]?.done).length
    : 0;

  function handleToggleDone(slug: string) {
    const key = `${selectedDate}__${slug}`;
    const wasDone = progress[key]?.done ?? false;
    setProgress((p) => ({ ...p, [key]: { done: !wasDone, note: p[key]?.note ?? "" } }));
    void toggleExerciseDone(selectedDate, selectedIndex, slug, !wasDone);
  }

  function handleSaveNote(slug: string, note: string) {
    const key = `${selectedDate}__${slug}`;
    setProgress((p) => ({ ...p, [key]: { done: p[key]?.done ?? false, note } }));
    void saveExerciseNote(selectedDate, selectedIndex, slug, note);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="font-[family-name:var(--font-display)] text-lg font-extrabold">FORGE</div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-faint)]">
          <span className="hidden sm:inline">{email}</span>
          <form action="/auth/signout" method="post">
            <Button type="submit" className="px-3 py-1.5 text-xs">
              Log out
            </Button>
          </form>
        </div>
      </header>

      <NutritionPanel nutrition={program.nutrition} />

      <div className="mt-6 grid grid-cols-7 gap-2">
        {DAY_LABELS.map((label, i) => {
          const d = program.days.find((d) => d.dayNumber === i);
          const isSelected = i === selectedIndex;
          return (
            <button
              key={label}
              onClick={() => setSelectedIndex(i)}
              className={`rounded-xl p-3 text-center transition ${
                isSelected
                  ? "bg-gradient-to-br from-[var(--violet)] to-[var(--cyan)] text-white"
                  : "border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hi)]"
              }`}
            >
              <div
                className={`text-[11px] font-bold uppercase tracking-wide ${
                  isSelected ? "text-white/80" : "text-[var(--text-faint)]"
                }`}
              >
                {label}
              </div>
              <div className={`mt-1 text-xs font-bold ${isSelected ? "text-white" : "text-[var(--text-dim)]"}`}>
                {d ? d.name : "Rest"}
              </div>
            </button>
          );
        })}
      </div>

      {!day ? (
        <div className="glass mt-8 rounded-[18px] border border-[var(--border)] p-14 text-center">
          <div className="mb-3 text-4xl">🌙</div>
          <h2 className="text-xl font-extrabold">Full rest. Let the muscle grow.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-dim)]">
            Optional: a 20–30 minute walk or light mobility work. No lifting today — recovery is
            where the muscle-building actually happens.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold">{day.name}</h2>
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">
                {day.subtitle}
              </span>
            </div>
            <span className="text-xs font-bold text-[var(--text-dim)]">
              {completedCount} / {day.exercises.length} done
            </span>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {day.warmup.map((w) => (
              <div
                key={w}
                className="glass shrink-0 whitespace-nowrap rounded-full border border-[var(--border)] px-3.5 py-2 text-xs text-[var(--text-dim)]"
              >
                🔸 {w}
              </div>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search today's exercises…"
              className="glass min-w-[180px] flex-1 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--text-faint)]"
            />
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={muscleFilter === "all"} onClick={() => setMuscleFilter("all")}>
                All
              </FilterChip>
              {musclesToday.map((m) => (
                <FilterChip key={m} active={muscleFilter === m} onClick={() => setMuscleFilter(m)}>
                  {MUSCLE_LABELS[m]}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredExercises.map((ex) => {
              const key = `${selectedDate}__${ex.slug}`;
              return (
                <ExerciseCard
                  key={ex.slug}
                  index={day.exercises.indexOf(ex)}
                  exercise={ex}
                  done={progress[key]?.done ?? false}
                  note={progress[key]?.note ?? ""}
                  onToggleDone={() => handleToggleDone(ex.slug)}
                  onSaveNote={(note) => handleSaveNote(ex.slug, note)}
                />
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {day.cooldown.map((c) => (
              <div
                key={c}
                className="glass shrink-0 whitespace-nowrap rounded-full border border-[var(--border)] px-3.5 py-2 text-xs text-[var(--text-dim)]"
              >
                🧊 {c}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "bg-gradient-to-br from-[var(--violet)] to-[var(--cyan)] text-white"
          : "glass border border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--border-hi)]"
      }`}
    >
      {children}
    </button>
  );
}
