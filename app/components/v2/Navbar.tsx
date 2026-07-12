"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

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
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-gray-200/70 px-4 backdrop-blur-xl transition-shadow duration-300 sm:px-6 ${
            isScrolled
              ? "bg-white/95 shadow-lg"
              : "bg-white/80 shadow-sm"
          }`}
        >
          <button
            type="button"
            onClick={refreshPage}
            aria-label="Refresh Orenios AI"
            className="flex items-center gap-3 text-left"
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="drop-shadow-[0_0_20px_rgba(124,58,237,0.35)]"
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

          <a
            href="#waitlist"
            className="rounded-full bg-black px-4 py-2.5 text-xs font-semibold text-white transition hover:scale-105 sm:px-6 sm:py-3 sm:text-sm"
          >
            Join Waitlist
          </a>
        </motion.div>
      </header>

      <div className="h-[118px] sm:h-[130px]" aria-hidden="true" />
    </>
  );
}