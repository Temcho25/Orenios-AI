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
          Everything you need to organize your life inside one intelligent workspace.
        </p>

      </div>

      <div className="mt-20 rounded-[42px] border border-gray-200 bg-white p-10 shadow-[0_40px_120px_rgba(0,0,0,.08)]">

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Today's Tasks */}

          <div className="rounded-3xl border border-gray-200 p-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase tracking-[0.25em] text-violet-600">
                  TODAY
                </p>

                <h3 className="mt-2 text-3xl font-bold">
                  Today's Tasks
                </h3>

              </div>

              <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                4 Tasks
              </div>

            </div>

            <div className="mt-8 space-y-4">

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <span>🚀 Launch Landing Page</span>
                <span className="font-medium text-green-600">
                  Done
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <span>✅ Review Waitlist</span>
                <span className="font-medium text-green-600">
                  Done
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <span>🎥 Publish Instagram Reel</span>
                <span className="font-medium text-orange-500">
                  Today
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <span>🌍 Public Launch</span>
                <span className="font-medium text-red-500">
                  Next
                </span>
              </div>

            </div>

          </div>

          {/* AI Assistant */}

          <div className="rounded-[34px] bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-10 text-white">

            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              AI ASSISTANT
            </p>

            <h3 className="mt-4 text-4xl font-bold">
              Your day is organized.
            </h3>

            <p className="mt-6 text-lg leading-8 text-white/90">
              Your landing page is ready.
              Continue growing your waitlist,
              publish today's content and prepare
              for the public launch.
            </p>

            <button className="mt-10 rounded-2xl bg-white px-7 py-4 font-semibold text-black transition duration-300 hover:scale-105">
              Open Dashboard →
            </button>

          </div>

        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    {/* Goals */}

          <div className="rounded-3xl border border-gray-200 p-8">

            <p className="text-sm uppercase tracking-[0.25em] text-violet-600">
              GOALS
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              Current Progress
            </h3>

            <div className="mt-8">

              <div className="flex justify-between text-sm font-medium">
                <span>Launch Orenios</span>
                <span>82%</span>
              </div>

              <div className="mt-3 h-3 rounded-full bg-gray-100">
                <div className="h-3 w-[82%] rounded-full bg-gradient-to-r from-violet-600 to-cyan-500" />
              </div>

            </div>

            <div className="mt-8">

              <div className="flex justify-between text-sm font-medium">
                <span>1000 Waitlist Users</span>
                <span>12%</span>
              </div>

              <div className="mt-3 h-3 rounded-full bg-gray-100">
                <div className="h-3 w-[12%] rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
              </div>

            </div>

          </div>

          {/* Upcoming */}

          <div className="rounded-3xl border border-gray-200 p-8">

            <p className="text-sm uppercase tracking-[0.25em] text-violet-600">
              UPCOMING
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              Schedule
            </h3>

            <div className="mt-8 space-y-4">

              <div className="rounded-2xl bg-red-50 p-5">
                <div className="font-semibold">
                  🥊 Boxing Training
                </div>
                <div className="mt-1 text-gray-500">
                  Today · 09:00
                </div>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <div className="font-semibold">
                  💻 Build Orenios
                </div>
                <div className="mt-1 text-gray-500">
                  Today · 14:00
                </div>
              </div>

              <div className="rounded-2xl bg-green-50 p-5">
                <div className="font-semibold">
                  🚀 Public Launch
                </div>
                <div className="mt-1 text-gray-500">
                  Coming Soon
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}