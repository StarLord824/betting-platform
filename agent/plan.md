Technical Assessment: Betting Platform

### Position: Full Stack Developer (React/Node/Postgres)
Duration: 5 days

### Objective

Build a mobile-first, high-performance betting application focusing on:

- Gamified UI/UX—The interface must feel like a modern game app, not a data entry form.
- Scalable Backend—The system must handle concurrent bets and daily market resets efficiently.
- Complex Logic—Correct implementation of the "Panna" sorting rules.

### Tech Stack Requirements

- Frontend: ReactJS / Next.js (must be deployed on Vercel)
- Backend: Node.js (Express or NestJS) or Next.js API Routes
- Database: PostgreSQL (hosted on Supabase)
- Auth: Supabase Auth (Mobile OTP). Note: You can use a mock/test OTP if SMS limits are an issue.

### Core Game Logic (The "Panna" Rule)

This is the most critical part of the assignment. In this game system, **0 is the greatest digit (valued as 10).**

- **Value Order:** 1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 0

**Validation & Auto-Sorting:**
When a user plays a "Panna" (3 digits), the system must automatically sort the input based on the value order above.

**Example A (Standard):**

- User types: 1, 4, 2
 System converts to: 124 (ascending order)

**Example B (The Zero Logic):**

- User types: 5, 0, 2
 Logic: 2 is smallest, 5 is middle, 0 is largest (10), System converts to:250

### User App (Mobile Web—Gamified UI)

### A. Authentication

● Login via mobile number + OTP

### B. The Dashboard (Gamified)

● Display 3 markets clearly:

1. Laxmi Morning (09:00 AM–12:00 PM)
2. Shridevi Morning (01:00 PM–3:00 PM)
3. Karnatak Day (04:00 PM–7:00 PM)

● Visual Status: Markets glow green when open, red/grey when closed.
● Countdown: Display a "Time Left to Bet" ticker for open markets.

### C. Betting Interface (Autocomplete & Validation)

- Input Field: Replace the basic text box with smart autocomplete.
    - Behavior: As the user types (e.g., "1..."), display valid Panna suggestions like "120", "130", "140".
- Game Types:
    - Single Digit: (0–9)
    - Jodi: (00–99)
    - Single Panna: 3 unique digits (e.g., 123)
    - Double Panna: 2 digits the same (e.g., 112)
    - Triple Panna: All 3 digits the same (e.g., 777)
- Wallet: Start each user with ₹50,000 (dummy currency).
    - UX: Animate the wallet balance deduction when a bet is placed.

### Admin Dashboard (Web View)

1. Access
    - Simple email/password login
2. Market Control
    - Ability to set open time and close time for the 3 markets
    - Daily Reset Logic: The system must distinguish between "Today's Bets" and "Yesterday's Bets." When a new day starts, the market opens fresh.
3. Live Monitoring
    - Real-time Feed: A table showing live bets coming in
    - Result Declaration: Admin selects a market → inputs the winning number → system stores it

### Backend & Scalability (Evaluation Criteria)

1. Database Schema (PostgreSQL)
    - Do NOT store bets as a simple JSON string.
    - We expect a relational schema: Users → Markets → Bets.
    - Why? We need to query: "How many users bet on Single Panna '120' today?"
2. API Security
    - Validation: Ensure a user cannot place a bet if the market is closed (check time on server-side, not just client-side).
    - Concurrency: What happens if a user bets twice quickly? Handle this to prevent double deduction or negative wallet balance.

### Submission

1. GitHub Repo: Clean code, proper folder structure
2. Live Demo Link: Deployed on Vercel
3. Scalability Note (README):
○ Write a short paragraph in your README: "If 100,000 users bet at 11:59 AM, how would you prevent the database from crashing?"