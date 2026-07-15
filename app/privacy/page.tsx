import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – Orenios AI",
  description:
    "How Orenios AI collects, uses and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f9fc] px-4 py-14 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-purple-300/30 blur-[100px]" />
        <div className="absolute bottom-[-140px] right-[-100px] h-[380px] w-[380px] rounded-full bg-blue-300/30 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-3xl rounded-[30px] border border-white/80 bg-white/90 p-7 shadow-[0_30px_100px_rgba(15,23,42,0.1)] backdrop-blur-2xl sm:p-12">
        <Link
          href="/"
          className="text-sm font-semibold text-violet-700 transition hover:text-violet-900"
        >
          ← Orenios AI
        </Link>

        <h1 className="mt-7 text-3xl font-semibold tracking-[-0.03em] text-gray-950 sm:text-4xl">
          Privacy Policy
        </h1>

        <p className="mt-3 text-sm text-gray-400">
          Last updated: July 15, 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-gray-600">
          <p>
            Orenios AI (&quot;Orenios&quot;, &quot;we&quot;, &quot;us&quot;)
            provides a personal AI life-admin application at{" "}
            <span className="font-medium text-gray-800">orenios.com</span>.
            This policy explains what personal data we collect when you use
            Orenios, why we collect it, and the choices you have. Orenios is
            currently in early beta and this policy will be updated as the
            product grows.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              1. Information we collect
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-gray-800">
                  Account information:
                </span>{" "}
                name, email address and authentication data when you
                register or sign in.
              </li>
              <li>
                <span className="font-medium text-gray-800">
                  Workspace content:
                </span>{" "}
                the tasks, goals, calendar events, notes, daily focus
                entries and AI Coach conversations you create inside
                Orenios.
              </li>
              <li>
                <span className="font-medium text-gray-800">
                  Usage data:
                </span>{" "}
                basic, privacy-conscious product analytics (e.g. pages
                visited) collected through Vercel Analytics.
              </li>
              <li>
                <span className="font-medium text-gray-800">
                  Waitlist information:
                </span>{" "}
                if you join our waitlist, we store the email address you
                provide.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              2. How we use your information
            </h2>
            <p className="mt-3">We use your information to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Provide, operate and maintain your Orenios workspace.</li>
              <li>
                Power the AI Coach, including generating replies and, with
                your requests, creating or editing tasks, goals and other
                items in your workspace.
              </li>
              <li>
                Communicate with you about your account, product updates or
                support requests.
              </li>
              <li>Maintain the security and reliability of the service.</li>
              <li>
                Improve Orenios based on aggregated, non-identifying usage
                patterns.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data, and we do not use your
              workspace content to serve you advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              3. AI Coach and third-party AI processing
            </h2>
            <p className="mt-3">
              When you use the AI Coach, the relevant parts of your message
              and workspace context are sent to our AI provider (OpenAI) to
              generate a response or perform an action you asked for.
              OpenAI processes this data to return a result to Orenios and
              does not use it to serve ads. Please avoid sharing sensitive
              information (e.g. government IDs, health or financial account
              details) in AI Coach conversations that isn&apos;t necessary
              for the task at hand.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              4. Cookies and similar technologies
            </h2>
            <p className="mt-3">
              We use essential cookies to keep you signed in and to keep
              your session secure (via our authentication provider,
              Supabase). We use Vercel Analytics to understand overall
              product usage; it is designed to avoid tracking individual
              users across sites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              5. Who we share data with
            </h2>
            <p className="mt-3">
              We share data only with service providers that help us run
              Orenios, under agreements that limit how they can use it:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-gray-800">Supabase</span> –
                database, authentication and storage.
              </li>
              <li>
                <span className="font-medium text-gray-800">OpenAI</span> –
                AI Coach language processing.
              </li>
              <li>
                <span className="font-medium text-gray-800">Upstash</span> –
                rate limiting infrastructure (technical request counters,
                not your workspace content).
              </li>
              <li>
                <span className="font-medium text-gray-800">Vercel</span> –
                application hosting and product analytics.
              </li>
            </ul>
            <p className="mt-3">
              We do not otherwise share your personal data with third
              parties, except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              6. Data retention
            </h2>
            <p className="mt-3">
              We keep your account and workspace data for as long as your
              account is active, so that Orenios can keep working the way
              you expect. If you want your account and data deleted, email
              us at{" "}
              <a
                href="mailto:hello@orenios.com"
                className="font-medium text-violet-700 hover:text-violet-900"
              >
                hello@orenios.com
              </a>{" "}
              and we will delete it, aside from what we are required to
              keep for legal or security reasons.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              7. Your rights and choices
            </h2>
            <p className="mt-3">
              Depending on where you live, you may have rights to access,
              correct, export or delete your personal data, or to object to
              or restrict certain processing. You can exercise any of these
              rights by contacting us at{" "}
              <a
                href="mailto:hello@orenios.com"
                className="font-medium text-violet-700 hover:text-violet-900"
              >
                hello@orenios.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              8. Data security
            </h2>
            <p className="mt-3">
              We use industry-standard safeguards, including row-level
              security on our database so your data is scoped to your
              account, and encrypted connections between your device and
              our services. No method of transmission or storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              9. Children&apos;s privacy
            </h2>
            <p className="mt-3">
              Orenios is not directed at children, and we do not knowingly
              collect personal data from anyone under 16. If you believe a
              child has provided us with personal data, contact us and we
              will remove it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              10. International data transfers
            </h2>
            <p className="mt-3">
              Orenios is operated from Georgia, and our service providers
              (Supabase, OpenAI, Upstash, Vercel) may process and store data
              in other countries. Where we transfer personal data
              internationally, we rely on the safeguards those providers
              make available.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              11. Changes to this policy
            </h2>
            <p className="mt-3">
              As Orenios evolves — for example when we add calendar sync,
              billing or long-term memory — we will update this policy and
              change the &quot;Last updated&quot; date above. Material
              changes will be communicated to registered users by email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              12. Contact us
            </h2>
            <p className="mt-3">
              Questions about this policy or your data? Email{" "}
              <a
                href="mailto:hello@orenios.com"
                className="font-medium text-violet-700 hover:text-violet-900"
              >
                hello@orenios.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
