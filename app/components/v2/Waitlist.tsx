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
      className="mx-auto my-32 max-w-4xl rounded-[36px] bg-gradient-to-br from-violet-600 to-cyan-500 p-12 text-center text-white"
    >
      <h2 className="text-5xl font-bold">
        Join the Waitlist
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
        Be among the first people to experience Orenios AI and get early access before launch.
      </p>

      {!joined ? (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoin();
            }}
            className="mx-auto mt-10 flex max-w-xl gap-4"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-2xl bg-white px-6 py-4 text-black outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-black px-8 py-4 font-semibold transition hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </form>

          <p className="mt-6 text-sm text-white/70">
            No spam. Early access only.
          </p>
        </>
      ) : (
        <div className="mt-10 rounded-2xl bg-white/20 p-6 backdrop-blur">
          <h3 className="text-2xl font-bold">
            🎉 You're on the waitlist!
          </h3>

          <p className="mt-3 text-white/90">
            We'll let you know as soon as Orenios AI launches.
          </p>
        </div>
      )}
    </section>
  );
}
