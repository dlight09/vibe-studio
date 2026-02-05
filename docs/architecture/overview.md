# Architecture Overview

Document ID: VS-ARCH-OVERVIEW

Version: 0.1

Status: Draft

Last updated: 2026-02-05

## Goals

- Single-studio class scheduling and booking.
- Server-first by default (Server Components, Server Actions).
- Clear separation: UI -> server actions -> database.

## System Diagram

Member/Staff Browser
  |
  | Next.js App Router (RSC)
  |  - pages (RSC)
  |  - client components for interactivity
  |  - API routes (minimal)
  v
Server Actions / Route Handlers
  |
  | Prisma Client
  v
PostgreSQL

## Key Components

- Auth: cookie-based JWT session (`lib/actions/auth.ts`).
- Booking engine: booking/cancel/waitlist promotion (`lib/actions/bookings.ts`).
- Membership engine: plans, purchases, entitlements (`lib/actions/membership.ts`).
- Admin operations: create/edit classes, analytics (`lib/actions/admin.ts`).
- Instructor operations: availability, time off, conflict checks (`lib/actions/instructors.ts`).
- Audit logging: best-effort write-once events (`lib/audit.ts`, `AuditLog` model).

## API Surface

- Prefer Server Actions for mutations.
- Keep Route Handlers only for boundary cases (e.g. `app/api/bookings`).

## Deployment Notes

- V1 assumes Postgres is available.
- For production, prefer `prisma migrate` over `prisma db push`.
