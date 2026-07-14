"use client";

import { useState } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setJoined(true);
      setEmail("");

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
  <section
    id="waitlist"
    className="mx-auto my-16 max-w-4xl rounded-[32px] bg-gradient-to-br from-violet-600 to-cyan-500 px-6 py-10 text-center text-white sm:px-12 sm:py-12"
  >
    <h2 className="text-3xl font-bold sm:text-5xl">
      Join the Waitlist
    </h2>

    <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:mt-6 sm:text-lg">
      Be among the first people to experience Orenios AI and get early access before launch.
    </p>

    {!joined ? (
      <>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoin();
          }}
          className="mx-auto mt-8 flex max-w-xl flex-col gap-4 sm:mt-10 sm:flex-row"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 w-full rounded-2xl bg-white px-5 text-black outline-none transition focus:scale-[1.01]"
          />

          <button
            type="submit"
            disabled={loading}
            className="h-14 rounded-2xl bg-black px-8 font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Waitlist"}
          </button>
        </form>

        <p className="mt-5 text-sm text-white/70">
          No spam. Early access only.
        </p>
      </>
    ) : (
      <div className="mt-8 rounded-2xl bg-white/20 p-6 backdrop-blur-md animate-pulse">
        <div className="mb-3 text-5xl">✅</div>

        <h3 className="text-2xl font-bold">
          You&apos;re on the waitlist!
        </h3>

        <p className="mt-3 text-white/90">
          Thanks for joining. We&apos;ll notify you before launch.
        </p>
      </div>
    )}
  </section>
);
}