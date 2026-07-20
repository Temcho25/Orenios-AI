"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  const prefersReducedMotion = useReducedMotion();

  const scrollToWaitlist = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const section = document.getElementById("waitlist");

    if (!section) return;

    const top =
      section.getBoundingClientRect().top + window.scrollY - 180;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative overflow-hidden pb-12 pt-4">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, y: 28 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
          }
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[40px] border border-white/10 bg-surface-dark-card px-6 py-16 text-center text-white shadow-[0_40px_100px_rgba(15,23,42,0.35)] sm:px-12 sm:py-20"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-violet-600/30 blur-[140px]" />
            <div className="absolute -bottom-24 right-0 h-[360px] w-[360px] rounded-full bg-cyan-500/25 blur-[130px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)
                `,
                backgroundSize: "56px 56px",
              }}
            />
          </div>

          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-300">
              Orenios AI
            </p>

            <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
              Spend less time planning.
              <br />
              Spend more time living.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Your AI shouldn&apos;t just answer questions. It should
              organize your life.
            </p>

            <span className="relative mt-10 inline-block">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-500/50 to-cyan-400/50 blur-2xl"
              />

              <a
                href="#"
                onClick={scrollToWaitlist}
                className="inline-flex min-h-[44px] items-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-8 py-4 text-lg font-semibold text-white shadow-[0_20px_45px_rgba(124,58,237,0.35)] transition-all duration-300 hover:-translate-y-1 hover:from-violet-400 hover:to-cyan-300 hover:shadow-[0_26px_55px_rgba(124,58,237,0.45)] active:from-violet-400 active:to-cyan-300 active:shadow-[0_26px_55px_rgba(124,58,237,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark-card"
              >
                Join Waitlist
              </a>
            </span>
          </div>
        </motion.div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <div className="flex flex-wrap justify-center gap-2 text-sm text-zinc-400 sm:gap-6">
            <Link
              href="/privacy"
              className="flex min-h-[44px] items-center px-3 transition hover:text-white active:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="flex min-h-[44px] items-center px-3 transition hover:text-white active:text-white"
            >
              Terms
            </Link>
            <a
              href="mailto:hello@orenios.com"
              className="flex min-h-[44px] items-center px-3 transition hover:text-white active:text-white"
            >
              Contact
            </a>
          </div>

          <p className="mt-6 text-sm text-zinc-500">
            © 2026 Orenios AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
