import { Fragment } from "react";

export default function ProductPreview() {
  const steps = [
    {
      number: "1",
      text: "Tell Orenios what's on your mind",
    },
    {
      number: "2",
      text: "It turns it into tasks, goals or a plan",
    },
    {
      number: "3",
      text: "You see everything organized in one place",
    },
  ];

  return (
    <section
      id="preview"
      className="mx-auto max-w-7xl px-6 py-32"
    >
      <div className="text-center">

        <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm font-medium text-violet-700">
          HOW IT WORKS
        </div>

        <h2 className="mt-8 text-6xl font-bold tracking-tight text-black">
          From a thought.
          <br />
          To a plan.
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-600">
          No manual sorting, no blank to-do list. Just tell Orenios what&apos;s
          going on.
        </p>

      </div>

      <div className="mt-20 flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {steps.map((step, index) => (
          <Fragment key={step.number}>
            <div className="flex-1 rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-bold text-white">
                {step.number}
              </div>

              <p className="text-xl font-semibold leading-8 text-black">
                {step.text}
              </p>
            </div>

            {index < steps.length - 1 && (
              <span
                className="hidden shrink-0 items-center px-2 text-3xl text-gray-300 lg:flex"
                aria-hidden="true"
              >
                →
              </span>
            )}
          </Fragment>
        ))}
      </div>

    </section>
  );
}
