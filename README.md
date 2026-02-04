# Vibe Studio - Class Scheduling & Booking Platform

A modern, premium fitness studio booking system built with Next.js App Router, PostgreSQL, and Server Components.

## Features

### Member Experience
- **Dashboard**: View upcoming bookings, waitlist status, and membership info
- **Schedule**: Browse classes by day, filter by category, intensity, or instructor
- **One-click Booking**: Book classes instantly with real-time availability
- **Waitlist**: Automatically join waitlist when classes are full
- **Cancellation**: Cancel bookings within the allowed window
- **Mobile-first**: Responsive design for all devices

### Staff/Admin Experience
- **Class Management**: Create and edit classes, set capacity, assign instructors
- **Waitlist Management**: View and promote members from waitlist
- **Override Capacity**: Manually add members beyond capacity
- **Analytics**: Track fill rates, popular classes, and attendance
- **Attendance Tracking**: Mark no-shows and track member attendance

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Custom CSS (no external UI kits)
- **Authentication**: JWT-based with bcrypt
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

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
# Edit .env with your database URL and other settings
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

Visit `http://localhost:3000` to see the app.

## Demo Accounts

After seeding the database, use these accounts to test:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vibestudio.com | admin123 |
| Staff | staff@vibestudio.com | admin123 |
| Member | sarah@example.com | member123 |

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

## Configuration

Edit `prisma/seed.ts` to customize:
- Studio name and settings
- Class types and categories
- Instructors and their specialties
- Initial class schedule

## Deployment

1. Set up a PostgreSQL database
2. Configure environment variables
3. Run database migrations:
```bash
npm run db:generate
npm run db:push
```
4. Build and deploy:
```bash
npm run build
npm start
```

## License

MIT
