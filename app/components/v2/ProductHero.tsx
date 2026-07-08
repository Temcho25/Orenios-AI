"use client";
import FloatingCards from "./FloatingCards";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ProductHero() {
  return (
    <section className="mx-auto flex min-h-[90vh] max-w-7xl items-center px-6">

      <div className="grid w-full items-center gap-16 lg:grid-cols-2">

        {/* Left */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >

          <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
            ✨ The Operating System for your Life
          </div>

          <h1 className="mt-8 text-6xl font-black leading-tight text-black md:text-7xl">
            Organize
            <br />
            Everything.
          </h1>

          <p className="mt-8 max-w-xl text-xl leading-9 text-gray-600">
            Orenios AI brings together your goals, tasks, notes,
            calendar and intelligent AI assistant into one beautiful workspace.
          </p>

          <div className="mt-10 flex gap-4">

            <a
              href="#waitlist"
              className="rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:scale-105"
            >
              Join Waitlist
            </a>

            <a
              href="#preview"
              className="rounded-full border border-gray-300 px-8 py-4 font-semibold transition hover:bg-gray-50"
            >
              See Preview
            </a>

          </div>

        </motion.div>

        {/* Right */}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >

          <div className="absolute inset-0 rounded-[40px] bg-gradient-to-r from-violet-500/30 to-cyan-400/30 blur-3xl" />

          <div className="relative overflow-hidden rounded-[40px] border border-gray-200 bg-white p-8 shadow-2xl">

            <Image
              src="/logo.PNG"
              alt="Orenios AI"
              width={80}
              height={80}
              className="rounded-2xl"
            />

            <h2 className="mt-6 text-3xl font-bold">
              Orenios AI
            </h2>

            <p className="mt-2 text-gray-500">
              Your intelligent life workspace.
            </p>

            <div className="mt-10 space-y-4">

              <div className="rounded-2xl bg-violet-50 p-5">
                🎯 Goals synchronized
              </div>

              <div className="rounded-2xl bg-cyan-50 p-5">
                ✅ Tasks prioritized
              </div>

              <div className="rounded-2xl bg-green-50 p-5">
                🤖 AI planning your day
              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}