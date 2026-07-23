// Pure, testable rule-based logic for the voice coach. No LLM calls — every
// line is a deterministic template so this feature has zero ongoing cost.

export function secondsFromRestString(rest: string): number {
  const match = rest.match(/^(\d+)\s*s$/i);
  if (match) return parseInt(match[1], 10);
  const minMatch = rest.match(/^(\d+)\s*m$/i);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;
  return 60;
}

export function exerciseIntroText(
  name: string,
  sets: number,
  reps: string,
  rest: string,
  tip?: string,
): string {
  const base = `${name}. ${sets} sets of ${reps}, resting ${rest} between sets.`;
  return tip ? `${base} Tip: ${tip}` : base;
}

export function setLoggedText(
  setNumber: number,
  totalSets: number,
  weightKg: number,
  reps: number,
  isNewPR: boolean,
): string {
  const prLine = isNewPR ? " New personal record!" : "";
  return `Set ${setNumber} of ${totalSets} logged: ${weightKg} kilos for ${reps} reps.${prLine}`;
}

export function restStartText(seconds: number): string {
  return `Rest ${seconds} seconds.`;
}

export function restWarningText(secondsLeft: number): string {
  return `${secondsLeft} seconds left.`;
}

export function restEndText(): string {
  return "Rest's over. Next set.";
}

export function allSetsDoneText(exerciseName: string): string {
  return `${exerciseName} complete. Nice work.`;
}

export type VoiceCommand =
  | { type: "log_set"; weightKg: number; reps: number }
  | { type: "repeat" }
  | { type: "skip_rest" }
  | { type: "unknown" };

/**
 * Extracts a weight+reps pair from a spoken transcript like "60 kilos 10
 * reps" or "log 22.5 kg for 8". Rule-based regex matching, not NLP — Chrome's
 * speech recognizer already converts spoken numbers to digits in the
 * transcript, so this only needs to find the first two numbers.
 */
export function parseVoiceCommand(transcript: string): VoiceCommand {
  const text = transcript.toLowerCase().trim();

  if (/^repeat|say again|what('?s| is) (the )?exercise/.test(text)) {
    return { type: "repeat" };
  }
  if (/skip rest|skip timer|start now/.test(text)) {
    return { type: "skip_rest" };
  }

  const numbers = text.match(/\d+(?:\.\d+)?/g);
  const mentionsLog = /log|record|set/.test(text);
  if (mentionsLog && numbers && numbers.length >= 2) {
    return { type: "log_set", weightKg: parseFloat(numbers[0]), reps: parseFloat(numbers[1]) };
  }

  return { type: "unknown" };
}
