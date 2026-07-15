import Link from "next/link";

export const metadata = {
  title: "Terms of Service – Orenios AI",
  description: "The terms that govern your use of Orenios AI.",
};

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>

        <p className="mt-3 text-sm text-gray-400">
          Last updated: July 15, 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-gray-600">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to
            and use of Orenios AI (&quot;Orenios&quot;, &quot;we&quot;,
            &quot;us&quot;), including{" "}
            <span className="font-medium text-gray-800">orenios.com</span>{" "}
            and the Orenios dashboard. By creating an account or using
            Orenios, you agree to these Terms.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              1. Who can use Orenios
            </h2>
            <p className="mt-3">
              You must be at least 16 years old to create an Orenios
              account. By registering, you confirm the information you
              provide is accurate and that you will keep your login
              credentials confidential.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              2. Beta status
            </h2>
            <p className="mt-3">
              Orenios is currently in early beta. Features may change,
              break, or be temporarily unavailable, and we may add, modify
              or remove functionality as the product develops. Paid
              subscription plans are not yet available; if and when they
              launch, separate pricing and billing terms will be presented
              to you for acceptance before you are charged.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              3. Your content
            </h2>
            <p className="mt-3">
              You own the tasks, goals, notes, calendar events and other
              content you create in Orenios (&quot;Your Content&quot;). You
              grant us a limited license to host, process and display Your
              Content solely to operate and improve Orenios for you. You are
              responsible for Your Content and for making sure you have the
              right to store it in Orenios.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              4. AI Coach and AI-driven actions
            </h2>
            <p className="mt-3">
              The AI Coach can create, edit or reorganize items in your
              workspace based on your instructions. AI output can be
              wrong, incomplete or not what you intended — please review
              actions the AI Coach takes on your behalf, especially before
              relying on them for anything important or time-sensitive. We
              are working on adding confirmation steps for higher-risk
              actions; until then, use ordinary care when giving the AI
              Coach instructions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              5. Acceptable use
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Use Orenios for anything unlawful, harmful or abusive.
              </li>
              <li>
                Attempt to access another user&apos;s account or data
                without authorization.
              </li>
              <li>
                Interfere with, disrupt or attempt to bypass the security
                of Orenios.
              </li>
              <li>
                Use automated means to scrape or extract data from Orenios
                without our written permission.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              6. Account termination
            </h2>
            <p className="mt-3">
              You may stop using Orenios and request deletion of your
              account at any time by emailing{" "}
              <a
                href="mailto:hello@orenios.com"
                className="font-medium text-violet-700 hover:text-violet-900"
              >
                hello@orenios.com
              </a>
              . We may suspend or terminate accounts that violate these
              Terms or that we reasonably believe put Orenios or other
              users at risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              7. Disclaimers
            </h2>
            <p className="mt-3">
              Orenios is provided &quot;as is&quot; and &quot;as
              available,&quot; without warranties of any kind, express or
              implied. We do not guarantee that Orenios will be
              uninterrupted, error-free, or fit for any particular purpose,
              and we do not guarantee the accuracy of AI-generated content
              or actions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              8. Limitation of liability
            </h2>
            <p className="mt-3">
              To the fullest extent permitted by law, Orenios and its
              founder will not be liable for any indirect, incidental or
              consequential damages arising from your use of the service.
              Nothing in these Terms limits any liability that cannot be
              limited under applicable law, including mandatory consumer
              protections in your country of residence.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              9. Changes to these Terms
            </h2>
            <p className="mt-3">
              We may update these Terms as Orenios evolves. We will change
              the &quot;Last updated&quot; date above and, for material
              changes, notify registered users by email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              10. Contact us
            </h2>
            <p className="mt-3">
              Questions about these Terms? Email{" "}
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
