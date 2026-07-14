"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const error = new URLSearchParams(window.location.search).get(
        "error"
      );

      if (error === "invalid-link") {
        setErrorMessage(
          "That reset link is invalid or has expired. Please request a new one."
        );
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function handleResetRequest(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    setErrorMessage("");
    setSuccessMessage("");

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo,
        }
      );

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "If an account exists for that email, a password reset link is on its way."
      );
      setEmail("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toLowerCase() : "";

      if (message.includes("rate") || message.includes("seconds")) {
        setErrorMessage(
          "Please wait a moment before requesting another reset email."
        );
      } else {
        setErrorMessage(
          "We could not send the reset email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f9fc] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-purple-300/30 blur-[100px]" />
        <div className="absolute bottom-[-140px] right-[-100px] h-[380px] w-[380px] rounded-full bg-blue-300/30 blur-[110px]" />
      </div>

      <section className="relative w-full max-w-md rounded-[30px] border border-white/80 bg-white/85 p-7 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-9">
        <Link
          href="/"
          className="text-sm font-semibold text-violet-700 transition hover:text-violet-900"
        >
          ← Orenios AI
        </Link>

        <h1 className="mt-7 text-3xl font-semibold tracking-[-0.04em] text-gray-950">
          Reset your password
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Enter the email connected to your account. We will send you a secure link to choose a new password.
        </p>

        <form onSubmit={handleResetRequest} className="mt-7">
          <label
            htmlFor="reset-email"
            className="text-sm font-semibold text-gray-800"
          >
            Email address
          </label>

          <input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {errorMessage ? (
            <p
              role="alert"
              className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p
              role="status"
              className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
            >
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-violet-700 hover:text-violet-900"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
