# Booking and Waitlist

Document ID: VS-ARCH-BOOKING

Version: 0.1

Status: Draft

Last updated: 2026-02-05

## Booking States

- CONFIRMED: counts against capacity.
- CANCELLED: does not count against capacity.

Waitlist entries exist separately from bookings.

## Core Rules

- Capacity: confirmed bookings cannot exceed capacity.
- Double booking: a member cannot have overlapping confirmed bookings.
- Waitlist: if class is full, member is appended with a position.
- Promotion: when a spot opens, promote from the top of the waitlist.
- Cancellation: blocked inside cancellation window for members.
- Eligibility: booking requires an active unlimited subscription or available credits.
- Credit consumption: when a booking is confirmed without unlimited access, consume 1 credit.
- Credit refund: when a member cancels outside the cancellation window, refund 1 credit.

## Implementation

- Booking entry point: `lib/actions/bookings.ts:bookClass()`.
- Cancellation: `lib/actions/bookings.ts:cancelBooking()`.
- Promotion: `lib/actions/bookings.ts:promoteFromWaitlist()`.
- Admin promotion/override: `lib/actions/admin.ts:promoteFromWaitlistAdmin()` and `lib/actions/admin.ts:overrideCapacity()`.

## Known Gaps (Production)

- Concurrency: promotions and bookings should be transactional (DB-level locking) to avoid race conditions.
- Waitlist offers: time-bounded offers and expiry are not implemented.
- Credit balance concurrency: entitlement checks occur before credit consumption; concurrent bookings may overspend without DB-level locking.
