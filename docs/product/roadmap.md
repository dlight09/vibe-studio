# Vibe Studio Roadmap (Single Studio, Staff-Managed Instructors)

## Phase 0 — Stabilize
- Remove styled-jsx from Server Components (done)
- Green build (`npm run build`), lint/typecheck
- Standardize CSS usage (globals/modules)
- Fix schedule cancel bug, instructor specialties typing (done)

## Phase 1 — Instructor Management v1
- Admin instructor CRUD with active/inactive
- Instructor profile: bio, specialties/tags, upcoming classes
- Conflict checks: prevent double-booking instructor time
- Availability + time-off model (weekly rules + blackout dates)
- Substitution flow: swap instructor per occurrence or forward
- Audit log for overrides

## Phase 2 — Scheduling Engine
- ClassSeries + ClassOccurrence (recurrence + exceptions)
- Room/resource constraints, buffers
- "Edit this occurrence" vs "edit series" in UI

## Phase 3 — Booking Engine Hardening
- Transactional booking + waitlist promotion
- Double-booking prevention across overlapping times
- Cancellation policy (late cancel vs no-show)
- Membership enforcement (expired/credits)

## Phase 4 — Communications
- Email/SMS: booking, cancel, waitlist promotion, class cancel, reminders
- Waitlist offer windows + auto-expire

## Phase 5 — UX & Performance
- Calendar UX: month/week/day, fast filters, real-time updates
- Toasts + optimistic actions (no alerts)
- Loading skeletons, mobile nav polish

## Phase 6 — Analytics
- Fill rate, waitlist pressure, instructor performance, no-shows
- Exports/CSVs, dashboards for staff

## Notes
- Single studio now; model is ready to extend to multi-studio later (add Studio, Room, Resource models).
- Postgres recommended before Phase 2 for recurrence + constraints + concurrency.
