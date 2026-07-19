# Orenios AI — Full Project Audit

Read-only audit. No code was changed as part of this report. All findings are based on the repository state at commit `21d0132` on `main` (branch: clean, up to date with `origin/main`).

---

## 1. Project map

Full file tree with line counts. Files over **500 lines** are marked 🔴. Files between 400-500 lines (approaching the threshold) are marked 🟡 for awareness only — no split plan required for those yet.

```
life-admin/
├── AGENTS.md                                          5
├── CLAUDE.md                                         316
├── PROJECT_STATUS.md                                  60  (stale — see §3)
├── README.md                                           36  (unmodified create-next-app boilerplate — see §3)
├── .env.example                                        13
├── .env.local                                          10  (not committed, correctly gitignored)
├── eslint.config.mjs                                    18
├── next.config.ts                                        7  (empty config — see §4)
├── next-env.d.ts                                         6
├── package.json                                         37  ("name": "life-admin" — see §3)
├── postcss.config.mjs                                    7
├── proxy.ts                                             15
├── tsconfig.json                                        34
├── orenios-full-audit.zip                        (binary, 2.8M — stray untracked file, see §3)
│
├── app/
│   ├── layout.tsx                                       77
│   ├── page.tsx                                         66
│   ├── globals.css                                     186
│   ├── logo.svg                                  (binary, 484K — unused, see §3)
│   ├── icon.png                                  (binary, 1.3M — used as favicon)
│   │
│   ├── api/
│   │   ├── waitlist/route.ts                            99
│   │   └── ai-coach/
│   │       ├── route.ts                                494  🟡
│   │       ├── voice-plan/route.ts                      214
│   │       ├── voice-plan/confirm/route.ts              221
│   │       └── lib/
│   │           ├── conversation.ts                       19
│   │           ├── dates.ts                              90
│   │           ├── event-actions.ts                     360
│   │           ├── event-matcher.ts                       80
│   │           ├── event-parsers.ts                      235
│   │           ├── focus-actions.ts                       99
│   │           ├── focus-parsers.ts                       50
│   │           ├── goal-actions.ts                       399
│   │           ├── goal-matcher.ts                        81
│   │           ├── goal-parsers.ts                       247
│   │           ├── goal-replies.ts                         9
│   │           ├── note-actions.ts                        89
│   │           ├── note-parsers.ts                        50
│   │           ├── prompt.ts                             239
│   │           ├── references.ts                         245
│   │           ├── safe-execute.ts                        43
│   │           ├── task-actions.ts                       371
│   │           ├── task-matcher.ts                        80
│   │           ├── task-parsers.ts                       185
│   │           ├── task-replies.ts                        12
│   │           ├── tools.ts                              455  🟡
│   │           ├── types.ts                              146
│   │           └── voice-plan/
│   │               ├── conflicts.ts                      122
│   │               ├── constants.ts                        58
│   │               ├── linking.ts                          32
│   │               ├── parse-response.ts                 144
│   │               ├── prompt.ts                          110
│   │               ├── schema.ts                           75
│   │               └── types.ts                            83
│   │
│   ├── auth/callback/route.ts                            37
│   │
│   ├── components/
│   │   ├── Logo.tsx                                      57  (dead — see §3)
│   │   ├── logo.css                                     100  (dead — see §3)
│   │   ├── ThemeProvider.tsx                              11
│   │   ├── v2/                                              (landing page component library)
│   │   │   ├── AIAssistantCard.tsx                        30  (dead — see §3)
│   │   │   ├── AnimatedLogo.tsx                          107
│   │   │   ├── CalendarCard.tsx                           45
│   │   │   ├── Features.tsx                              140
│   │   │   ├── FloatingCards.tsx                         151  (dead — see §3)
│   │   │   ├── Footer.tsx                                116
│   │   │   ├── FounderNote.tsx                             38
│   │   │   ├── GoalsCard.tsx                               60
│   │   │   ├── Navbar.tsx                                203
│   │   │   ├── OrbitalRings.tsx                            73
│   │   │   ├── ProductHero.tsx                           412  🟡
│   │   │   ├── ProductPreview.tsx                        165
│   │   │   ├── ScrollToTop.tsx                             18
│   │   │   ├── StatsCards.tsx                              69  (dead — see §3)
│   │   │   ├── TasksCard.tsx                               66
│   │   │   └── Waitlist.tsx                               103  (dead — see §3)
│   │   └── voice/
│   │       ├── VoiceAura.tsx                             338
│   │       └── VoiceInterface.tsx                        112
│   │
│   ├── dashboard/
│   │   ├── page.tsx                                       46
│   │   ├── DashboardShell.tsx                          1570  🔴
│   │   ├── AICoach.tsx                                  1114  🔴
│   │   ├── CalendarCard.tsx                             1110  🔴
│   │   ├── NotesCard.tsx                                 765  🔴
│   │   ├── TasksCard.tsx                                 694  🔴
│   │   ├── GoalsCard.tsx                                 693  🔴
│   │   ├── FocusCard.tsx                                 509  🔴
│   │   ├── VoicePlanPreview.tsx                          414
│   │   ├── LogoutButton.tsx                                62
│   │   └── ThemeToggle.tsx                                 69
│   │
│   ├── lib/
│   │   ├── getGoals.ts                                     20  (dead — see §3)
│   │   ├── getTasks.ts                                     20  (dead — see §3)
│   │   ├── goal-state.ts                                   50
│   │   ├── rate-limit.ts                                   28
│   │   ├── supabase.ts                                      7
│   │   ├── supabase-proxy.ts                               42
│   │   └── supabase-server.ts                              29
│   │
│   ├── onboarding/
│   │   ├── page.tsx                                        42
│   │   └── OnboardingFlow.tsx                             467  🟡
│   │
│   ├── login/page.tsx                                    417  🟡
│   ├── register/page.tsx                                 439  🟡
│   ├── forgot-password/page.tsx                          165
│   ├── reset-password/page.tsx                             16
│   ├── reset-password/ResetPasswordForm.tsx               175
│   ├── privacy/page.tsx                                  279
│   └── terms/page.tsx                                    199
│
├── public/
│   ├── logo2.PNG                                 (binary — the real logo asset, used)
│   ├── globe.svg                                 (binary, 4K — dead, Next.js starter leftover)
│   ├── next.svg                                  (binary, 4K — dead, Next.js starter leftover)
│   ├── vercel.svg                                (binary, 4K — dead, Next.js starter leftover)
│   └── window.svg                                (binary, 4K — dead, Next.js starter leftover)
│
├── supabase/
│   ├── add-ai-message-action-column.sql                    12
│   ├── add-onboarding-columns.sql                          21
│   ├── rls-audit.sql                                      103  (read-only audit script)
│   └── rls-hardening-2026-07-15.sql                        72  (applied migration record)
│
└── tests/
    └── ai-coach-logic.test.ts                            788  🔴
```

**Totals:** ~19,000 lines of TS/TSX/CSS/SQL/Markdown (excluding `node_modules`, `.next`, `package-lock.json`). **8 files over 500 lines** (7 source files + 1 test file). No `.tsx`/`.ts` file is close to unreadable (largest is 1570 lines), but several are well past the point where a single component is doing too many jobs — see §2.

No database migration files define the actual `CREATE TABLE` schema in this repo (only two `ALTER TABLE`/RLS-policy scripts and two read-only audit scripts exist under `supabase/`) — the schema itself lives only in the live Supabase project, not as version-controlled migrations. That's a pre-existing gap, not something this audit can fix, but worth knowing before treating `supabase/*.sql` as a full schema record.

---

## 2. Oversized files & split plan

**This section is a proposal only — nothing below was executed.**

### 2.1 `app/dashboard/DashboardShell.tsx` (1570 lines) — the largest file by far

**What it currently contains**, in one file:
- Lines 1-29: imports, `DashboardShellProps`, `getLocalDateString` helper
- Lines 31-183: `navigationItems` — a data array of 6 nav entries, each with a hand-authored inline SVG icon (**~150 lines of pure markup data**)
- Lines 185-523: `DashboardShell` — the actual shell component (sidebar/mobile-nav state, daily-focus-progress fetch effect, session-storage tab-restore effect, the responsive layout JSX)
- Lines 524-664: `getSectionTitle`, `DashboardContent` (routes `activeItem` to the right card), `SectionPage` (shared hero-band wrapper used by Tasks/Goals/Calendar/Notes/AI Coach)
- Lines 665-820: `SidebarContent` — the actual sidebar markup (nav list, daily-progress mini card, sign-out)
- Lines 821-1551: the **entire Overview dashboard tab** — `OverviewContent`, `UpcomingEventsCard`, `isWithinNext24Hours`, `ProductivityScore`, `AIActionsCard`, `TasksSummaryCard`, `GoalsSummaryCard`, `DashboardCard` (shared card shell), plus their local types (`SummaryTask`, `SummaryGoal`)
- Lines 1552-1570: `ComingSoonContent`

In short: this one file is the app shell **and** the entire Overview tab's five widgets. That's the real reason it's 3x the next-largest file.

**Proposed split:**

| New file | Contents | Approx. lines |
|---|---|---|
| `app/dashboard/navigationItems.tsx` | The `navigationItems` array + its inline SVGs | ~155 |
| `app/dashboard/SidebarContent.tsx` | `SidebarContent` + `SidebarContentProps` | ~155 |
| `app/dashboard/DashboardContent.tsx` | `getSectionTitle`, `DashboardContent`, `SectionPage`, `SectionPageProps`, `ComingSoonContent` | ~140 |
| `app/dashboard/overview/OverviewContent.tsx` | `OverviewContent`, `UpcomingEventsCard`, `isWithinNext24Hours` | ~175 |
| `app/dashboard/overview/ProductivityScore.tsx` | `ProductivityScore` | ~140 |
| `app/dashboard/overview/AIActionsCard.tsx` | `AIActionsCard` | ~115 |
| `app/dashboard/overview/DashboardCard.tsx` | Shared `DashboardCard` wrapper used by the two summary cards below | ~40 |
| `app/dashboard/overview/TasksSummaryCard.tsx` | `TasksSummaryCard`, `SummaryTask`, `getSummaryPriorityClasses` | ~145 |
| `app/dashboard/overview/GoalsSummaryCard.tsx` | `GoalsSummaryCard`, `SummaryGoal` | ~125 |
| `app/dashboard/DashboardShell.tsx` (kept) | Imports, `DashboardShellProps`, `getLocalDateString`, the `DashboardShell` component itself | ~340 |

Net result: the root file drops from 1570 to ~340 lines (well under target), and the Overview tab becomes its own readable folder instead of living inside the shell file. `getSummaryPriorityClasses` should be replaced by importing the shared priority-class helper from §2 below (see §3.2 — it's currently a byte-for-byte duplicate of `TasksCard.tsx`'s `getPriorityClasses`).

### 2.2 `app/dashboard/AICoach.tsx` (1114 lines)

**What it currently contains:**
- Lines 1-126: imports, `ChatMessage`/`StoredChatMessage` types, `createMessageId`, `getBrowserTimeZone`, `formatAssistantResponse` (a ~55-line pure function that turns assistant reply text into headed/bulleted JSX)
- Lines 127-650: the component's entire logic surface with **no JSX** — conversation state, `loadConversationHistory` effect, `sendMessage`/`handleSubmit`, and the **full voice-recording lifecycle**: `ensureVoiceAudioContext`, `closeVoiceAudioContext`, `getSupportedAudioMimeType`, `startVoiceRecording`, `stopVoiceRecording`, `processVoiceRecording`, `handleVoicePlanConfirmed`, `handleVoicePlanCancel`, plus ~10 associated `useState`/`useRef` declarations
- Lines 651-1114: the JSX return — header, empty-state quick prompts, the message list (`AnimatePresence` + `messages.map`), the `VoiceInterface` panel, `VoicePlanPreview`, and the input form (textarea + record button + send button)

**Proposed split:**

| New file | Contents | Approx. lines |
|---|---|---|
| `app/dashboard/lib/formatAssistantResponse.tsx` | The pure formatting function | ~55 |
| `app/dashboard/useVoiceRecording.ts` | A custom hook wrapping the entire recording lifecycle (`ensureVoiceAudioContext`, `closeVoiceAudioContext`, `startVoiceRecording`, `stopVoiceRecording`, `processVoiceRecording`, all the voice-related state/refs) — returns `{ voiceRecordingState, voiceStream, audioContextRef, voicePlanData, voicePlanError, voiceSuccessMessage, startVoiceRecording, stopVoiceRecording, handleVoicePlanConfirmed, handleVoicePlanCancel }` | ~230 |
| `app/dashboard/ChatMessageList.tsx` | The `AnimatePresence`/`messages.map` block + the "thinking" typing indicator | ~110 |
| `app/dashboard/ChatInputForm.tsx` | The textarea + record button + send button block, taking the voice-recording state/handlers as props | ~150 |
| `app/dashboard/AICoach.tsx` (kept) | Conversation state, `sendMessage`/`handleSubmit`, composes the hook + the two new components + `VoiceInterface`/`VoicePlanPreview` | ~350 |

This is the highest-value split of the two largest files: `useVoiceRecording` is a fully self-contained concern (nothing about it touches chat-sending logic) and would also make the recording lifecycle independently testable, which it currently isn't (see §5).

### 2.3 `app/dashboard/CalendarCard.tsx` (1110 lines)

**What it currently contains:**
- Lines 1-142: types (`EventCategory`, `CalendarEvent`, `CalendarDay`), pure helpers (`getLocalDateKey`, `isSameDay`, `getCalendarDays`, `formatTime`, `getCategoryClasses`, `getCategoryDot`)
- Lines 143-~440: component state, data-fetch effect, CRUD handlers
- Lines ~440-770: header/month-navigation + the month grid (weekday labels row + `calendarDays.map` cells, with a separate compact-mobile/rich-desktop rendering split inside each cell)
- Lines 771-977: the add-event form panel (`AnimatePresence`-wrapped, title/description/date/time/category fields)
- Lines 981-1090: the selected-day event list with per-event edit/delete actions

**Proposed split:**

| New file | Contents | Approx. lines |
|---|---|---|
| `app/dashboard/lib/calendar-helpers.ts` | `getLocalDateKey`, `isSameDay`, `getCalendarDays`, `formatTime`, `getCategoryClasses`, `getCategoryDot`, `EventCategory`, `CalendarDay` types | ~95 |
| `app/dashboard/CalendarGrid.tsx` | The weekday-labels row + month-grid cell rendering | ~165 |
| `app/dashboard/CalendarEventForm.tsx` | The add-event form panel | ~210 |
| `app/dashboard/CalendarDayEventList.tsx` | The selected-day event list + row actions | ~110 |
| `app/dashboard/CalendarCard.tsx` (kept) | State, data fetching, handlers, header/month-nav, composes the three components above | ~530 |

Note this one lands closer to 530 than 500 even after the split — `CalendarCard` genuinely has more independent state (selected date, form fields, current month, pending-save IDs) than the other cards, so a second pass (e.g. extracting the add-event form's own field state into the `CalendarEventForm` component instead of lifting it all into the parent) would be needed to get fully under 500. Flagging that rather than promising a number that isn't accurate.

### 2.4 `tests/ai-coach-logic.test.ts` (788 lines)

Ten `describe` blocks, each testing a different module 1:1 (`dates.ts`, `goal-matcher.ts`, `goal-state.ts`, `safe-execute.ts`/`task-actions.ts`/`event-actions.ts`/`focus-actions.ts`, `voice-plan/parse-response.ts`, `voice-plan/conflicts.ts`, `voice-plan/linking.ts`). This is a test file, so the 500-line target matters less than for source files — a single flat file isn't causing a maintainability problem the way a 1500-line component would — but splitting it to mirror the source tree would make "which test covers which module" obvious at a glance:

| New file | Contents |
|---|---|
| `tests/dates.test.ts` | "AI Coach date validation" |
| `tests/task-matcher.test.ts` | "AI Coach title normalization" |
| `tests/goal-state.test.ts` | "goal status and progress invariants" |
| `tests/safe-execute.test.ts` | "AI Coach action error handling" |
| `tests/event-actions.test.ts` | "AI Coach event ambiguity handling" |
| `tests/focus-actions.test.ts` | "AI Coach daily focus progress handling" |
| `tests/voice-plan/parse-response.test.ts` | "Voice plan item sanitization" |
| `tests/voice-plan/conflicts.test.ts` | "Voice plan conflict detection", "doTimeRangesOverlap" |
| `tests/voice-plan/linking.test.ts` | "buildLinkedContextNote" |

### 2.5 `app/dashboard/NotesCard.tsx` (765), `TasksCard.tsx` (694), `GoalsCard.tsx` (693), `FocusCard.tsx` (509)

These four (plus `CalendarCard`) share **the exact same architecture**: local state for the data list + form fields + loading/saving/pending flags, one data-fetch `useEffect`, CRUD handlers, and a JSX return of (header/stats) + (add or edit form) + (item list with `AnimatePresence`). The same split pattern applies to all four:

- **`NotesCard.tsx`**: extract the editor panel (`editorOpen` block, ~436-562, ~126 lines) → `NoteEditor.tsx`; extract the notes list (~582-708, ~126 lines) → `NoteList.tsx`. Leaves `NotesCard.tsx` at roughly 513 lines — right at the edge, and would benefit from also moving `formatUpdatedDate`/`getPreview` into a small `lib/notes-helpers.ts`.
- **`TasksCard.tsx`**: extract the task list block (~509-654, ~145 lines) → `TaskList.tsx` (a `TaskRow` sub-component inside it is a reasonable second-level split if it grows further); move `getPriorityClasses`/`formatDueDate`/`getTodayDateKey` into `lib/task-helpers.ts` (and de-duplicate against DashboardShell's copy — see §3.2). Leaves `TasksCard.tsx` at roughly 500 lines.
- **`GoalsCard.tsx`**: same shape — extract the goal list (~356-485, ~129 lines) → `GoalList.tsx`; move `getStatusClasses`/`formatDeadline` into `lib/goal-helpers.ts`. Leaves `GoalsCard.tsx` at roughly 510 lines.
- **`FocusCard.tsx`**: smallest of the four and only 9 lines over target. Extracting the edit-mode form (inside the `AnimatePresence mode="wait"` block, ~282-484) into `FocusEditor.tsx` alone brings it comfortably under 500.

I'm not proposing named row-level sub-components (`TaskRow`, `GoalRow`, etc.) as a required first step — the list-block extraction alone gets every file under or very close to the 500-line target. Row-level extraction is a reasonable *second* pass if any of these files grow again after adding the list/form split above.

---

## 3. Bugs & risks

### 3.1 Dead code — files never imported anywhere

Verified by searching for any import of each file/export across the whole `app/` tree (not just a text match — confirmed zero actual `import ... from` references):

| File | Lines | Note |
|---|---|---|
| `app/lib/getGoals.ts` | 20 | Never called. Also instantiates its own top-level Supabase client (`createClient(...)` at module scope) instead of using the shared `app/lib/supabase.ts` helper — if it were ever wired up, it would be a second, inconsistent client-construction pattern. |
| `app/lib/getTasks.ts` | 20 | Same as above — never called, own duplicate Supabase client. |
| `app/components/Logo.tsx` | 57 | Superseded by `AnimatedLogo.tsx`, which is what's actually used everywhere a logo appears. |
| `app/components/logo.css` | 100 | Doubly dead — not imported anywhere, *and* its classes (`.logo-wrapper`, `.logo-glow`) aren't even used by the also-dead `Logo.tsx`, which uses Tailwind utilities directly. |
| `app/components/v2/AIAssistantCard.tsx` | 30 | Not imported by the landing page or anywhere else. |
| `app/components/v2/FloatingCards.tsx` | 151 | Same. |
| `app/components/v2/StatsCards.tsx` | 69 | Same. |
| `app/components/v2/Waitlist.tsx` | 103 | The real waitlist form (with the actual `fetch("/api/waitlist")` call) lives inline inside `ProductHero.tsx`. This standalone component is a superseded duplicate. |
| `app/logo.svg` | 484K (binary) | Not referenced anywhere. Unusually large for an SVG — looks like an auto-traced bitmap conversion with excessive path complexity, not a hand-authored vector. |
| `public/globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | 4K each | Default `create-next-app` scaffolding icons, never referenced. |

**Total dead source: ~552 lines across 8 `.ts`/`.tsx`/`.css` files, plus ~500KB of dead SVG/icon assets.** None of this is reachable from any route, so deleting it carries no behavior risk — it's pure cleanup.

Also at the repo root: `orenios-full-audit.zip` (2.8MB, untracked, not gitignored) is a stray snapshot archive dated July 15, predating most of the current codebase. Not code, but worth removing or explicitly gitignoring so it doesn't get committed by accident.

### 3.2 Duplicated logic

**"Get today's local date as YYYY-MM-DD" is implemented four separate times**, using two different algorithms that happen to both be correct but aren't shared:

- `app/dashboard/DashboardShell.tsx:20` (`getLocalDateString`) and `app/dashboard/FocusCard.tsx:15` (`getLocalDate`) — identical `now.getTimezoneOffset()` + `toISOString().split("T")[0]` approach (`FocusCard`'s is `DashboardShell`'s without the `daysOffset` parameter).
- `app/dashboard/TasksCard.tsx:42` (`getTodayDateKey`) and `app/dashboard/CalendarCard.tsx:40` (`getLocalDateKey`) — identical `getFullYear`/`getMonth`/`getDate` + manual `padStart` approach (`CalendarCard`'s takes a `date` parameter, `TasksCard`'s is hardcoded to `new Date()`).

Both algorithms produce the same result and both correctly avoid the classic `toISOString()`-on-a-UTC-Date bug — this isn't a correctness bug today. But four independent copies across four files means a future fix or behavior change (e.g. supporting a user-configurable timezone instead of the browser's) has to be found and applied four times. Recommend one shared `app/lib/date-utils.ts` export, e.g. `getLocalDateKey(date: Date = new Date()): string`.

**`getPriorityClasses` (`TasksCard.tsx:63`) and `getSummaryPriorityClasses` (`DashboardShell.tsx:1255`) are byte-for-byte identical** (same switch statement, same three Tailwind class strings for high/low/default priority). Same fix: one shared export.

**`TaskPriority` is defined independently in two places** with the same literal value but no shared source: `app/dashboard/TasksCard.tsx:13` (local, not exported) and `app/api/ai-coach/lib/types.ts:9` (exported). `EventCategory` similarly: `app/dashboard/CalendarCard.tsx:22` (derived from a local `categories` array) and `app/api/ai-coach/lib/types.ts:79` (explicit union). Both pairs currently agree in content, but nothing enforces that they stay in sync — if a category or priority level is ever added on one side and forgotten on the other, the AI Coach and the dashboard forms would silently disagree on what's valid. `GoalStatus` is the one case in the codebase that does this correctly: it's defined once in `app/lib/goal-state.ts` and re-exported (`export type GoalStatus = SharedGoalStatus`) from `app/api/ai-coach/lib/types.ts` — worth using as the template for the other two.

### 3.3 Missing error handling / partial-failure risk

`app/api/ai-coach/voice-plan/confirm/route.ts:126-203` loops over every parsed plan item and calls `insertTaskRow`/`insertEventRow` for each one, with **no per-item try/catch**. If item 3 of 5 throws (a transient DB error, a constraint violation, etc.), the whole route falls through to the outer `catch` at line 210 and returns a generic `{status: "error"}` — but items 1 and 2 were already successfully inserted. The client has no way to know that some items *did* land, and a naive retry (re-clicking Confirm) would re-submit the whole batch. This isn't a new discovery — it's the same gap `CLAUDE.md`'s own backlog already names under "Приоритет 3" ("Добавить request/action IDs и idempotency for AI actions, чтобы retry не создавал дубли и не повторял mutation после частичного успеха") — but it's still open in the current code and this is the exact route where it would bite first, since it's the only one that does a *batch* of writes in a loop rather than a single mutation.

### 3.4 Inconsistent patterns between modules

- **Notes support only `create_note` via AI Coach** — no `update_note`/`delete_note` tool exists in `app/api/ai-coach/lib/tools.ts`, and `note-actions.ts` only implements the create branch. Tasks, Goals, and Events all support create/update/delete (Goals and Tasks additionally support a complete/toggle action; Events don't, correctly, since events have no "completed" concept). This is internally consistent (no dead tool declarations, no half-wired handler), but it's a real capability gap a user might reasonably expect not to exist — "add a task", "delete a task", "update a task" all work by voice/chat, but "delete that note" doesn't. Worth a deliberate product decision rather than an accidental omission, since right now it reads as the latter.
- **Formatting inconsistency in `DashboardShell.tsx`**: line 4 has two import statements on one line with no line break (`import { useEffect, useState } from "react";import LogoutButton from "./LogoutButton";`), and lines 189-283 (inside the `DashboardShell` function body) are not indented one level relative to the function declaration, while the rest of the file (from line 285 on) is. Cosmetic only — it doesn't affect behavior and ESLint doesn't flag it (there's no Prettier config in this repo, so indentation isn't enforced) — but it's a visible sign of an edit that didn't get reformatted, and worth a quick pass with a formatter.

### 3.5 TODO / HACK / `any` scan

- **Zero** `TODO`, `FIXME`, `HACK`, or `XXX` comments anywhere in `app/` or `tests/`.
- **Zero** uses of `any` (`: any`, `as any`, `<any>`, `any[]`) anywhere in the codebase.
- **One** `eslint-disable` comment total, in `app/components/voice/VoiceAura.tsx:117`, for `react-hooks/exhaustive-deps` on a stable-ref array — legitimate and explained inline.
- **Zero** `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`.
- 21 uses of `unknown` (the type-safe alternative to `any`) across the codebase — deliberate type discipline, not a smell.

This is a genuinely clean result — worth stating plainly rather than downplaying it: there's no backlog of suppressed type errors or deferred fixes hiding in comments.

### 3.6 Client vs. server validation

- **Message length**: client (`app/dashboard/AICoach.tsx:987`, `.slice(0, 1000)` on every keystroke) and server (`app/api/ai-coach/route.ts:70`, `if (message.length > 1000)`) agree exactly.
- **Task title length**: client (`app/dashboard/TasksCard.tsx:415`, `maxLength={120}`) and the AI-path server validation (`app/api/ai-coach/lib/task-parsers.ts`, `validateTitle`, `if (title.length > 120)`) agree exactly.
- **Gap that couldn't be fully verified**: the dashboard's direct-to-Supabase forms (Tasks/Goals/Notes/Calendar "add" panels) enforce field limits via HTML `maxLength` attributes only — a client-side, trivially-bypassable constraint for anyone calling the Supabase REST API directly with their own valid session token (RLS would still stop them writing to *another user's* row, but not stop them writing an unbounded-length title to their *own* row). Whether there's a matching `CHECK` constraint or column type limit at the database level **could not be verified from this repository** — there are no `CREATE TABLE` migration files checked in (see §1), only two `ALTER TABLE`/RLS scripts. Recommend checking directly in the Supabase dashboard (`information_schema.columns` / `information_schema.check_constraints`) rather than assuming either way.

### 3.7 Positive findings worth stating plainly

- All five dashboard CRUD cards (`TasksCard`, `GoalsCard`, `NotesCard`, `CalendarCard`, `FocusCard`) use the **exact same** data-fetch pattern: a `cancelled` flag for effect cleanup, the same "Your session has expired" auth-check error message, and an explicit `.eq("user_id", user.id)` ownership filter on every single query. This is the kind of consistency that's easy to let drift across five separately-built components and it hasn't.
- `PROJECT_STATUS.md` (dated 15 July, stale — see below) claims "Some dashboard metrics are demo values" as a known open issue. Spot-checked `ProductivityScore` (`DashboardShell.tsx:997`) directly: it genuinely fetches today's tasks and computes a real completed/total ratio, not a hardcoded number. This matches the git history (commit `ef89104`, "remove fabricated dashboard stats") — the fix already shipped, the status doc just wasn't updated after.

### 3.8 Documentation / housekeeping drift

- `PROJECT_STATUS.md` is dated 15 July and describes Privacy/Terms as "placeholders" and dashboard metrics as "demo values" — both were fixed in later commits (`ef89104` and earlier). It also predates the entire Voice Day Planning feature and the visual-polish work. Either update it or remove it; as-is it will actively mislead anyone who reads it as current.
- `README.md` is the unmodified `create-next-app` template — no mention of Orenios, what the project is, or how to run it beyond the generic Next.js instructions. `CLAUDE.md` already has this on its own backlog ("Приоритет 5").
- `package.json`'s `"name"` field is still `"life-admin"` — also already on `CLAUDE.md`'s backlog, low risk (internal-only, not user-facing) but easy to fix alongside a README pass.

---

## 4. Security & data

### 4.1 Auth on every API route

| Route | Auth check | Result if unauthenticated |
|---|---|---|
| `POST /api/ai-coach` | `supabase.auth.getUser()`, checked at `route.ts:84-98` | `401` |
| `POST /api/ai-coach/voice-plan` | Same pattern, `route.ts:40-53` | `401` |
| `POST /api/ai-coach/voice-plan/confirm` | Same pattern, `route.ts:25-38` | `401` |
| `POST /api/waitlist` | **No user auth — by design.** This is the public signup endpoint for unauthenticated visitors. | N/A |
| `GET /auth/callback` | Not applicable (this *is* the auth flow); has its own protection — see §4.6 | — |

All three authenticated data routes check for a valid session before touching any user data. The waitlist route's lack of user auth is correct for its purpose (anyone should be able to join the waitlist) and is compensated by IP-based rate limiting instead (§4.3).

### 4.2 Ownership filters on every query

Checked every `.select()`/`.update()`/`.delete()`/`.insert()`/`.upsert()` call against the `tasks`, `goals`, `calendar_events`, `notes`, `daily_focus`, and `ai_messages` tables across:
- All 3 authenticated API routes (7 parallel reads in `/api/ai-coach`, 3 reads in `/confirm`, 1 read in `/voice-plan`)
- `app/api/ai-coach/lib/task-actions.ts`, `goal-actions.ts`, `event-actions.ts`, `note-actions.ts`, `focus-actions.ts` (every update/delete/upsert)
- All 5 dashboard cards' own fetch effects (`TasksCard`, `GoalsCard`, `NotesCard`, `CalendarCard`, `FocusCard`)

**Every single one carries an explicit `.eq("user_id", userId)`** (or, for `focus-actions.ts`'s upsert, `onConflict: "user_id,focus_date"` with `user_id` in the payload — equivalent protection for an upsert). No query relies solely on RLS as the only ownership boundary; the app-level filter is present everywhere as defense-in-depth on top of it. This matches what `PROJECT_STATUS.md` and `CLAUDE.md` already document as verified on production (RLS enabled on all 8 tables, 14/14 cross-user isolation checks passed) — nothing found here contradicts that.

### 4.3 Rate limits

Three limiters defined in `app/lib/rate-limit.ts`, all backed by Upstash Redis with sliding windows:

| Limiter | Limit | Keyed by | Used by |
|---|---|---|---|
| `waitlistRateLimit` | 5 / 10 min | IP address | `/api/waitlist` |
| `aiCoachRateLimit` | 15 / 1 min | user ID | `/api/ai-coach`, `/api/ai-coach/voice-plan/confirm` (deliberately reused — confirm makes no OpenAI call, so it shares the cheaper limit rather than the stricter voice one) |
| `voicePlanRateLimit` | 5 / 1 hour | user ID | `/api/ai-coach/voice-plan` (transcription + structured-output parsing is materially more expensive per call) |

All three routes that need one have one; the reasoning for which limiter applies where is documented inline in the confirm route and matches actual OpenAI-call cost. No route was found calling OpenAI or hitting the database without a rate limit in front of it.

### 4.4 No secrets in client code

Every `process.env.*` reference in the codebase was checked:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — used in `app/lib/supabase.ts` (the client-side Supabase client) and several server files. These are meant to be public by Supabase's own design (anon/publishable key, protected by RLS) and are correctly `NEXT_PUBLIC_`-prefixed.
- `OPENAI_API_KEY` — only referenced in `app/api/ai-coach/route.ts` and `app/api/ai-coach/voice-plan/route.ts`, both Next.js Route Handlers, which never ship to the client bundle.
- `SUPABASE_SERVICE_ROLE_KEY` — only referenced in `app/api/waitlist/route.ts`, also a Route Handler.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — read implicitly by `Redis.fromEnv()` inside `app/lib/rate-limit.ts`, which is only ever imported by the 4 server route files (confirmed — no `"use client"` file imports it).

No non-`NEXT_PUBLIC_` environment variable appears in any file marked `"use client"`. Clean.

### 4.5 Input validation on all endpoints

| Route | Validation |
|---|---|
| `/api/ai-coach` | Message is a non-empty string, ≤1000 chars (`route.ts:54-79`) |
| `/api/ai-coach/voice-plan` | Audio field is present, is a `File`, non-zero size, ≤`MAX_AUDIO_FILE_BYTES` (15MB) (`route.ts:76-98`); transcript/parsed-JSON both checked for empty/malformed before use |
| `/api/ai-coach/voice-plan/confirm` | Request body parsed defensively (`.catch(() => null)`), items re-validated server-side via `sanitizeParsedPlanItems` rather than trusting the client's edited list at all (`route.ts:65-77`) |
| `/api/waitlist` | Email is a string, regex-validated, lowercased/trimmed (`route.ts:51-61`) |

Every AI-tool-argument parser (`task-parsers.ts`, `goal-parsers.ts`, `event-parsers.ts`, `note-parsers.ts`, `focus-parsers.ts`) independently validates its own arguments (required fields, enum membership for priority/status/category, date format via `isValidDateKey`) before any of it reaches a database call — the model's raw JSON output is never trusted directly.

### 4.6 Other

- `app/auth/callback/route.ts` guards its post-login redirect target with `getSafeNextPath` (`callback/route.ts:4-10`), rejecting anything that doesn't start with `/` or that starts with `//` — correct open-redirect protection on the one place in the app that redirects based on a query parameter.
- `npm audit`: 2 moderate-severity findings, both the same PostCSS advisory nested inside `next`'s own dependency tree (`node_modules/next/node_modules/postcss`). No fix is available without `npm audit fix --force`, which would downgrade `next` to a `9.x` canary — not something to do. This matches what `CLAUDE.md` already documents and explicitly says not to force-fix. Unchanged, not actionable right now.
- `next.config.ts` has no security headers configured (no CSP, no HSTS, no `X-Frame-Options`) — an empty config object. Already on `CLAUDE.md`'s own backlog ("Приоритет 5"); still open.

---

## 5. Tests & quality gates

### 5.1 Coverage by module

All 43 tests live in a single file, `tests/ai-coach-logic.test.ts`, and are pure-function unit tests (no React rendering, no HTTP, no real Supabase/OpenAI calls — mocked or in-memory data throughout).

**Tested:**

| Module | Covered via |
|---|---|
| `app/api/ai-coach/lib/dates.ts` | `isValidDateKey` — "AI Coach date validation" |
| `app/api/ai-coach/lib/task-matcher.ts` | `normalizeTitle` — "AI Coach title normalization" |
| `app/api/ai-coach/lib/goal-matcher.ts` | `normalizeGoalTitle` |
| `app/lib/goal-state.ts` | `getGoalStatusForProgress`, `normalizeGoalState` — "goal status and progress invariants" |
| `app/api/ai-coach/lib/goal-parsers.ts` | `parseCreateGoalArguments`, `parseUpdateGoalArguments` |
| `app/api/ai-coach/lib/task-actions.ts` | `executeTaskAction` (direct) |
| `app/api/ai-coach/lib/event-actions.ts` | `executeEventAction` (direct) — including ambiguity handling |
| `app/api/ai-coach/lib/focus-actions.ts` | `executeFocusAction` (direct) — including progress-carry-over logic |
| `app/api/ai-coach/lib/safe-execute.ts` | `runActionSafely` — error handling |
| `app/api/ai-coach/lib/voice-plan/parse-response.ts` | `sanitizeParsedPlanItems` |
| `app/api/ai-coach/lib/voice-plan/conflicts.ts` | `detectConflicts`, `doTimeRangesOverlap` |
| `app/api/ai-coach/lib/voice-plan/linking.ts` | `buildLinkedContextNote` |

**Not tested:**

- **`app/api/ai-coach/lib/goal-actions.ts`'s `executeGoalAction` — this is the one specific, concrete gap worth calling out.** Every sibling module (`task-actions.ts`, `event-actions.ts`, `focus-actions.ts`) has its `execute*Action` function directly tested; `goal-actions.ts` does not, even though its parser (`goal-parsers.ts`) is. Goals support create/complete/delete/update via AI, same surface area as tasks — there's no reason this one is untested other than it was missed.
- `note-actions.ts`, `event-matcher.ts`, `event-parsers.ts`, `task-parsers.ts`, `note-parsers.ts`, `focus-parsers.ts` — not directly imported by the test file. Some of this logic is exercised *indirectly* through the `execute*Action` tests that call them internally, but there's no isolated, focused unit test for these parsers/matchers themselves.
- The actual HTTP route handlers (`route.ts` files) — zero integration/route-level tests anywhere. Nothing exercises a route with a mocked `Request`/`NextResponse` to verify status codes, auth-rejection behavior, or rate-limit responses end-to-end; all of §4's route-level findings were verified by reading the code, not by a test asserting it.
- **Every React component in the app — zero.** No React Testing Library, no component-render tests, no interaction tests anywhere in the repo. All UI correctness has historically been verified via manual/live browser testing during development, not automated tests.
- `app/lib/rate-limit.ts`, `app/lib/supabase*.ts` — thin wrappers, untested (reasonable to leave as-is; there's not much logic to test).

### 5.2 Quality gate results (run just now, on this exact commit)

| Gate | Result |
|---|---|
| `npm run lint` (ESLint) | ✅ **Pass** — zero errors, zero warnings |
| `npx tsc --noEmit` (TypeScript) | ✅ **Pass** — zero errors |
| `npm run test -- --run` (Vitest) | ✅ **Pass** — 43/43 tests, 1 file, ~180ms |
| `npm run build` (Next.js production build) | ✅ **Pass** — compiles cleanly, all 15 routes generated (7 static, 8 dynamic) |

All four gates are green on `main` right now. This is a genuinely healthy baseline to add new features on top of — the risk in this codebase is concentrated in file size/duplication (§2-3), not in broken or unverified builds.

---

## 6. Recommendations — prioritized

### Must fix before adding new features

1. **Fix the partial-failure gap in `/api/ai-coach/voice-plan/confirm`** (§3.3). This is the one place a genuine data-integrity bug can occur today (a batch write that can half-succeed with no way for the client to know), and it's already on the project's own backlog — closing it now is cheaper than after more features build on top of the voice-plan flow.
2. **Add test coverage for `executeGoalAction`** (§5.1) to restore parity with tasks/events/focus. A ten-minute gap to close, and goals are exactly as mutable via AI as tasks are.
3. **Split `DashboardShell.tsx` and `AICoach.tsx`** (§2.1, §2.2) before adding more to either. These are the two files most likely to keep growing as new dashboard widgets or new voice-recording behavior get added — splitting now is strictly cheaper than splitting after they're 2000+ lines.

### Should fix soon

4. **Delete the 8 confirmed-dead files** (§3.1) — zero risk, ~550 lines + ~500KB of dead assets removed in one pass.
5. **Consolidate the four duplicate "local date" helpers into one shared util** (§3.2) — low effort, removes a real (if currently harmless) source of future drift.
6. **Consolidate `TaskPriority`/`EventCategory` type definitions** to a single source of truth each, following the `GoalStatus` pattern already used correctly elsewhere (§3.2).
7. **Split the remaining oversized files**: `CalendarCard.tsx`, `NotesCard.tsx`, `TasksCard.tsx`, `GoalsCard.tsx`, `FocusCard.tsx` (§2.3, §2.5).
8. **Decide the Notes AI-action gap deliberately** (§3.4) — either implement `update_note`/`delete_note` or explicitly document that Notes are create-only by design, so it stops reading as an oversight.
9. **Documentation housekeeping**: update or remove `PROJECT_STATUS.md` (§3.8), replace `README.md`, rename `package.json`'s `"name"` away from `life-admin`.

### Can wait

10. Security headers/CSP in `next.config.ts` (§4.6) — not urgent pre-launch, but should happen before any real marketing push.
11. `metadataBase`, OG image, `sitemap.ts`, `robots.ts`, `manifest.ts` (SEO/PWA polish, already on `CLAUDE.md`'s own backlog, unrelated to this audit's scope but confirmed still missing).
12. The `npm audit` PostCSS moderate findings — no safe fix exists yet; revisit when `next` ships a version with the patched PostCSS, not before.
13. Split `tests/ai-coach-logic.test.ts` to mirror the source tree (§2.4) — nice for navigability, not urgent since the file itself isn't a maintainability problem the way an oversized component is.
14. The DashboardShell formatting inconsistency (§3.4) — cosmetic, fix opportunistically whenever that file is next touched (which will be soon, per recommendation #3).
