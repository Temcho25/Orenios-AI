const defaultTimeZone = "UTC";

function formatDateInTimeZone(
  date: Date,
  timeZone: string
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find(
    (part) => part.type === "year"
  )?.value;

  const month = parts.find(
    (part) => part.type === "month"
  )?.value;

  const day = parts.find(
    (part) => part.type === "day"
  )?.value;

  if (!year || !month || !day) {
    throw new Error(
      "Orenios could not determine the current date."
    );
  }

  return `${year}-${month}-${day}`;
}

export function getTodayDate(
  timeZone = defaultTimeZone
) {
  return formatDateInTimeZone(new Date(), timeZone);
}

export function getFutureDate(
  daysFromNow: number,
  timeZone = defaultTimeZone
) {
  const [year, month, day] = getTodayDate(
    timeZone
  )
    .split("-")
    .map(Number);

  const futureDate = new Date(
    Date.UTC(year, month - 1, day + daysFromNow)
  );

  return futureDate.toISOString().slice(0, 10);
}

export function resolveTimeZone(value: unknown) {
  const timeZone =
    typeof value === "string" ? value.trim() : "";

  if (!timeZone || timeZone.length > 100) {
    return defaultTimeZone;
  }

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone,
    }).format();

    return timeZone;
  } catch {
    return defaultTimeZone;
  }
}

export function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}