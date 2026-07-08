import FloatingCards from "./FloatingCards";

export default function ProductHero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">

      {/* Background Glow */}

      <div className="absolute inset-0 -z-10 overflow-hidden">

        <div className="absolute left-0 top-20 h-[550px] w-[550px] rounded-full bg-violet-500/10 blur-[180px]" />

        <div className="absolute right-0 top-32 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />

        <div className="absolute bottom-0 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[170px]" />

      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-24 px-8 lg:grid-cols-2">

        {/* Left */}

        <div>

          <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm font-medium text-violet-700">
            ✨ The Operating System for your life
          </div>

          <h1 className="mt-8 text-6xl font-bold leading-[0.95] tracking-tight text-black lg:text-8xl">
            Your second
            <br />
            brain for
            <br />
            everyday life.
          </h1>

          <p className="mt-10 max-w-xl text-xl leading-9 text-gray-600">
            One AI that remembers your goals, plans your day,
            organizes your tasks, manages your calendar,
            stores your notes and keeps everything connected.
          </p>

          <div className="mt-12 flex flex-wrap gap-5">

            <a
              href="#waitlist"
              className="rounded-full bg-black px-9 py-4 text-center text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
            >
              Join Waitlist
            </a>

            <a
              href="#preview"
              className="rounded-full border border-gray-300 bg-white px-9 py-4 text-center text-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-100 hover:shadow-xl"
            >
              See Preview
            </a>

          </div>

        </div>

        {/* Right */}

        <div className="flex justify-end">
          <FloatingCards />
        </div>

      </div>

    </section>
  );
}