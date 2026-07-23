"use client";

import { useState } from "react";
import Image from "next/image";
import type { PrescribedExercise } from "@/lib/exercises/types";
import { MUSCLE_LABELS } from "@/lib/exercises/types";

interface Props {
  index: number;
  exercise: PrescribedExercise;
  done: boolean;
  note: string;
  onToggleDone: () => void;
  onSaveNote: (note: string) => void;
}

export default function ExerciseCard({ index, exercise: ex, done, note, onToggleDone, onSaveNote }: Props) {
  const [open, setOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note);
  const [imgError, setImgError] = useState(false);

  const videoUrl =
    ex.videoUrl ?? `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " proper form tutorial")}`;
  const videoVerified = !!ex.videoUrl;

  return (
    <div
      className={`overflow-hidden rounded-[18px] border bg-[var(--surface)] transition ${
        done ? "border-[rgba(198,255,61,0.45)]" : "border-[var(--border)]"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3.5 p-4 text-left"
      >
        <span className="w-5 shrink-0 font-mono text-xs text-[var(--text-faint)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onToggleDone();
            }
          }}
          aria-label="Mark complete"
          className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${
            done
              ? "border-transparent bg-gradient-to-br from-[var(--volt)] to-[#4ade80] text-[#0a0b0f]"
              : "border-[var(--border-hi)] text-transparent"
          }`}
        >
          ✓
        </span>
        <span className="hidden h-13 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-2)] sm:block">
          {!imgError ? (
            <Image
              src={ex.image}
              alt={ex.name}
              width={44}
              height={52}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-base">🏋️</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15.5px] font-bold">{ex.name}</span>
          <span className="mt-0.5 flex flex-wrap gap-2 text-xs text-[var(--text-dim)]">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                ex.difficulty === "beginner"
                  ? "bg-[rgba(198,255,61,0.15)] text-[var(--volt)]"
                  : "bg-[rgba(255,176,32,0.15)] text-[var(--amber)]"
              }`}
            >
              {ex.difficulty}
            </span>
            <span>{ex.equip}</span>
          </span>
        </span>
        <span className="hidden shrink-0 gap-3.5 text-center sm:flex">
          <span>
            <span className="block font-mono text-sm font-bold">
              {ex.sets}×{ex.reps}
            </span>
            <span className="text-[9px] uppercase tracking-wide text-[var(--text-faint)]">sets</span>
          </span>
          <span>
            <span className="block font-mono text-sm font-bold">{ex.rest}</span>
            <span className="text-[9px] uppercase tracking-wide text-[var(--text-faint)]">rest</span>
          </span>
        </span>
        <span
          className="shrink-0 text-[var(--text-faint)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-4 pb-5 pt-4">
          <div className="mt-1 grid grid-cols-3 gap-2">
            <Stat label="Sets × Reps" value={`${ex.sets}×${ex.reps}`} />
            <Stat label="Rest" value={ex.rest} />
            <Stat label="Tempo" value={ex.tempo} />
          </div>

          <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4 sm:flex-row">
            <span className="h-[150px] w-full shrink-0 overflow-hidden rounded-xl bg-[var(--surface)] sm:h-[120px] sm:w-[120px]">
              {!imgError ? (
                <Image
                  src={ex.image}
                  alt={`${ex.name} demonstration`}
                  width={240}
                  height={240}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl">📷</span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{ex.name}</div>
              <div className="mt-1 text-xs text-[var(--text-dim)]">
                Targets: {ex.primary.map((m) => MUSCLE_LABELS[m]).join(", ")}
                {ex.secondary.length > 0 && ` (+ ${ex.secondary.map((m) => MUSCLE_LABELS[m]).join(", ")})`}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Block title="💨 Breathing">
              <li className="cue">{ex.breathing}</li>
            </Block>
            <Block title="Form cues">
              {ex.cues.map((c) => (
                <li key={c} className="cue">
                  {c}
                </li>
              ))}
            </Block>
            <Block title="Common mistakes">
              {ex.mistakes.map((m) => (
                <li key={m} className="mistake">
                  {m}
                </li>
              ))}
            </Block>
            <Block title="💡 Tip">
              <li className="cue">{ex.tip}</li>
            </Block>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
              📝 Notes
            </label>
            <textarea
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--cyan)]"
              rows={2}
              placeholder="How did this feel? Any adjustments?"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onBlur={() => {
                if (noteDraft !== note) onSaveNote(noteDraft);
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hi)] bg-[var(--surface-hi)] px-3.5 py-2 text-xs font-bold hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
            >
              ▶ {videoVerified ? "Watch demonstration" : "Search proper form"}
            </a>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hi)] bg-[var(--surface-hi)] px-3.5 py-2 text-xs font-bold text-[var(--text-dim)]">
              🔄 Alternative: {ex.alt}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-2 text-center">
      <b className="block font-mono text-[15px]">{value}</b>
      <span className="text-xs text-[var(--text-dim)]">{label}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-faint)]">
        {title}
      </h4>
      <ul className="flex flex-col gap-1 text-sm text-[var(--text-dim)] [&_.cue]:relative [&_.cue]:pl-4 [&_.cue::before]:absolute [&_.cue::before]:left-0 [&_.cue::before]:font-bold [&_.cue::before]:text-[var(--volt)] [&_.cue::before]:content-['✓'] [&_.mistake]:relative [&_.mistake]:pl-4 [&_.mistake::before]:absolute [&_.mistake::before]:left-0 [&_.mistake::before]:font-bold [&_.mistake::before]:text-[var(--rose)] [&_.mistake::before]:content-['✕']">
        {children}
      </ul>
    </div>
  );
}
