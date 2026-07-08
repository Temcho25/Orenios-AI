"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-6 flex max-w-7xl items-center justify-between rounded-2xl border border-gray-200/70 bg-white/80 px-6 py-4 backdrop-blur-xl shadow-sm">

        {/* Logo */}

        <Link href="/v2" className="flex items-center gap-3">
          <Image
            src="/logo.PNG"
            alt="Orenios AI"
            width={40}
            height={40}
            className="rounded-xl"
          />

          <div>
            <h2 className="text-lg font-bold text-black">
              Orenios AI
            </h2>

            <p className="text-xs text-gray-500">
              Your Life Admin
            </p>
          </div>
        </Link>

        {/* Navigation */}

        <nav className="hidden items-center gap-10 text-sm font-medium text-gray-600 md:flex">
          <a href="#features" className="transition hover:text-black">
            Features
          </a>

          <a href="#preview" className="transition hover:text-black">
            Preview
          </a>

          <a href="#waitlist" className="transition hover:text-black">
            Waitlist
          </a>
        </nav>

        {/* CTA */}

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