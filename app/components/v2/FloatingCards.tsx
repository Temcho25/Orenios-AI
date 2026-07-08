export default function FloatingCards() {
  return (
    <div className="relative h-[520px] w-full">

      {/* Main Card */}

      <div className="absolute right-0 top-10 w-[430px] rounded-[32px] border border-gray-200 bg-white p-7 shadow-2xl">

        <div className="flex items-center gap-4">

          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500" />

          <div>

            <h3 className="text-2xl font-bold">
              Orenios AI
            </h3>

            <p className="text-gray-500">
              Your intelligent workspace
            </p>

          </div>

        </div>

        <div className="mt-8 space-y-4">

          <div className="rounded-2xl bg-violet-50 p-4">
            🎯 Goals synchronized
          </div>

          <div className="rounded-2xl bg-cyan-50 p-4">
            ✅ AI prioritized your tasks
          </div>

          <div className="rounded-2xl bg-green-50 p-4">
            📅 Calendar organized
          </div>

        </div>

      </div>

      {/* Floating Card */}

      <div className="absolute left-0 top-40 rounded-3xl bg-black px-8 py-6 text-white shadow-xl">

        <p className="text-sm text-gray-300">
          Focus Score
        </p>

        <h2 className="mt-2 text-5xl font-bold">
          92%
        </h2>

      </div>

      {/* Floating Card */}

      <div className="absolute bottom-6 right-10 rounded-3xl bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-6 text-white shadow-2xl">

        <p className="text-sm opacity-80">
          AI Assistant
        </p>

        <h3 className="mt-2 text-xl font-semibold">
          Everything is organized.
        </h3>

      </div>

    </div>
  );
}