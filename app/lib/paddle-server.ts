import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_API_KEY;

if (!apiKey) {
  throw new Error("Missing required PADDLE_API_KEY environment variable");
}

// NEXT_PUBLIC_PADDLE_ENV drives both the client-side Paddle.js init and
// this server SDK, so sandbox/production never drift apart between the
// two sides of the same request.
const environment =
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? Environment.production
    : Environment.sandbox;

export const paddle = new Paddle(apiKey, { environment });
