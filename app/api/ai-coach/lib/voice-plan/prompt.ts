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

- event: happens at a specific point in time, OR has a stated duration
  or time-block ("for about two hours", "a 30-minute call") — a
  duration is itself a temporal commitment even with no exact clock
  time attached. Give it type "event".
- task: a true open-ended to-do with no time and no duration attached
  at all — "buy groceries", "call the dentist to reschedule". Give it
  type "task". start_time and end_time must be null for every task.
- If the speaker names something with no time, no time-of-day word, no
  duration, and no wording that implies a specific moment, it is a
  task, not an event with a guessed time. Never invent a time for a
  task that truly has none of these.

RESOLVING TIME:

Resolve every relative date (today, tomorrow, a weekday name) yourself
using current_date — never leave a date unresolved. For start_time,
apply these rules IN ORDER for each item and stop at the first one
that matches — do not skip ahead to a later rule if an earlier one
already applies:

1. Exact clock time stated for this item ("at 10", "3pm", "9:30") ->
   use it exactly. time_is_approximate: false.

2. A time-of-day word attached directly to THIS item ("in the
   morning", "at lunch", "in the evening", "tonight") -> use that
   item's own matching default window below, regardless of where the
   item falls in the sentence or what was mentioned right before it.
   This always outranks rule 4 — an item's own stated time-of-day beats
   pure narrative position, even for an item narrated right after
   another one ("lunch meeting, then gym in the evening" still puts
   gym in the evening window, not right after lunch).
${formatTimeOfDayDefaults()}

3. The item is placed relative to one or two OTHER named items
   ("in between lunch and the gym", "sometime before dinner", "right
   after the call"): resolve it relative to those items' own resolved
   times, not to whichever item happens to be mentioned immediately
   before it in the sentence. For "in between A and B", pick a time
   inside the gap between A's end and B's start — use whichever
   default window below falls inside that gap if one does, otherwise
   the midpoint of the gap.

4. If an item has no exact time, no time-of-day word and no relative
   phrase of its own, but it has a stated duration and/or is narrated
   as following another item ("then I'll spend about two hours on
   X", "after that I need to..."), infer its start_time right after
   the previous item's own end. This is the normal, expected way to
   resolve this common case — apply it confidently, do not leave the
   item without a start_time just because rules 1-3 didn't apply. The
   only thing rules 1-3 override is this rule specifically: a
   time-of-day word or relative phrase that belongs to the current
   item always wins over pure narrative position.

Rules 2-4 all set time_is_approximate to true. Once start_time is
resolved (by whichever rule applied), and the speaker gives a duration
("for about two hours", "a 30-minute call") without an explicit end
time, compute end_time as start_time plus that duration.

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
