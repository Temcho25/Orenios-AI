"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Logo({ size = 140 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{
        duration: 0.8,
      }}
      className="relative"
    >
      {/* Glow */}

      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 blur-3xl"
      />

      {/* Logo */}

      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <Image
          src="/logo2.PNG"
          alt="Orenios AI"
          width={size}
          height={size}
          priority
          className="rounded-3xl shadow-2xl"
        />
      </motion.div>

    </motion.div>
  );
}