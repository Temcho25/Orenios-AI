"use client";

import Link from "next/link";

export default function Footer() {
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
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">

        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-600">
          Orenios AI
        </p>

        <h2 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
          Organize your life.
          <br />
          One AI.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
          Built for people who want one intelligent place for goals,
          tasks, notes and daily planning.
        </p>

        <a
          href="#"
          onClick={scrollToWaitlist}
          className="mt-10 inline-flex rounded-full bg-zinc-900 px-8 py-4 text-lg font-semibold text-white transition hover:-translate-y-1 hover:bg-zinc-800"
        >
          Join Waitlist
        </a>

        <div className="mt-20 border-t border-zinc-200 pt-8">

          <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-500">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:hello@orenios.com">Contact</a>
          </div>

          <p className="mt-6 text-sm text-zinc-400">
            © 2026 Orenios AI. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}