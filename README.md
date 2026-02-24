# ⚡ BetPlay — Premium Betting Platform

A mobile-first, gamified betting application featuring the **Panna** number system with real-time market tracking, smart autocomplete, and an admin control center.

**Live Demo:** [bet-play-neon.vercel.app](https://bet-play-neon.vercel.app/)

## Tech Stack

| Layer          | Technology                                                 |
| -------------- | ---------------------------------------------------------- |
| **Frontend**   | Next.js 16 (App Router, Server Components, Turbopack)      |
| **Styling**    | Tailwind CSS v4 + Framer Motion animations                 |
| **Backend**    | Next.js API Routes (serverless)                            |
| **Database**   | PostgreSQL via Supabase + Prisma ORM                       |
| **Auth**       | Supabase Auth — Mobile OTP (user) + Email/Password (admin) |
| **Deployment** | Vercel (auto-deploy from `master`)                         |

## Core Game Logic — The "Panna" Rule

In this system, **0 is the greatest digit (valued as 10):**

```
Value Order: 1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 0
```

When a user plays a Panna (3 digits), the system automatically sorts digits using this custom order:

- Input `1, 4, 2` → sorted as `124` (standard ascending)
- Input `5, 0, 2` → sorted as `250` (because 0 = 10, so: 2 < 5 < 0)

Implementation: [`lib/game-logic.ts`](lib/game-logic.ts)

## Five Game Types

| Game Type    | Input                | Example | Validation                      |
| ------------ | -------------------- | ------- | ------------------------------- |
| Single Digit | 1 digit              | `5`     | 0–9                             |
| Jodi         | 2 digits             | `42`    | 00–99                           |
| Single Panna | 3 unique digits      | `123`   | All different, auto-sorted      |
| Double Panna | 2 same + 1 different | `112`   | Exactly 2 matching, auto-sorted |
| Triple Panna | All 3 same           | `777`   | All identical                   |

## Features

### User App (Mobile-First)

- **OTP Login** — Phone number + 6-digit OTP via Supabase Auth
- **Gamified Dashboard** — Three markets with green glow when open, grey when closed
- **Live Countdown** — Real-time "Time Left to Bet" ticker (HH:MM:SS) for open markets
- **Smart Autocomplete** — As the user types Panna digits, valid sorted suggestions appear instantly
- **Animated Wallet** — Starts at ₹50,000; balance animates on deduction with a floating "-₹100" indicator
- **IST-Aware** — All time logic runs in IST (UTC+5:30), works correctly on UTC servers (Vercel)

### Admin Dashboard (Web View)

- **Email/Password Login** — Separate admin auth at `/admin/login`
- **Market Controls** — Toggle open/close, set operating hours, per-market power switches
- **Result Declaration** — Input winning number per market → system stores it and settles bets atomically
- **Daily Reset** — One-click reset clears winning numbers and reopens markets for a fresh day
- **Live Bet Feed** — Real-time table showing Time, User, Market, Game Type, Number, and Amount

### Three Markets

| Market           | Default Hours       |
| ---------------- | ------------------- |
| Laxmi Morning    | 09:00 AM – 12:00 PM |
| Shridevi Morning | 01:00 PM – 03:00 PM |
| Karnatak Day     | 04:00 PM – 07:00 PM |

## Database Schema (Relational)

```
Users (auth.users) ──┐
                      ├── profiles (id, phone_number, role, balance)
                      │       │
                      │       ├── bets (id, user_id, market_id, game_type, number, amount, status)
                      │       │
                      │       └── markets (id, name, open_time, close_time, is_active, today_winning_number)
                      │               │
                      │               └── bets ──┘
```

Bets are stored relationally (`Users → Markets → Bets`), enabling queries like:

> "How many users bet on Single Panna '120' today?"

```sql
SELECT COUNT(DISTINCT user_id)
FROM bets
WHERE game_type = 'single_panna'
  AND number = '120'
  AND created_at >= CURRENT_DATE;
```

## API Security

### Server-Side Time Validation

The API rejects bets if the current IST time is outside market hours — enforced server-side, not just client-side. This prevents users from bypassing the frontend clock.

### Concurrency & Double-Deduction Prevention

Bet placement uses a **Prisma `$transaction`** block that:

1. Fetches the user's profile inside the transaction
2. Deducts the balance atomically
3. Checks `balance >= 0` after deduction — if negative, the transaction rolls back entirely
4. Creates the bet record only if balance is sufficient

This guarantees no double-deduction even if a user submits two bets simultaneously.


## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)

### Setup

```bash
# Clone and install
git clone https://github.com/StarLord824/betting-platform.git
cd betting-platform
npm install

# Configure environment
cp .env.example .env.local
# Fill in your Supabase credentials (see below)

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

### Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
DATABASE_URL=<your-supabase-postgres-connection-string>
```

### Database Setup

Run the Prisma schema against your Supabase project:

```bash
npx prisma db push
```

Or use the SQL Editor in Supabase to create the `profiles`, `markets`, and `bets` tables.

### Test Credentials

| Role  | Phone / Email | OTP / Password |
| ----- | ------------- | -------------- |
| Admin | +910000000000 | 123456         |
| User  | +910000000001 | 123456         |

## Deploy on Vercel

```bash
vercel deploy
```

Set the environment variables in Vercel Dashboard → Project Settings → Environment Variables. The `postinstall` script automatically runs `prisma generate` during Vercel builds.

## Project Structure

```
├── app/
│   ├── (auth)/login/          # User OTP login
│   ├── (auth)/admin/login/    # Admin email/password login
│   ├── (user)/dashboard/      # User dashboard with LIVE markets
│   ├── (user)/market/[id]/    # Market detail + betting form
│   ├── admin/                 # Admin dashboard + market controls
│   └── api/
│       ├── bets/              # POST /api/bets — atomic bet placement
│       └── admin/markets/     # PATCH — toggle, declare, reset
├── components/
│   ├── betting/betting-form.tsx      # Smart autocomplete + validation
│   └── dashboard/
│       ├── countdown-timer.tsx       # Live HH:MM:SS countdown
│       ├── market-controls.tsx       # Admin market control panel
│       └── wallet-display.tsx        # Animated wallet with Framer Motion
├── lib/
│   ├── game-logic.ts                 # Panna sorting + validation
│   ├── db/index.ts                   # Prisma client (pg adapter)
│   └── supabase/                     # Client + server Supabase helpers
└── prisma/schema.prisma              # Relational schema
```

## Scalability Note

> **If 100,000 users bet at 11:59 AM, how would you prevent the database from crashing?**

At this scale, the primary bottleneck is the `$transaction` block that acquires a row-level lock on the user's profile during each bet. Since each user locks only _their own row_, 100K different users can bet concurrently without contending for the same lock — this scales linearly.

To handle this volume in production:

1. **Connection Pooling** — PgBouncer (built into Supabase) manages thousands of concurrent connections, preventing connection exhaustion.
2. **Read Replicas** — Offload read queries (dashboard views, market listings) to replicas, keeping the primary free for write-heavy bet transactions.
3. **Queue-Based Architecture** — Push bets into a message queue (Redis Streams / AWS SQS). Workers process bets serially per user, ensuring ordering and preventing contention.
4. **Table Partitioning** — Partition the `bets` table by date (`created_at`) so daily queries scan only the relevant partition.
5. **Rate Limiting** — Per-user rate limits (max 5 bets/second) at the API gateway (Vercel Edge Middleware) to prevent abuse.
6. **CDN & Edge Caching** — Serve market listings and static assets from edge locations to reduce origin load.