export default function Features() {
  const features = [
    {
      title: "AI Life Planning",
      description:
        "Plan your days, weeks and long-term goals with one intelligent assistant.",
    },
    {
      title: "Smart Tasks",
      description:
        "Organize tasks automatically and always know what matters most.",
    },
    {
      title: "Goals Tracking",
      description:
        "Track progress across every important area of your life.",
    },
    {
      title: "Daily AI Coach",
      description:
        "Receive personalized suggestions based on your schedule and habits.",
    },
    {
      title: "Notes & Ideas",
      description:
        "Keep every thought, idea and project in one organized place.",
    },
    {
      title: "Everything Connected",
      description:
        "Tasks, notes, goals and AI work together instead of living in separate apps.",
    },
  ];

  return (
    <section
      id="features"
      className="mx-auto mt-28 max-w-6xl px-6"
    >
      <div className="text-center">

        <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-600">
          FEATURES
        </p>

        <h2 className="mt-4 text-5xl font-bold text-black">
          Everything you need.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-500">
          Orenios AI becomes your personal operating system for life —
          helping you organize, plan and achieve more every day.
        </p>

      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="mb-6 h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400" />

            <h3 className="text-xl font-semibold text-black">
              {feature.title}
            </h3>

            <p className="mt-3 leading-7 text-gray-500">
              {feature.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}