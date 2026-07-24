"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, updateAvatarUrl, logHealthMetric, savePushSubscription } from "@/app/dashboard/settings/actions";
import { subscribeToPush, supportsPush } from "@/lib/pushClient";
import { Button, Card, Checkbox, Input, Label } from "./ui";
import { Logo } from "./Logo";

interface Profile {
  id: string;
  email: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  country: string | null;
  phone_number: string | null;
  has_diabetes: boolean;
  has_high_blood_pressure: boolean;
  other_health_notes: string | null;
  water_reminder_enabled: boolean;
  water_reminder_hour: number;
  workout_reminder_enabled: boolean;
  workout_reminder_hour: number;
}

interface HealthMetric {
  id: string;
  log_date: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  notes: string | null;
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);

function formatHour(h: number): string {
  const period = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${period}`;
}

export default function SettingsClient({
  profile,
  recentMetrics,
}: {
  profile: Profile;
  recentMetrics: HealthMetric[];
}) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth ?? "");
  const [country, setCountry] = useState(profile.country ?? "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number ?? "");
  const [hasDiabetes, setHasDiabetes] = useState(profile.has_diabetes);
  const [hasHighBloodPressure, setHasHighBloodPressure] = useState(profile.has_high_blood_pressure);
  const [otherHealthNotes, setOtherHealthNotes] = useState(profile.other_health_notes ?? "");
  const [waterReminderEnabled, setWaterReminderEnabled] = useState(profile.water_reminder_enabled);
  const [waterReminderHour, setWaterReminderHour] = useState(profile.water_reminder_hour);
  const [workoutReminderEnabled, setWorkoutReminderEnabled] = useState(profile.workout_reminder_enabled);
  const [workoutReminderHour, setWorkoutReminderHour] = useState(profile.workout_reminder_hour);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [metricNotes, setMetricNotes] = useState("");
  const [metrics, setMetrics] = useState(recentMetrics);
  const [loggingMetric, setLoggingMetric] = useState(false);
  const [pushNotice, setPushNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [metricError, setMetricError] = useState<string | null>(null);

  async function ensurePushSubscribed() {
    if (!supportsPush()) {
      setPushNotice(
        "Push notifications aren't available in this browser. On iPhone, add FORGE to your Home Screen first (Share → Add to Home Screen), then enable this from there.",
      );
      return;
    }
    const sub = await subscribeToPush();
    if (!sub) {
      setPushNotice("Notification permission was denied — enable it in your browser/phone settings to receive reminders.");
      return;
    }
    const json = sub.toJSON();
    if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
      const result = await savePushSubscription(json.endpoint, json.keys.p256dh, json.keys.auth);
      setPushNotice(result.error ? `Couldn't save notification settings: ${result.error}` : null);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${profile.id}/avatar/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("progress-photos").upload(path, file, { upsert: true });
    if (error) {
      setSaveError(`Couldn't upload photo: ${error.message}`);
    } else {
      const { data } = supabase.storage.from("progress-photos").getPublicUrl(path);
      const result = await updateAvatarUrl(data.publicUrl);
      if (result.error) {
        setSaveError(`Photo uploaded, but saving it to your profile failed: ${result.error}`);
      } else {
        setAvatarUrl(data.publicUrl);
        setSaveError(null);
      }
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const result = await updateProfile({
      dateOfBirth: dateOfBirth || null,
      country: country || null,
      phoneNumber: phoneNumber || null,
      hasDiabetes,
      hasHighBloodPressure,
      otherHealthNotes: otherHealthNotes || null,
      waterReminderEnabled,
      waterReminderHour,
      workoutReminderEnabled,
      workoutReminderHour,
    });
    setSaving(false);
    if (result.error) {
      setSaveError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleLogMetric() {
    if (!systolic && !diastolic && !pulse) return;
    setLoggingMetric(true);
    setMetricError(null);
    const logDate = new Date().toISOString().slice(0, 10);
    const result = await logHealthMetric(
      logDate,
      systolic ? parseInt(systolic, 10) : null,
      diastolic ? parseInt(diastolic, 10) : null,
      pulse ? parseInt(pulse, 10) : null,
      metricNotes,
    );
    if (result.error) {
      setMetricError(result.error);
      setLoggingMetric(false);
      return;
    }
    setMetrics((prev) => [
      {
        id: crypto.randomUUID(),
        log_date: logDate,
        systolic: systolic ? parseInt(systolic, 10) : null,
        diastolic: diastolic ? parseInt(diastolic, 10) : null,
        pulse: pulse ? parseInt(pulse, 10) : null,
        notes: metricNotes || null,
      },
      ...prev,
    ]);
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setMetricNotes("");
    setLoggingMetric(false);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <Link href="/dashboard" className="text-xs text-[var(--text-faint)] hover:text-[var(--text)]">
          ← Back to today
        </Link>
      </header>

      <h1 className="mb-6 text-2xl font-extrabold">Settings</h1>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--text-faint)]">Profile</h2>

        <div className="mb-5 flex items-center gap-4">
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--bg-2)]">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl">👤</span>
            )}
          </span>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hi)] bg-[var(--surface-hi)] px-4 py-2 text-xs font-bold hover:border-[var(--cyan)]">
              {uploading ? "Uploading…" : "Change photo"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        {saveError && <p className="mb-4 text-sm text-[var(--rose)]">{saveError}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dob">Date of birth</Label>
            <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United Arab Emirates" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Optional" />
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--text-faint)]">Health info (optional)</h2>
        <div className="flex flex-col gap-3">
          <Checkbox label="I have diabetes" checked={hasDiabetes} onChange={(e) => setHasDiabetes(e.target.checked)} />
          <Checkbox
            label="I have high blood pressure"
            checked={hasHighBloodPressure}
            onChange={(e) => setHasHighBloodPressure(e.target.checked)}
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="healthNotes">Anything else we should know?</Label>
          <textarea
            id="healthNotes"
            value={otherHealthNotes}
            onChange={(e) => setOtherHealthNotes(e.target.value)}
            rows={2}
            placeholder="Injuries, conditions, medications that affect training…"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-2.5 text-sm outline-none focus:border-[var(--cyan)]"
          />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--text-faint)]">Reminders</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <Checkbox
              label="💧 Water intake reminder"
              checked={waterReminderEnabled}
              onChange={(e) => {
                setWaterReminderEnabled(e.target.checked);
                if (e.target.checked) void ensurePushSubscribed();
              }}
            />
            {waterReminderEnabled && (
              <select
                value={waterReminderHour}
                onChange={(e) => setWaterReminderHour(parseInt(e.target.value, 10))}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] px-2 py-1.5 text-sm outline-none"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Checkbox
              label="🏋️ Workout reminder"
              checked={workoutReminderEnabled}
              onChange={(e) => {
                setWorkoutReminderEnabled(e.target.checked);
                if (e.target.checked) void ensurePushSubscribed();
              }}
            />
            {workoutReminderEnabled && (
              <select
                value={workoutReminderHour}
                onChange={(e) => setWorkoutReminderHour(parseInt(e.target.value, 10))}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] px-2 py-1.5 text-sm outline-none"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--text-faint)]">
          One reminder per day, sent at the hour you pick (times are UTC — local-timezone alarms are coming
          later). You&apos;ll be asked to allow notifications the first time you turn one on.
        </p>
        {pushNotice && <p className="mt-2 text-xs text-[var(--amber)]">{pushNotice}</p>}
      </Card>

      <div className="mt-6 flex flex-col items-end gap-2">
        <Button variant="primary" onClick={handleSave} disabled={saving} className="px-6">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </Button>
        {saveError && <p className="text-sm text-[var(--rose)]">Couldn&apos;t save: {saveError}</p>}
      </div>

      <Card className="mt-8 p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--text-faint)]">
          Log today&apos;s blood pressure
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Input type="number" placeholder="Systolic" value={systolic} onChange={(e) => setSystolic(e.target.value)} />
          <Input type="number" placeholder="Diastolic" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} />
          <Input type="number" placeholder="Pulse" value={pulse} onChange={(e) => setPulse(e.target.value)} />
        </div>
        <Input
          className="mt-3"
          placeholder="Notes (optional)"
          value={metricNotes}
          onChange={(e) => setMetricNotes(e.target.value)}
        />
        <Button
          variant="primary"
          onClick={handleLogMetric}
          disabled={loggingMetric || (!systolic && !diastolic && !pulse)}
          className="mt-3 w-full"
        >
          {loggingMetric ? "Logging…" : "Log entry"}
        </Button>
        {metricError && <p className="mt-2 text-sm text-[var(--rose)]">Couldn&apos;t log entry: {metricError}</p>}

        {metrics.length > 0 && (
          <div className="mt-5 flex flex-col gap-2">
            {metrics.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between border-b border-[var(--border)] py-2 text-sm last:border-none"
              >
                <span className="text-[var(--text-faint)]">{m.log_date}</span>
                <span className="font-mono">
                  {m.systolic && m.diastolic ? `${m.systolic}/${m.diastolic}` : "—"}
                  {m.pulse ? ` · ${m.pulse} bpm` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
