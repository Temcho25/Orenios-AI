"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";
import AnimatedLogo from "../components/v2/AnimatedLogo";

type OnboardingFlowProps = {
  userId: string;
  firstName: string;
};

type FocusValue = "work" | "study" | "personal" | "everything";

type CreatedTask = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  due_date: string | null;
};

const focusOptions: { value: FocusValue; label: string }[] = [
  { value: "work", label: "Work & projects" },
  { value: "study", label: "Studying" },
  { value: "personal", label: "Personal life" },
  { value: "everything", label: "A bit of everything" },
];

const placeholderByFocus: Record<FocusValue, string> = {
  work: "e.g. Project meeting Thursday at 3pm",
  study: "e.g. Finish reading chapter 4 by Friday",
  personal: "e.g. Book a dentist appointment next week",
  everything: "e.g. Call mom this weekend",
};

function getBrowserTimeZone() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
    return timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function formatDueDate(date: string | null) {
  if (!date) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getPriorityClasses(priority: CreatedTask["priority"]) {
  switch (priority) {
    case "high":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "low":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }
}

function StepShell({
  children,
  onSkip,
  step,
}: {
  children: ReactNode;
  onSkip?: () => void;
  step: number;
}) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-surface-dark-card px-6 py-10 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12"
    >
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="absolute right-5 top-5 rounded-full px-3 py-1.5 text-xs font-medium text-white/40 transition hover:bg-white/5 hover:text-white/70 sm:right-7 sm:top-7"
        >
          Skip
        </button>
      )}

      <div className="mb-8 flex items-center justify-center gap-1.5">
        {[1, 2, 3, 4].map((dot) => (
          <span
            key={dot}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              dot === step
                ? "w-6 bg-gradient-to-r from-accent-violet to-accent-cyan"
                : dot < step
                  ? "w-1.5 bg-accent-violet/50"
                  : "w-1.5 bg-white/10"
            }`}
          />
        ))}
      </div>

      {children}
    </motion.div>
  );
}

export default function OnboardingFlow({
  userId,
  firstName,
}: OnboardingFlowProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [focus, setFocus] = useState<FocusValue | null>(null);
  const [completing, setCompleting] = useState(false);

  const [demoMessage, setDemoMessage] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoAttempted, setDemoAttempted] = useState(false);
  const [createdTask, setCreatedTask] = useState<CreatedTask | null>(null);
  const [demoError, setDemoError] = useState("");

  async function completeOnboarding() {
    setCompleting(true);

    try {
      const supabase = createClient();

      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);
    } finally {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function goToDemoStep() {
    const supabase = createClient();

    if (focus) {
      await supabase
        .from("profiles")
        .update({ onboarding_focus: focus })
        .eq("id", userId);
    }

    setStep(3);
  }

  async function runDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = demoMessage.trim();

    if (!trimmedMessage || demoLoading) {
      return;
    }

    setDemoLoading(true);
    setDemoError("");

    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          timeZone: getBrowserTimeZone(),
        }),
      });

      const data = (await response.json()) as {
        action?: string | null;
      };

      if (response.ok && data.action === "create_task") {
        const supabase = createClient();

        const { data: latestTask } = await supabase
          .from("tasks")
          .select("id, title, priority, due_date")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestTask) {
          setCreatedTask(latestTask as CreatedTask);
        }
      }
    } catch {
      // Soft-fail by design — the demo attempt banner below handles this.
    } finally {
      setDemoAttempted(true);
      setDemoLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface-dark px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-violet-600/30 blur-[130px]" />
        <div className="absolute -right-24 bottom-[-160px] h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[140px]" />
      </div>

      <div className="relative mb-8 flex items-center gap-3 sm:absolute sm:left-8 sm:top-8 sm:mb-0">
        <AnimatedLogo className="h-9 w-9" />
        <span className="text-sm font-bold tracking-[-0.02em] text-white">
          Orenios AI
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepShell
            step={1}
            onSkip={completeOnboarding}
          >
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
                Welcome
              </p>

              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
                Welcome to Orenios, {firstName}.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
                Orenios isn&apos;t just another chat window. It creates
                tasks, tracks goals and plans your day for you — AI does
                the work, not just the talking.
              </p>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="cta-gradient mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-8 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.35)] transition hover:scale-[1.02]"
              >
                Get started
              </button>
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            step={2}
            onSkip={completeOnboarding}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-3xl">
                What matters most to you right now?
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/55">
                This helps Orenios tailor suggestions to what you&apos;re
                actually juggling.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {focusOptions.map((option) => {
                  const isSelected = focus === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFocus(option.value)}
                      className={`rounded-2xl border px-5 py-4 text-left text-sm font-medium transition ${
                        isSelected
                          ? "border-accent-violet/50 bg-gradient-to-r from-accent-violet/20 to-accent-cyan/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!focus}
                onClick={goToDemoStep}
                className="cta-gradient mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-8 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.35)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                Continue
              </button>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell step={3}>
            <div className="text-center">
              <h2 className="text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-3xl">
                See Orenios in action
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/55">
                Try it for real — type what&apos;s on your mind and watch
                Orenios turn it into a task.
              </p>

              {!demoAttempted && (
                <form
                  onSubmit={runDemo}
                  className="mt-8 space-y-3 text-left"
                >
                  <input
                    type="text"
                    value={demoMessage}
                    onChange={(event) =>
                      setDemoMessage(event.target.value)
                    }
                    placeholder={placeholderByFocus[focus ?? "everything"]}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent-violet/50"
                  />

                  <button
                    type="submit"
                    disabled={!demoMessage.trim() || demoLoading}
                    className="cta-gradient flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.3)] transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {demoLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating...
                      </span>
                    ) : (
                      "Create it"
                    )}
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => setDemoAttempted(true)}
                      className="text-xs font-medium text-white/35 underline-offset-2 transition hover:text-white/60 hover:underline"
                    >
                      Skip this step
                    </button>
                  </div>
                </form>
              )}

              {demoAttempted && (
                <div className="mt-8 space-y-5">
                  {createdTask ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-mint">
                        Task created
                      </p>

                      <p className="mt-2 text-base font-semibold text-white">
                        {createdTask.title}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${getPriorityClasses(
                            createdTask.priority
                          )}`}
                        >
                          {createdTask.priority}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/50">
                          {formatDueDate(createdTask.due_date)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-sm leading-6 text-white/55">
                      No worries — we&apos;ll get the hang of it inside.
                      Orenios works best once you start using it for real.
                    </div>
                  )}

                  {demoError && (
                    <p className="text-xs text-red-300">{demoError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="cta-gradient inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-8 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.35)] transition hover:scale-[1.02]"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            step={4}
            onSkip={completeOnboarding}
          >
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-mint/15 text-accent-mint">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="mt-6 text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-3xl">
                {createdTask
                  ? "You created your first task with AI."
                  : "You're all set."}
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/55">
                {createdTask
                  ? "This is exactly how Orenios works going forward — tell it what's on your mind, and it handles the rest."
                  : "Head to your dashboard — Orenios is ready whenever you are."}
              </p>

              <button
                type="button"
                disabled={completing}
                onClick={completeOnboarding}
                className="cta-gradient mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-8 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,111,240,0.35)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {completing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Loading...
                  </span>
                ) : (
                  "Go to Dashboard"
                )}
              </button>
            </div>
          </StepShell>
        )}
      </AnimatePresence>
    </main>
  );
}
