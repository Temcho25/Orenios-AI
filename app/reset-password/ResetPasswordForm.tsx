"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "../lib/supabase";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleUpdatePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage(
        "Your password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmation) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      await supabase.auth.signOut({
        scope: "local",
      });

      setPassword("");
      setConfirmation("");
      setCompleted(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toLowerCase() : "";

      if (message.includes("session")) {
        setErrorMessage(
          "Your reset session has expired. Please request a new link."
        );
      } else if (message.includes("password")) {
        setErrorMessage(
          "Please choose a stronger password with at least 8 characters."
        );
      } else {
        setErrorMessage(
          "We could not update your password. Please try again."
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
          Choose a new password
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Use at least 8 characters and choose a password you do not use elsewhere.
        </p>

        {completed ? (
          <div className="mt-7">
            <p
              role="status"
              className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-700"
            >
              Your password has been updated successfully.
            </p>

            <Link
              href="/login"
              className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Continue to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="mt-7">
            <label
              htmlFor="new-password"
              className="text-sm font-semibold text-gray-800"
            >
              New password
            </label>

            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <label
              htmlFor="confirm-new-password"
              className="mt-5 block text-sm font-semibold text-gray-800"
            >
              Confirm new password
            </label>

            <input
              id="confirm-new-password"
              name="password-confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={loading}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
            />

            {errorMessage ? (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
