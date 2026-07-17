// Every tunable knob for Voice Day Planning lives here, in one place,
// so it can change without touching prompt text or route logic.

// gpt-4o-mini-transcribe: good accuracy/cost/latency balance for short
// (under a few minutes) day-planning voice memos. Swap to
// "gpt-4o-transcribe" for higher accuracy at higher cost/latency if
// real usage shows this isn't good enough on accents/background noise.
export const VOICE_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

// The model used to turn the transcript into structured events/tasks.
// Kept separate from the transcription model constant above since
// they're independent choices.
export const VOICE_PLAN_PARSING_MODEL = "gpt-4.1-mini";

// Hard cap on recording length, enforced client-side (auto-stop) and
// checked server-side against the uploaded file where practical. Not
// an OpenAI API limit (that's 25MB, effectively no constraint for a
// day-planning memo) — this is a product decision: a spoken plan for
// "today" has no real reason to run longer than a few minutes, and
// capping it bounds transcription+parsing cost/latency per request.
export const MAX_RECORDING_SECONDS = 180;

// Generous upper bound on the uploaded audio file size, independent of
// the duration cap above — a safety net against a client sending an
// unexpectedly large file (e.g. an uncompressed format) even if it's
// short. Well under OpenAI's 25MB API limit on purpose.
export const MAX_AUDIO_FILE_BYTES = 15 * 1024 * 1024;

export type TimeOfDayWindow = {
  label: string;
  start: string;
  end: string;
};

// Default start/end windows used when the speaker names a time of day
// ("in the morning", "at lunch", "in the evening") instead of an exact
// clock time. The model is instructed to use the window's start as the
// inferred start_time and flag the item as time_is_approximate. These
// are a first guess — expect to tune them after real usage.
export const TIME_OF_DAY_DEFAULTS: Record<string, TimeOfDayWindow> = {
  morning: { label: "morning", start: "08:00", end: "10:00" },
  midday: { label: "midday", start: "11:00", end: "12:00" },
  lunch: { label: "lunch", start: "12:00", end: "14:00" },
  afternoon: { label: "afternoon", start: "14:00", end: "17:00" },
  evening: { label: "evening", start: "18:00", end: "20:00" },
  night: { label: "night", start: "20:00", end: "22:00" },
};

// Neither a parsed item nor an existing calendar_events row is
// required to have an end_time (a bare "call at 10" is valid and
// common). Treating a missing end_time as zero duration for conflict
// purposes would under-detect real conflicts — two events 5 minutes
// apart with no stated end would never flag. This assumed duration is
// used ONLY inside the conflict-detection math; it is never written to
// the database or shown as the item's actual end_time.
export const DEFAULT_CONFLICT_CHECK_DURATION_MINUTES = 30;
