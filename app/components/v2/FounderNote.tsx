export default function FounderNote() {
  return (
    <section className="mx-auto mt-24 max-w-3xl px-6 text-center">
      <div className="rounded-3xl border border-gray-200 bg-white/70 px-8 py-10 backdrop-blur-sm">
        <p className="text-lg font-medium leading-8 text-gray-800 sm:text-xl">
          Built in public by one founder — no team, no funding, real
          progress every day.
        </p>

        <a
          href="https://www.instagram.com/orenios.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
        >
          Follow the build on Instagram
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
