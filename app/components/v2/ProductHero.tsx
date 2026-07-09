"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function ProductHero() 
{
  const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [joined, setJoined] = useState(false);

async function handleJoin(e: React.FormEvent) {
  e.preventDefault();

  if (!email.includes("@")) {
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
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    setJoined(true);
    setEmail("");

  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  } finally {
    setLoading(false);
  }
}
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#fafaf9_0%,#f8fafc_100%)]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-zinc-900/5 blur-[140px]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid w-full items-center gap-8 sm:gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              Orenios AI
            </div>

            <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-zinc-500 sm:mt-5 sm:text-xs">
              Your Life Admin
            </p>

            <h1 className="mt-3 text-4xl font-semibold leading-[0.95] tracking-[-0.03em] text-zinc-950 sm:mt-4 sm:text-5xl lg:text-7xl">
              Your AI Life Admin
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-600 sm:mt-5 sm:text-lg lg:mx-0">
              One AI that remembers your goals, organizes your tasks, plans your day and keeps everything connected.
            </p>

            <form
  onSubmit={handleJoin}
  className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center"
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
                  className="h-12 w-full rounded-full border border-zinc-200 bg-white/90 px-4 text-sm text-zinc-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)] outline-none transition duration-300 placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                />
              </label>

              <button
  disabled={loading}
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-6 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </button>
            </form>
            {joined && (
  <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 p-5">
    <h3 className="text-lg font-bold text-green-700">
      🎉 You're on the waitlist!
    </h3>

    <p className="mt-2 text-green-600">
      Thanks! We'll email you before launch.
    </p>
  </div>
)}

            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-600 lg:justify-start">
              <span className="text-amber-500" aria-hidden="true">
                ★★★★★
              </span>
              <span>Trusted by 3000+ early users</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[420px] sm:max-w-[480px] lg:mx-0 lg:max-w-[560px]"
          >
            <div className="relative mx-auto h-[320px] w-full max-w-[360px] sm:h-[420px] sm:max-w-[440px] lg:h-[560px] lg:max-w-[520px]">
              <motion.div
                animate={{ y: [0, -7, 0], rotate: [0, 0.35, 0] }}
                transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="absolute left-0 top-2 w-[92%] rounded-[24px] border border-zinc-200/80 bg-white/90 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:top-4 sm:w-[88%] sm:p-4 lg:left-2 lg:top-4 lg:w-[88%] lg:rounded-[28px] lg:p-5"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 sm:pb-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo.PNG"
                      alt="Orenios AI"
                      width={40}
                      height={40}
                      className="rounded-full shadow-md"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Orenios AI</p>
                      <p className="text-xs text-zinc-500">Daily briefing</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 sm:px-3 sm:text-xs">
                    Synced
                  </div>
                </div>

                <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2.5 text-sm sm:px-4 sm:py-3">
                    <span className="text-zinc-600">Goals aligned</span>
                    <span className="font-semibold text-zinc-900">100%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2.5 text-sm sm:px-4 sm:py-3">
                    <span className="text-zinc-600">Calendar synced</span>
                    <span className="font-semibold text-zinc-900">Today</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2.5 text-sm sm:px-4 sm:py-3">
                    <span className="text-zinc-600">Next best action</span>
                    <span className="font-semibold text-zinc-900">Review deck</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="absolute right-0 top-20 w-[72%] rounded-[20px] border border-zinc-200/80 bg-zinc-950/95 p-4 text-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:top-24 sm:p-5 lg:top-24 lg:rounded-[24px]"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-400 sm:text-xs">Focus score</p>
                <div className="mt-2 flex items-end justify-between sm:mt-3">
                  <span className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">92%</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-zinc-300 sm:px-3 sm:text-xs">
                    steady
                  </span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.7, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="absolute bottom-3 left-3 w-[78%] rounded-[20px] border border-zinc-200/80 bg-white/95 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:bottom-4 sm:left-4 sm:w-[74%] sm:p-4 lg:bottom-6 lg:left-6 lg:rounded-[24px] lg:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">AI assistant</p>
                    <p className="text-sm text-zinc-500">Everything is in order.</p>
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