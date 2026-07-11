"use client";

import { motion } from "framer-motion";
import Image from "next/image";
export default function FloatingCards() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative h-[620px] w-[560px]"
    >
      {/* Glow */}

      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 blur-[120px]" />

      {/* Main Window */}

      <motion.div
        whileHover={{
          y: -8,
          scale: 1.02,
        }}
        transition={{ duration: 0.3 }}
        className="absolute right-0 top-6 w-[470px] overflow-hidden rounded-[38px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.12)]"
      >
        {/* Header */}

        <div className="border-b border-gray-100 px-8 py-6">

          <div className="flex items-center gap-5">

            <motion.div
  animate={{
    y: [0, -6, 0],
    scale: [1, 1.03, 1],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  }}
  className="drop-shadow-[0_0_25px_rgba(124,58,237,0.35)]"
>
  <Image
    src="/logo2.PNG"
    alt="Orenios AI"
    width={64}
    height={64}
    className="rounded-full"
  />
</motion.div>

            <div>

              <h2 className="text-2xl font-bold">
                Orenios AI
              </h2>

              <p className="text-gray-500">
                Your Life Admin
              </p>

            </div>

          </div>

        </div>

        {/* Cards */}

        <div className="space-y-4 p-8">

          <div className="flex items-center justify-between rounded-2xl bg-violet-50 p-5">
            <span>🎯 Goals synchronized</span>
            <span className="font-bold text-violet-600">
              100%
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-cyan-50 p-5">
            <span>📅 Calendar organized</span>
            <span className="font-bold text-cyan-600">
              Today
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-green-50 p-5">
            <span>✅ Tasks prioritized</span>
            <span className="font-bold text-green-600">
              Ready
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-orange-50 p-5">
            <span>🧠 AI Memory updated</span>
            <span className="font-bold text-orange-500">
              Live
            </span>
          </div>

        </div>

      </motion.div>

      {/* Focus Card */}

      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
        }}
        className="absolute left-0 top-40 rounded-[30px] bg-black px-9 py-8 text-white shadow-2xl"
      >
        <p className="text-sm text-gray-400">
          Focus Score
        </p>

        <h2 className="mt-3 text-6xl font-black">
          92%
        </h2>

      </motion.div>

      {/* AI Card */}

      <motion.div
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
        }}
        className="absolute bottom-2 right-6 rounded-[30px] bg-gradient-to-r from-violet-600 to-cyan-500 px-9 py-8 text-white shadow-[0_30px_80px_rgba(124,58,237,0.35)]"
      >
        <p className="text-sm opacity-80">
          AI Assistant
        </p>

        <h3 className="mt-2 text-2xl font-bold">
          Everything is organized.
        </h3>

      </motion.div>

    </motion.div>
  );
}