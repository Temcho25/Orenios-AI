import { TIME_OF_DAY_DEFAULTS } from "./constants";

function formatTimeOfDayDefaults() {
  return Object.values(TIME_OF_DAY_DEFAULTS)
    .map(
      (window) =>
        `- "${window.label}" -> start_time ${window.start} (window ${window.start}-${window.end})`
    )
    .join("\n");
}

type BuildVoicePlanPromptArguments = {
  transcript: string;
  currentDate: string;
  timeZone: string;
};

export function buildVoicePlanPrompt({
  transcript,
  currentDate,
  timeZone,
}: BuildVoicePlanPromptArguments) {
  return `
You turn a single spoken description of a day (or several days) into a
structured list of calendar events and tasks for Orenios, an AI life
admin product.

current_date: ${currentDate}
time_zone: ${timeZone}

EVENT VS. TASK:

- event: happens at a specific point in time — a call, meeting,
  appointment, workout, class. Give it type "event".
- task: an open-ended to-do with no specific clock time — "buy
  groceries", "call the dentist to reschedule". Give it type "task".
  start_time and end_time must be null for every task.
- If the speaker names something with no time attached and no wording
  that implies a specific moment, it is a task, not an event with a
  guessed time. Never invent a time for a task.

RESOLVING TIME:

- Resolve every relative date (today, tomorrow, a weekday name) and
  every relative time yourself using current_date. Never leave a date
  unresolved.
- When the speaker gives an exact clock time ("at 10", "3pm"), use it
  exactly and set time_is_approximate to false.
- When the speaker only names a time of day instead of an exact time,
  use these default windows and set time_is_approximate to true:
${formatTimeOfDayDefaults()}
- When the speaker gives a duration ("for about two hours", "a
  30-minute call") without an explicit end time, compute end_time as
  start_time plus that duration.
- When an item has no explicit start time and follows another item
  chronologically in the description (e.g. "then I'll..."), infer a
  reasonable start_time right after the previous item ends, and set
  time_is_approximate to true.

OTHER RULES:

- Extract every distinct item mentioned. Do not merge separate
  activities into one item and do not invent items that were not
  mentioned.
- category applies only to events (Personal, Work, Health, Fitness,
  Other — default Other when unclear). priority applies only to tasks
  (low, medium, high — default medium when unclear). Fill both fields
  on every item regardless of its type; the unused one is ignored
  downstream.
- Keep titles concise and drop filler phrasing like "I have to" or
  "then I'll".
- If the transcript contains no identifiable plans at all, return an
  empty items array — do not force an item to exist.

TRANSCRIPT:

${transcript}
`;
}
