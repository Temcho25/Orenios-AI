"use client";

import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="sticky top-5 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/50 glass px-6 py-4 shadow-lg">

        <div className="flex items-center gap-3">
          <Logo size={42} />

          <div>
            <h1 className="text-lg font-bold text-black">
              Orenios AI
            </h1>

            <p className="text-xs text-gray-500">
              Your Life Admin
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">

          <a href="#features" className="transition hover:text-black">
            Features
          </a>

          <a href="#waitlist" className="transition hover:text-black">
            Waitlist
          </a>

        </nav>

        <a
          href="#waitlist"
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
        >
          Join Waitlist
        </a>

      </div>
    </header>
  );
}