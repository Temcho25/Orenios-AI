export default function ProductPreview() {
  return (
    <section
      id="preview"
      className="mx-auto max-w-7xl px-6 py-32"
    >
      <div className="text-center">

        <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm font-medium text-violet-700">
          PRODUCT PREVIEW
        </div>

        <h2 className="mt-8 text-6xl font-bold tracking-tight text-black">
          Your entire life.
          <br />
          One dashboard.
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-600">
          Tasks, calendar, goals, notes and AI —
          beautifully organized inside one workspace.
        </p>

      </div>

      <div className="mt-20 rounded-[42px] border border-gray-200 bg-white p-10 shadow-[0_40px_120px_rgba(0,0,0,.08)]">

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-3xl border border-gray-200 p-8">

            <p className="text-sm text-gray-500">
              Focus Score
            </p>

            <h3 className="mt-3 text-6xl font-bold">
              92%
            </h3>

            <p className="mt-6 text-gray-400">
              Updated just now
            </p>

            <div className="mt-8 h-2 rounded-full bg-gray-100">

              <div className="h-2 w-[92%] rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />

            </div>

          </div>

          <div className="rounded-3xl border border-gray-200 p-8">

            <p className="text-sm text-gray-500">
              Tasks Today
            </p>

            <h3 className="mt-3 text-6xl font-bold">
              7
            </h3>

            <p className="mt-6 text-gray-400">
              Updated just now
            </p>

            <div className="mt-8 h-2 rounded-full bg-gray-100">

              <div className="h-2 w-[75%] rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" />

            </div>

          </div>

          <div className="rounded-3xl border border-gray-200 p-8">

            <p className="text-sm text-gray-500">
              Goals Progress
            </p>

            <h3 className="mt-3 text-6xl font-bold">
              68%
            </h3>

            <p className="mt-6 text-gray-400">
              Updated just now
            </p>

            <div className="mt-8 h-2 rounded-full bg-gray-100">

              <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />

            </div>

          </div>
                  </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-gray-200 p-8">

            <h3 className="text-3xl font-bold">
              Today's Tasks
            </h3>

            <div className="mt-8 space-y-4">

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <span>🚀 Launch Orenios Landing</span>
                <span className="text-green-600 font-medium">Done</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <span>✅ Review Waitlist</span>
                <span className="text-green-600 font-medium">Done</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <span>🎨 Finish Dashboard UI</span>
                <span className="text-orange-500 font-medium">Today</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <span>🌍 Public Launch</span>
                <span className="text-red-500 font-medium">Next</span>
              </div>

            </div>

          </div>

          <div className="rounded-[32px] bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-8 text-white">

            <h3 className="text-3xl font-bold">
              AI Assistant
            </h3>

            <p className="mt-6 text-lg leading-8 text-white/90">
              Based on today's schedule, your highest-impact task
              is to finish the landing page, continue growing the
              waitlist and prepare for the public launch.
            </p>

            <button className="mt-10 rounded-2xl bg-white px-7 py-4 font-semibold text-black transition hover:scale-105">
              Open AI
            </button>

          </div>

        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-gray-200 p-8">

            <h3 className="text-3xl font-bold">
              Goals
            </h3>

            <p className="mt-2 text-gray-500">
              Current progress
            </p>

            <div className="mt-8">

              <div className="flex justify-between">
                <span>Launch Orenios</span>
                <span>82%</span>
              </div>

              <div className="mt-3 h-3 rounded-full bg-gray-100">
                <div className="h-3 w-[82%] rounded-full bg-gradient-to-r from-violet-600 to-cyan-500" />
              </div>

            </div>

            <div className="mt-8">

              <div className="flex justify-between">
                <span>1000 Waitlist</span>
                <span>12%</span>
              </div>

              <div className="mt-3 h-3 rounded-full bg-gray-100">
                <div className="h-3 w-[12%] rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
              </div>

            </div>

          </div>
                    <div className="rounded-3xl border border-gray-200 p-8">

            <h3 className="text-3xl font-bold">
              Upcoming
            </h3>

            <div className="mt-8 space-y-4">

              <div className="rounded-2xl bg-gradient-to-r from-red-50 to-white p-5">
                <div className="font-semibold">
                  🥊 Boxing Training
                </div>
                <div className="mt-1 text-gray-500">
                  Today · 09:00
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-white p-5">
                <div className="font-semibold">
                  💻 Build Orenios
                </div>
                <div className="mt-1 text-gray-500">
                  Today · 14:00
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-green-50 to-white p-5">
                <div className="font-semibold">
                  🚀 Launch Waitlist
                </div>
                <div className="mt-1 text-gray-500">
                  Tomorrow
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}