"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useState } from "react";
import AnimatedLogo from "./AnimatedLogo";
import OrbitalRings from "./OrbitalRings";

export default function ProductHero() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  function handleCardMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    rotateY.set(px * 12);
    rotateX.set(-py * 12);
  }

  function handleCardMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  function handleSpotlightMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const target =
      event.currentTarget.querySelector<HTMLDivElement>("[data-spotlight]");

    if (!target) return;

    target.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  async function handleJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to join the waitlist.");
      }

      setJoined(true);
      setEmail("");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="waitlist"
      className="relative isolate overflow-hidden bg-surface-dark"
    >
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/40 blur-[140px]"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, 40, 0], y: [0, 30, 0] }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute -right-32 top-[-60px] h-[550px] w-[550px] rounded-full bg-cyan-500/30 blur-[150px]"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, -30, 0], y: [0, 40, 0] }
          }
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <motion.div
          className="absolute bottom-[-220px] left-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-500/20 blur-[160px]"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, 25, 0], y: [0, -20, 0] }
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14 xl:gap-20">
          {/* Left side */}

          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              Orenios AI
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.16,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-zinc-400 sm:mt-5 sm:text-xs"
            >
              Your Life Admin
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-3 text-[2.5rem] font-black leading-[1.05] tracking-[-0.03em] text-white sm:mt-4 sm:text-5xl sm:leading-[1.02] sm:tracking-[-0.04em] lg:text-6xl xl:text-[64px]"
            >
              Tell Orenios about your day.
              <br />
              It organizes{" "}
              <span className="shimmer-a bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                everything
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.32,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300 sm:text-xl sm:leading-9 lg:mx-0"
            >
              Just talk naturally. Orenios turns it into tasks, a
              schedule and priorities, sets reminders, and keeps it all
              up to date as your day changes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.42,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {!joined ? (
                <>
                  <div
                    className="group relative mt-7 sm:mt-9"
                    onMouseMove={handleSpotlightMove}
                  >
                    <div
                      data-spotlight
                      className="pointer-events-none absolute -inset-2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                      style={{
                        background:
                          "radial-gradient(180px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(167,139,250,0.35), transparent 70%)",
                      }}
                    />

                    <form
                      onSubmit={handleJoin}
                      className="relative flex scroll-mt-24 flex-col gap-3 sm:flex-row sm:items-center"
                    >
                      <label className="w-full sm:flex-1">
                        <span className="sr-only">Email address</span>

                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          id="hero-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          required
                          placeholder="Enter your email"
                          className="h-14 w-full rounded-full border border-white/15 bg-white/95 px-5 text-base text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_35px_rgba(124,58,237,0.25)] outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-zinc-400 focus:border-violet-300 focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_4px_rgba(124,58,237,0.25),0_10px_35px_rgba(124,58,237,0.35)] sm:h-16"
                        />
                      </label>

                      <motion.button
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : { scale: 1.04, y: -2 }
                        }
                        whileTap={
                          prefersReducedMotion ? undefined : { scale: 0.97 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                        disabled={loading}
                        type="submit"
                        className="cta-sweep cta-sweep-a inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-8 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_16px_40px_rgba(124,58,237,0.35)] transition-colors duration-300 hover:from-violet-400 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60 sm:h-16 sm:px-10 sm:text-base"
                      >
                        {loading ? "Joining..." : "Join Waitlist"}
                      </motion.button>
                    </form>
                  </div>

                  <p className="mt-3 text-sm text-zinc-400">
                    No forms. No manual planning. Just one conversation.
                  </p>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-7 rounded-2xl border border-green-400/30 bg-green-500/10 p-5 text-left shadow-sm backdrop-blur-sm"
                >
                  <h3 className="text-lg font-bold text-green-300">
                    🎉 You&apos;re on the waitlist!
                  </h3>

                  <p className="mt-2 text-green-300/80">
                    Thanks! We&apos;ll email you before launch.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right side */}

          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mx-auto w-full max-w-[380px] sm:max-w-[440px] lg:mx-0 lg:max-w-[480px]"
          >
            {/* Glow behind card */}

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-violet-500/50 to-cyan-400/40 blur-[90px]"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scale: [1, 1.12, 1], opacity: [0.55, 0.8, 0.55] }
              }
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {!prefersReducedMotion && <OrbitalRings />}

            {/* Daily briefing card */}

            <motion.div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformPerspective: 800,
              }}
              animate={
                prefersReducedMotion ? undefined : { y: [0, -7, 0] }
              }
              transition={{
                duration: 6.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative rounded-[24px] border border-white/10 bg-white/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5 lg:rounded-[28px] lg:p-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="relative"
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : { y: [0, -2, 0] }
                    }
                    transition={{
                      duration: 5.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8,
                    }}
                  >
                    <motion.div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-violet-400/40 to-cyan-300/30 blur-xl"
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : { scale: [1, 1.18, 1], opacity: [0.4, 0.65, 0.4] }
                      }
                      transition={{
                        duration: 4.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.4,
                      }}
                    />

                    <AnimatedLogo className="h-[58px] w-[58px] sm:h-[72px] sm:w-[72px] lg:h-[86px] lg:w-[86px]" />
                  </motion.div>

                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Orenios AI
                    </p>

                    <p className="text-xs text-zinc-500">
                      Daily briefing
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 sm:px-3 sm:text-xs">
                  Synced
                </div>
              </div>

              <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2.5 text-sm sm:px-4 sm:py-3">
                  <span className="text-zinc-600">
                    Goals aligned
                  </span>

                  <span className="font-semibold text-zinc-900">
                    100%
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2.5 text-sm sm:px-4 sm:py-3">
                  <span className="text-zinc-600">
                    Calendar synced
                  </span>

                  <span className="font-semibold text-zinc-900">
                    Today
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2.5 text-sm sm:px-4 sm:py-3">
                  <span className="text-zinc-600">
                    Next best action
                  </span>

                  <span className="font-semibold text-zinc-900">
                    Review deck
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
