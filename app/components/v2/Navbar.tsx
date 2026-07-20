"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import AnimatedLogo from "./AnimatedLogo";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  useEffect(() => {
    if (!isMenuOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const refreshPage = () => {
    window.location.reload();
  };

  const closeMenu = () => setIsMenuOpen(false);

  const mobileLinks = [
    { href: "#demo", label: "See it work" },
    { href: "#compare", label: "Why different" },
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 w-full px-3 sm:px-4">
        <motion.div
          animate={{
            marginTop: isScrolled ? 10 : 16,
            paddingTop: isScrolled ? 8 : 12,
            paddingBottom: isScrolled ? 8 : 12,
            scale: isScrolled ? 0.98 : 1,
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-gray-200/60 bg-white px-3 transition-shadow duration-300 sm:px-6 ${
            isScrolled
              ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_20px_45px_rgba(15,23,42,0.12)]"
              : "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_30px_rgba(15,23,42,0.06)]"
          }`}
        >
          <button
            type="button"
            onClick={refreshPage}
            aria-label="Refresh Orenios AI"
            className="flex items-center gap-3 text-left"
          >
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
              className="drop-shadow-[0_0_20px_rgba(124,58,237,0.35)]"
            >
              <AnimatedLogo
                className={`transition-all duration-300 ${
                  isScrolled
                    ? "h-11 w-11 sm:h-12 sm:w-12"
                    : "h-12 w-12 sm:h-14 sm:w-14 lg:h-[70px] lg:w-[70px]"
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
              href="#demo"
              className="transition hover:text-black"
            >
              See it work
            </a>

            <a
              href="#compare"
              className="transition hover:text-black"
            >
              Why different
            </a>
          </nav>

          <motion.a
            href="#waitlist"
            whileHover={
              prefersReducedMotion ? undefined : { scale: 1.06, y: -2 }
            }
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="inline-flex min-h-[44px] items-center rounded-full bg-black px-4 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition-shadow duration-300 active:shadow-[0_16px_35px_rgba(15,23,42,0.28)] sm:px-6 sm:py-3 sm:text-sm md:hover:shadow-[0_16px_35px_rgba(15,23,42,0.28)]"
          >
            <span className="sm:hidden">Join</span>
            <span className="hidden sm:inline">Join Waitlist</span>
          </motion.a>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-black transition active:bg-black/5 md:hidden"
          >
            <div className="relative flex h-4 w-5 flex-col justify-between">
              <motion.span
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                  y: isMenuOpen ? 7 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="block h-[2px] w-full rounded-full bg-current"
              />
              <motion.span
                animate={{ opacity: isMenuOpen ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                className="block h-[2px] w-full rounded-full bg-current"
              />
              <motion.span
                animate={{
                  rotate: isMenuOpen ? -45 : 0,
                  y: isMenuOpen ? -7 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="block h-[2px] w-full rounded-full bg-current"
              />
            </div>
          </button>
        </motion.div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-2 flex max-w-7xl flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.16)] md:hidden"
            >
              {mobileLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex min-h-[48px] items-center rounded-xl px-4 text-base font-medium text-gray-800 transition active:bg-black/5"
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="h-[92px] sm:h-[112px] lg:h-[130px]" aria-hidden="true" />
    </>
  );
}