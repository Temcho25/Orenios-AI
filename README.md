# Orenios

Orenios is a personal AI Life Admin: a single workspace where tasks, goals, calendar, notes, daily focus, and an AI Coach are connected. The core idea is that the AI should do the work, not just talk about it — it can create and edit tasks, break a goal into steps, reschedule your day, and turn a spoken plan into calendar events, with your confirmation before anything is saved.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + [React](https://react.dev) 19, TypeScript in strict mode
- [Tailwind CSS](https://tailwindcss.com) v4
- [Framer Motion](https://www.framer.com/motion/) for animation
- [Supabase](https://supabase.com) for Auth and Postgres (`@supabase/supabase-js`, `@supabase/ssr`)
- [OpenAI](https://platform.openai.com) for the AI Coach and voice-plan parsing
- [Upstash Redis](https://upstash.com) for rate limiting
- [Vercel](https://vercel.com) for deployment and analytics
- [Vitest](https://vitest.dev) for unit tests

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your own Supabase/OpenAI/Upstash keys
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Quality gates

```bash
npm run lint        # ESLint
npx tsc --noEmit     # TypeScript
npm run test         # Vitest unit tests
npm run build        # production build
```

All four should be clean before opening a PR.
