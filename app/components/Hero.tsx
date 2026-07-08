"use client";

import Logo from "./Logo";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24">

      {/* Background Blur */}

      <div className="absolute left-1/2 top-20 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[140px]" />

      <div className="absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-cyan-400/20 blur-[120px]" />

      <div className="absolute left-0 bottom-0 h-[320px] w-[320px] rounded-full bg-fuchsia-500/20 blur-[120px]" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">

        <motion.div
          initial={{ opacity: 0, scale: .9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: .7 }}
        >
          <Logo size={150}/>
        </motion.div>

        <motion.div
          initial={{ opacity:0,y:20 }}
          animate={{ opacity:1,y:0 }}
          transition={{ delay:.2 }}
          className="mt-8 rounded-full glass px-6 py-3 text-sm text-gray-600"
        >
          ✨ AI that organizes your entire life
        </motion.div>

        <motion.h1
          initial={{ opacity:0,y:30 }}
          animate={{ opacity:1,y:0 }}
          transition={{ delay:.35 }}
          className="mt-10 text-7xl font-black tracking-tight md:text-8xl"
        >
          Orenios AI
        </motion.h1>

        <motion.h2
          initial={{ opacity:0,y:30 }}
          animate={{ opacity:1,y:0 }}
          transition={{ delay:.45 }}
          className="mt-5 text-3xl text-gray-500"
        >
          Your Life Admin
        </motion.h2>

        <motion.p
          initial={{ opacity:0,y:30 }}
          animate={{ opacity:1,y:0 }}
          transition={{ delay:.55 }}
          className="mt-8 max-w-3xl text-xl leading-9 text-gray-600"
        >
          One intelligent AI that manages your tasks,
          goals, notes, routines, calendar and everything
          else — all in one beautiful workspace.
        </motion.p>

        <motion.div
          initial={{ opacity:0,y:30 }}
          animate={{ opacity:1,y:0 }}
          transition={{ delay:.65 }}
          className="mt-12 flex gap-5"
        >

          <a
            href="#waitlist"
            className="rounded-full bg-black px-8 py-4 text-lg font-semibold text-white transition hover:scale-105"
          >
            Join Waitlist
          </a>

          <a
            href="#features"
            className="rounded-full glass px-8 py-4 text-lg font-semibold"
          >
            Learn More
          </a>

        </motion.div>

      </div>

    </section>
  );
}