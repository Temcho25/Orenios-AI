"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    if (normalizedName.length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        const message = error.message.toLowerCase();

        if (message.includes("already registered")) {
          setErrorMessage(
            "An account with this email address already exists."
          );
        } else if (message.includes("password")) {
          setErrorMessage(
            "Please choose a stronger password with at least 8 characters."
          );
        } else {
          setErrorMessage(error.message);
        }

        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Your account has been created. Check your email and confirm your address before signing in."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage(
        "Something went wrong while creating your account. Please try again."
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
          <section className="relative hidden min-h-[720px] overflow-hidden bg-[#0c0c12] p-12 text-white lg:flex lg:flex-col lg:justify-between">
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
                One workspace for your entire life
              </div>

              <h1 className="max-w-md text-5xl font-semibold leading-[1.05] tracking-[-0.04em]">
                Build a life that feels
                <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
                  clear and intentional.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-white/55">
                Create your personal AI workspace and bring your goals, tasks,
                planning and daily decisions into one intelligent system.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 text-xs text-white/40">
              <span>Secure account</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Personal workspace</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Built for growth</span>
            </div>
          </section>

          <section className="flex min-h-[720px] flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
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
                  Start your workspace
                </p>

                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-gray-950">
                  Create your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Your intelligent personal workspace starts here.
                </p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your full name"
                    disabled={loading}
                    className="h-13 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

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
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 8 characters"
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
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Repeat your password"
                      disabled={loading}
                      className="h-13 w-full rounded-2xl border border-gray-200 bg-white px-4 pr-14 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
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

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="status"
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
                  >
                    {successMessage}
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </motion.button>
              </form>

              <p className="mt-7 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-violet-600 transition hover:text-violet-700"
                >
                  Sign in
                </Link>
              </p>

              <p className="mt-7 text-center text-xs leading-5 text-gray-400">
                By creating an account, you agree to the{" "}
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