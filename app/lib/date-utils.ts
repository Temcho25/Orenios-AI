// The one shared "local date as YYYY-MM-DD" helper. Subtracting the
// timezone offset before calling toISOString() is what makes this
// correct for the browser's local date rather than UTC's — a plain
// `date.toISOString().split("T")[0]` would return tomorrow's date for
// anyone west of UTC in the evening.
export function getLocalDateKey(
  date: Date = new Date(),
  daysOffset = 0
): string {
  const shifted = new Date(date);

  if (daysOffset !== 0) {
    shifted.setDate(shifted.getDate() + daysOffset);
  }

  const timezoneOffset = shifted.getTimezoneOffset() * 60_000;

  return new Date(shifted.getTime() - timezoneOffset)
    .toISOString()
    .split("T")[0];
}
