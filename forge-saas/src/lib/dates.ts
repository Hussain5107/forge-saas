export function isBirthdayToday(dateOfBirth: string | null): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth + "T00:00:00Z");
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  return dob.getUTCMonth() === todayUtc.getUTCMonth() && dob.getUTCDate() === todayUtc.getUTCDate();
}
