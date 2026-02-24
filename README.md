# BetPlay — Betting Platform

A mobile-first, gamified betting application built with **Next.js 16**, **Supabase** (PostgreSQL + Auth), and **Tailwind CSS**.

## Tech Stack

- **Frontend:** Next.js 16 (App Router, Server Components)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (Mobile OTP)

## Getting Started

```bash
pnpm install
pnpm dev
```

### Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Database Setup

Run the SQL in `supabase/migrations/20240101000000_init.sql` against your Supabase project via the SQL Editor.

## Features

- **Panna Sorting Logic** — Custom digit ordering where 0 = 10 (highest). Fully unit-tested.
- **Gamified Dashboard** — Markets glow green/red, live countdown timers, animated wallet.
- **Smart Autocomplete** — Suggests valid Panna combinations as you type.
- **Atomic Bet Placement** — PostgreSQL `FOR UPDATE` row-level locks prevent double-deduction and negative balances.
- **Admin Dashboard** — Toggle markets, declare results, monitor live bets, daily reset.

## Scalability Note

> **If 100,000 users bet at 11:59 AM, how would you prevent the database from crashing?**

At this scale, the primary bottleneck is the `place_bet` PostgreSQL function, which acquires a row-level lock (`SELECT ... FOR UPDATE`) on the user's profile row during each bet transaction. Since each user locks only _their own row_, 100K different users can bet concurrently without contending for the same lock — this scales linearly.

To handle this volume in production, we would:

1. **Connection Pooling** — Use PgBouncer (Supabase has this built in) to manage thousands of concurrent connections efficiently, preventing connection exhaustion.
2. **Read Replicas** — Offload all read queries (dashboard views, market listings) to read replicas, keeping the primary database free for write-heavy bet transactions.
3. **Queue-Based Architecture** — Instead of writing directly to the database, push bets into a message queue (e.g., Redis Streams or AWS SQS). A pool of workers processes bets serially per user, ensuring ordering and preventing contention.
4. **Horizontal Partitioning** — Partition the `bets` table by date (`created_at`) so that daily queries ("today's bets") scan only the relevant partition, not the entire historical table.
5. **Rate Limiting** — Apply per-user rate limits (e.g., max 5 bets per second) at the API gateway level (Vercel Edge Middleware or Cloudflare) to prevent abuse and reduce spike load.
6. **CDN & Edge Caching** — Serve the market listing and static assets from edge locations to reduce origin server load.

## Deploy on Vercel

```bash
vercel deploy
```

Set the environment variables in the Vercel dashboard under Project Settings → Environment Variables.
