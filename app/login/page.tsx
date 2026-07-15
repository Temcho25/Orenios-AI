"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage("Please enter your email address and password.");
      return;
    }

    try {
      setLoading(true);

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("The email address or password is incorrect.");
        } else if (
          error.message.toLowerCase().includes("email not confirmed")
        ) {
          setErrorMessage(
            "Please confirm your email address before signing in."
          );
        } else {
          setErrorMessage(error.message);
        }

        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while signing you in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f9fc] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-purple-300/30 blur-[100px]" />
        <div className="absolute bottom-[-140px] right-[-100px] h-[380px] w-[380px] rounded-full bg-blue-300/30 blur-[110px]" />
        <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center justify-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/80 bg-white/75 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr]"
        >
          <section className="relative hidden min-h-[650px] overflow-hidden bg-[#0c0c12] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0">
              <div className="absolute left-[-100px] top-[-80px] h-[320px] w-[320px] rounded-full bg-purple-600/35 blur-[90px]" />
              <div className="absolute bottom-[-100px] right-[-100px] h-[320px] w-[320px] rounded-full bg-blue-600/30 blur-[100px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0,transparent_55%)]" />
            </div>

            <Link
              href="/"
              className="relative z-10 flex w-fit items-center gap-3"
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="drop-shadow-[0_0_24px_rgba(124,58,237,0.5)]"
              >
                <Image
                  src="/logo2.PNG"
                  alt="Orenios AI"
                  width={58}
                  height={58}
                  priority
                  className="rounded-full"
                />
              </motion.div>

              <div>
                <p className="text-lg font-semibold">Orenios AI</p>
                <p className="text-xs text-white/55">Your Life Admin</p>
              </div>
            </Link>

            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/65 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.9)]" />
                Your intelligent personal workspace
              </div>

              <h1 className="max-w-md text-5xl font-semibold leading-[1.05] tracking-[-0.04em]">
                Everything in your life,
                <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
                  finally organized.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-white/55">
                Goals, tasks, notes, planning and AI guidance — together in one
                focused workspace.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 text-xs text-white/40">
              <span>Private by design</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Built for focus</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Powered by AI</span>
            </div>
          </section>

          <section className="flex min-h-[650px] flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
            <div className="mx-auto w-full max-w-sm">
              <Link
                href="/"
                className="mb-10 flex w-fit items-center gap-3 lg:hidden"
              >
                <Image
                  src="/logo2.PNG"
                  alt="Orenios AI"
                  width={48}
                  height={48}
                  priority
                  className="rounded-full"
                />

                <div>
                  <p className="font-semibold text-black">Orenios AI</p>
                  <p className="text-xs text-gray-500">Your Life Admin</p>
                </div>
              </Link>

              <div>
                <p className="mb-3 text-sm font-medium text-violet-600">
                  Welcome back
                </p>

                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-gray-950">
                  Sign in to Orenios
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Continue to your personal AI workspace.
                </p>
              </div>

              <form className="mt-9 space-y-5" onSubmit={handleLogin}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="h-13 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-800"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-violet-600 transition hover:text-violet-700"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      disabled={loading}
                      className="h-13 w-full rounded-2xl border border-gray-200 bg-white px-4 pr-14 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
                    >
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 3L21 21"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10.58 10.58A2 2 0 0013.41 13.4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M9.9 4.24A10.8 10.8 0 0112 4c5 0 9 4 10 8a11.9 11.9 0 01-2.07 4.07M6.61 6.61A12.8 12.8 0 002 12c1 4 5 8 10 8a10.8 10.8 0 004.1-.8"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                <motion.button
                  whileHover={loading ? undefined : { scale: 1.015 }}
                  whileTap={loading ? undefined : { scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(15,23,42,0.2)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </motion.button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                disabled
                className="flex h-13 w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-800 opacity-60"
                title="Google sign-in will be added next"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.6 12.23c0-.71-.06-1.24-.2-1.79H12v3.4h5.52a4.72 4.72 0 01-2.05 3.1l-.02.11 2.98 2.31.21.02c1.94-1.79 2.96-4.43 2.96-7.15Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 22c2.7 0 4.96-.89 6.61-2.42l-3.17-2.45c-.85.57-1.97.97-3.44.97a5.97 5.97 0 01-5.65-4.13l-.1.01-3.1 2.4-.04.09A9.99 9.99 0 0012 22Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.35 13.97A6.16 6.16 0 016.02 12c0-.68.12-1.34.32-1.97l-.01-.13-3.13-2.44-.1.05A10 10 0 002 12c0 1.62.39 3.15 1.1 4.49l3.25-2.52Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.9c1.89 0 3.16.81 3.89 1.49l2.78-2.71C16.96 3.09 14.7 2 12 2a9.99 9.99 0 00-8.9 5.51l3.24 2.52A5.98 5.98 0 0112 5.9Z"
                  />
                </svg>

                Continue with Google
              </button>

              <p className="mt-8 text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-violet-600 transition hover:text-violet-700"
                >
                  Create account
                </Link>
              </p>

              <p className="mt-8 text-center text-xs leading-5 text-gray-400">
                By continuing, you agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-gray-500 underline hover:text-gray-700"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-gray-500 underline hover:text-gray-700"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </main>
  );
}