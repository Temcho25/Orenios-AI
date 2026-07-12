"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase";
import { motion } from "framer-motion";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    setLoading(true);

    const supabase = await createClient();
    const { error } = await supabase
      .from("waitlist")
      .insert([{ email }]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setJoined(true);
    setEmail("");
  }

  return (
    <motion.section
      id="waitlist"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="mx-auto mt-32 mb-32 max-w-4xl rounded-[36px] bg-gradient-to-br from-violet-600 to-cyan-500 p-12 text-center text-white shadow-[0_40px_120px_rgba(124,58,237,0.35)]"
    >
      <h2 className="text-5xl font-bold">
        Join the Waitlist
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
        Be among the first people to experience Orenios AI and receive early access before launch.
      </p>

      {!joined ? (
        <>
          <div className="mx-auto mt-10 flex max-w-xl gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-2xl border border-white/20 bg-white px-6 py-4 text-black outline-none"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleJoin}
              disabled={loading}
              className="rounded-2xl bg-black px-8 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join"}
            </motion.button>
          </div>

          <p className="mt-6 text-sm text-white/70">
            No spam. Early access only.
          </p>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-10 rounded-2xl bg-white/20 p-6 backdrop-blur"
        >
          <h3 className="text-2xl font-bold">
            🎉 You're on the waitlist!
          </h3>

          <p className="mt-3 text-white/90">
            We'll let you know as soon as Orenios AI launches.
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}