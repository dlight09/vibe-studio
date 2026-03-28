# Vibe Studio - Class Scheduling & Booking Platform

A modern, premium fitness studio booking system built with Next.js App Router, PostgreSQL, and Server Components.

This repository now includes production hardening for session security, transactional booking/waitlist flows, CI checks, and optional Stripe checkout integration.

## Features

### Member Experience
- **Dashboard**: View upcoming bookings, waitlist status, and membership info
- **Schedule**: Browse classes by day, filter by category, intensity, or instructor
- **One-click Booking**: Book classes instantly with real-time availability
- **Waitlist**: Automatically join waitlist when classes are full
- **Cancellation**: Cancel bookings within the allowed window
- **Entitlements**: Booking requires unlimited membership or available class credits
- **Mobile-first**: Responsive design for all devices

### Staff/Admin Experience
- **Class Management**: Create and edit classes, set capacity, assign instructors
- **Waitlist Management**: View and promote members from waitlist
- **Override Capacity**: Manually add members beyond capacity
- **Plans & Members**: Create plans, sell at counter, and adjust member credits
- **Online Checkout**: Optional Stripe checkout flow with webhook-based entitlement provisioning
- **Analytics**: Track fill rates, popular classes, and attendance
- **Attendance Tracking**: Mark no-shows and track member attendance

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Custom CSS (no external UI kits)
- **Authentication**: JWT-based with bcrypt
- **Payments**: Stripe Checkout + webhook (optional)
- **Date Handling**: date-fns
- **Testing**: Vitest
- **CI**: GitHub Actions (`.github/workflows/ci.yml`)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running at `localhost:5432` (or update `DATABASE_URL`)

### Installation

1. Clone the repository:
```bash
cd vibe-studio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Postgres URL and other settings.
# APP_SESSION_SECRET (or NEXTAUTH_SECRET) must be 32+ characters.
```

4. Initialize the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

### Quality Checks

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Visit `http://localhost:3000` to see the app. If you don't have Postgres running locally, start one (e.g., Docker) before running dev/build commands.

## Documentation

Start here: `docs/README.md`.

## Demo Accounts

After seeding the database, use these accounts to test:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vibestudio.com | admin123 |
| Staff | staff@vibestudio.com | admin123 |
| Member (unlimited) | sarah@example.com | member123 |
| Member (credits) | mike@example.com | member123 |

## Project Structure

```
app/
├── layout.tsx              # Root layout with navigation
├── page.tsx                 # Landing page
├── login/                   # Authentication pages
├── schedule/               # Class schedule with calendar
├── dashboard/              # Member dashboard
├── admin/                  # Admin dashboard
│   ├── classes/           # Class management
│   ├── members/           # Member management
│   ├── plans/             # Plan management
│   └── analytics/         # Analytics view
├── api/                    # API routes
└── globals.css             # Global styles

components/
├── calendar/               # Calendar and class card components
├── booking/               # Booking modal
└── ui/                    # Shared UI components

lib/
├── actions/               # Server actions (auth, bookings, admin)
├── db.ts                  # Prisma client
└── utils.ts               # Utility functions

prisma/
├── schema.prisma          # Database schema
└── seed.ts               # Demo data seeding
```

## Database Schema

Key models:
- **User**: Members, staff, and admins
- **ClassType**: Categories like Yoga, Pilates, Barre
- **Class**: Individual class instances
- **Instructor**: Staff who teach classes
- **Booking**: Member reservations
- **WaitlistEntry**: Queue for full classes
- **Attendance**: Check-in records
- **Plan**: Membership and credit pack products
- **Purchase**: Sales records for plans
- **Payment**: Counter payment records
- **Payment**: Counter and Stripe card payment records
- **MemberSubscription**: Active unlimited memberships
- **CreditLedgerEntry**: Credit adjustments and consumption

## Configuration

Edit `prisma/seed.ts` to customize:
- Studio name and settings
- Class types and categories
- Instructors and their specialties
- Initial class schedule

## Deployment

Recommended stack: Vercel + managed Postgres (Neon/Supabase) + Stripe + structured app logs.

1. Set up a managed PostgreSQL database
2. Configure environment variables (`DATABASE_URL`, `APP_URL`, `APP_SESSION_SECRET`, Stripe secrets if using online checkout)
3. Generate Prisma client and apply schema updates:
```bash
npm run db:generate
npm run db:push
```
4. Verify checks:
```bash
npm run test
npm run typecheck
npm run lint
```
5. Build and deploy:
```bash
npm run build
npm start
```

See `docs/runbook/production-deploy.md` for the full deployment checklist.

## License

MIT
