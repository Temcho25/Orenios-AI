export default function ProductPreview() {
  return (
    <section className="mx-auto mt-40 max-w-7xl px-6">

      <div className="text-center">

        <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm font-medium text-violet-700">
          PRODUCT PREVIEW
        </div>

        <h2 className="mt-6 text-6xl font-bold tracking-tight text-black">
          Meet your second brain.
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-gray-500">
          Orenios AI brings together your tasks, calendar,
          goals, notes and AI assistant into one beautiful workspace.
        </p>

      </div>

      <div className="mt-20 overflow-hidden rounded-[40px] border border-gray-200 bg-white shadow-[0_40px_100px_rgba(0,0,0,.08)]">

        {/* Window */}

        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-5">

          <div className="flex gap-2">

            <div className="h-3 w-3 rounded-full bg-red-400"/>

            <div className="h-3 w-3 rounded-full bg-yellow-400"/>

            <div className="h-3 w-3 rounded-full bg-green-400"/>

          </div>

          <div className="text-sm text-gray-400">
            app.orenios.ai
          </div>

        </div>

        <div className="grid grid-cols-12">

          {/* Sidebar */}

          <aside className="col-span-3 border-r border-gray-100 bg-[#fafafa] p-8">

            <h3 className="text-2xl font-bold">
              Orenios AI
            </h3>

            <p className="mt-2 text-gray-500">
              Your AI Workspace
            </p>

            <div className="mt-10 space-y-3">

              <div className="rounded-2xl bg-black px-5 py-4 text-white">
                Dashboard
              </div>

              <div className="rounded-2xl px-5 py-4 text-gray-500">
                AI Chat
              </div>

              <div className="rounded-2xl px-5 py-4 text-gray-500">
                Tasks
              </div>

              <div className="rounded-2xl px-5 py-4 text-gray-500">
                Calendar
              </div>

              <div className="rounded-2xl px-5 py-4 text-gray-500">
                Goals
              </div>

              <div className="rounded-2xl px-5 py-4 text-gray-500">
                Notes
              </div>

              <div className="rounded-2xl px-5 py-4 text-gray-500">
                Settings
              </div>

            </div>

          </aside>

          <main className="col-span-9 p-10">

            <h2 className="text-5xl font-bold">
              Good Morning 👋
            </h2>

            <p className="mt-3 text-lg text-gray-500">
              Here's everything important today.
            </p>

          </main>

        </div>

      </div>

    </section>
  );
}