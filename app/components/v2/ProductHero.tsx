"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function ProductHero() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

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
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,rgba(250,250,249,0.72)_0%,rgba(248,250,252,0.48)_100%)]"
    >
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14 xl:gap-20">
          {/* Left side */}

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
              Orenios AI
            </div>

            <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-zinc-500 sm:mt-5 sm:text-xs">
              Your Life Admin
            </p>

            <h1 className="mt-3 text-5xl font-black leading-[0.9] tracking-[-0.05em] text-zinc-950 sm:mt-4 sm:text-6xl lg:text-[82px] xl:text-[92px]">
              Your AI Life Admin
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-600 sm:text-xl sm:leading-9 lg:mx-0">
              One AI that remembers your goals, organizes your tasks, plans
              your day and keeps everything connected.
            </p>

            {!joined ? (
              <form
                onSubmit={handleJoin}
                className="mt-7 flex scroll-mt-24 flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center"
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
                    className="h-14 w-full rounded-full border border-zinc-200 bg-white/90 px-5 text-base text-zinc-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)] outline-none transition duration-300 placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 sm:h-16"
                  />
                </label>

                <button
                  disabled={loading}
                  type="submit"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-8 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-700 hover:to-cyan-600 hover:shadow-[0_20px_50px_rgba(124,58,237,0.3)] focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60 sm:h-16 sm:px-10 sm:text-base"
                >
                  {loading ? "Joining..." : "Join Waitlist"}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-7 rounded-2xl border border-green-200 bg-green-50/90 p-5 text-left shadow-sm"
              >
                <h3 className="text-lg font-bold text-green-700">
                  🎉 You&apos;re on the waitlist!
                </h3>

                <p className="mt-2 text-green-600">
                  Thanks! We&apos;ll email you before launch.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right side */}

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto w-full max-w-[440px] sm:max-w-[500px] lg:mx-0 lg:max-w-[590px]"
          >
            <div className="relative mx-auto h-[340px] w-full max-w-[390px] sm:h-[450px] sm:max-w-[470px] lg:h-[590px] lg:max-w-[550px]">
              {/* Daily briefing card */}

              <motion.div
                animate={{
                  y: [0, -7, 0],
                  rotate: [0, 0.35, 0],
                }}
                transition={{
                  duration: 6.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  y: -5,
                  scale: 1.01,
                }}
                className="absolute left-0 top-2 w-[92%] rounded-[24px] border border-zinc-200/80 bg-white/90 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:top-4 sm:w-[88%] sm:p-4 lg:left-2 lg:top-4 lg:w-[88%] lg:rounded-[28px] lg:p-5"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 sm:pb-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo2.PNG"
                      alt="Orenios AI"
                      width={70}
                      height={70}
                      className="h-[58px] w-[58px] object-contain sm:h-[72px] sm:w-[72px] lg:h-[86px] lg:w-[86px]"
                      loading="eager"
                    />

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

              {/* Focus score card */}

              <motion.div
                animate={{
                  y: [0, 8, 0],
                }}
                transition={{
                  duration: 5.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  y: -4,
                  scale: 1.01,
                }}
                className="absolute right-0 top-20 w-[72%] rounded-[20px] border border-zinc-200/80 bg-zinc-950/95 p-4 text-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:top-28 sm:p-5 lg:top-32 lg:rounded-[24px]"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-400 sm:text-xs">
                  Focus score
                </p>

                <div className="mt-2 flex items-end justify-between sm:mt-3">
                  <span className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                    92%
                  </span>

                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-zinc-300 sm:px-3 sm:text-xs">
                    steady
                  </span>
                </div>
              </motion.div>

              {/* AI assistant card */}

              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 4.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  y: -4,
                  scale: 1.01,
                }}
                className="absolute bottom-3 left-3 w-[78%] rounded-[20px] border border-zinc-200/80 bg-white/95 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:bottom-4 sm:left-4 sm:w-[74%] sm:p-4 lg:bottom-6 lg:left-6 lg:rounded-[24px] lg:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      AI assistant
                    </p>

                    <p className="text-sm text-zinc-500">
                      Everything is in order.
                    </p>
                  </div>

                  <div className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 sm:px-3 sm:text-xs">
                    Organized
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}