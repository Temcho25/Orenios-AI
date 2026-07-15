"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 w-full px-4">
        <motion.div
          animate={{
            marginTop: isScrolled ? 10 : 24,
            paddingTop: isScrolled ? 10 : 16,
            paddingBottom: isScrolled ? 10 : 16,
            scale: isScrolled ? 0.98 : 1,
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-gray-200/60 px-4 backdrop-blur-xl transition-shadow duration-300 sm:px-6 ${
            isScrolled
              ? "bg-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_20px_45px_rgba(15,23,42,0.12)]"
              : "bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_30px_rgba(15,23,42,0.06)]"
          }`}
        >
          <button
            type="button"
            onClick={refreshPage}
            aria-label="Refresh Orenios AI"
            className="flex items-center gap-3 text-left"
          >
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className={`pointer-events-none absolute -inset-2 ${
                  prefersReducedMotion ? "" : "logo-spin"
                }`}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="47"
                  fill="none"
                  stroke="url(#navbar-orbit)"
                  strokeWidth="1"
                  strokeDasharray="1 6"
                />
                <defs>
                  <linearGradient
                    id="navbar-orbit"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
                    <stop
                      offset="100%"
                      stopColor="#22c3ff"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
              </svg>

              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, -5, 0], scale: [1, 1.03, 1] }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative drop-shadow-[0_0_20px_rgba(124,58,237,0.35)]"
              >
                <Image
                  src="/logo2.PNG"
                  alt="Orenios AI"
                  width={70}
                  height={70}
                  priority
                  className={`rounded-full transition-all duration-300 ${
                    isScrolled
                      ? "h-12 w-12"
                      : "h-14 w-14 sm:h-[70px] sm:w-[70px]"
                  }`}
                />
              </motion.div>
            </div>

            <div>
              <h2 className="text-base font-bold text-black sm:text-lg">
                Orenios AI
              </h2>

              <p className="hidden text-xs text-gray-500 sm:block">
                Your Life Admin
              </p>
            </div>
          </button>

          <nav className="hidden items-center gap-10 text-sm font-medium text-gray-600 md:flex">
            <a
              href="#waitlist"
              className="transition hover:text-black"
            >
              Join Waitlist
            </a>

            <a
              href="#features"
              className="transition hover:text-black"
            >
              Features
            </a>

            <a
              href="#preview"
              className="transition hover:text-black"
            >
              Preview
            </a>
          </nav>

          <motion.a
            href="#waitlist"
            whileHover={
              prefersReducedMotion ? undefined : { scale: 1.06, y: -2 }
            }
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="rounded-full bg-black px-4 py-2.5 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition-shadow duration-300 hover:shadow-[0_16px_35px_rgba(15,23,42,0.28)] sm:px-6 sm:py-3 sm:text-sm"
          >
            Join Waitlist
          </motion.a>
        </motion.div>
      </header>

      <div className="h-[118px] sm:h-[130px]" aria-hidden="true" />
    </>
  );
}