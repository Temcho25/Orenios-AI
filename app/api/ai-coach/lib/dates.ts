export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getFutureDate(daysFromNow: number) {
  const date = new Date();

  date.setDate(date.getDate() + daysFromNow);

  return date.toISOString().slice(0, 10);
}

export function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}