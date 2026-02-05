# Vibe Studio V1 Requirements

Document ID: VS-PRD-V1

Version: 0.1

Status: Draft

Last updated: 2026-02-05

Owner: Product + Engineering

## 1. Scope

V1 delivers a single-studio class scheduling and booking platform for a premium fitness studio.

Multi-location is explicitly out of scope for V1.

## 2. Personas

- Member: discovers and books classes.
- Staff: manages schedules, instructors, and rosters.
- Admin: staff permissions plus overrides and configuration.

## 3. Functional Requirements

### 3.1 Member

- REQ-M-001: Member can authenticate and access an authenticated dashboard.
- REQ-M-002: Member can browse classes on a schedule view.
- REQ-M-003: Member can filter classes by class type/category, instructor, and intensity.
- REQ-M-004: Member can book a class if eligible and a spot is available.
- REQ-M-005: Member cannot book overlapping classes.
- REQ-M-006: If a class is full, member can join the waitlist.
- REQ-M-007: Member can cancel a booking outside the cancellation window.
- REQ-M-008: Member can view upcoming bookings and waitlist positions.

### 3.2 Staff/Admin

- REQ-A-001: Staff/Admin can create class types.
- REQ-A-002: Staff/Admin can create one-off classes.
- REQ-A-003: Staff/Admin can edit class details (time, instructor, capacity, room).
- REQ-A-004: Staff/Admin can view bookings and waitlist per class.
- REQ-A-005: Staff/Admin can promote members from the waitlist.

### 3.3 Instructor Management

- REQ-I-001: Staff/Admin can create and edit instructors.
- REQ-I-002: Staff/Admin can set instructor availability rules.
- REQ-I-003: Staff/Admin can record instructor time off.
- REQ-I-004: System prevents assigning an instructor to overlapping classes.
- REQ-I-005: If availability exists for an instructor, system prevents scheduling outside availability.
- REQ-I-006: Staff/Admin can swap a class instructor with a reason.

### 3.4 Rules and Automation

- REQ-R-001: System enforces capacity and booking status transitions.
- REQ-R-002: System auto-promotes from waitlist when a confirmed booking is cancelled.
- REQ-R-003: System enforces cancellation window.
- REQ-R-004: Admin can override scheduling conflicts with a documented reason.

### 3.5 Auditability

- REQ-U-001: System records an audit event for key staff/admin actions (class create/update/delete, instructor updates, waitlist promotions, overrides).
- REQ-U-002: Staff/Admin can view audit events.

## 4. Non-Functional Requirements

- NFR-001: Mobile-first UI; key actions accessible within 2 taps/clicks from schedule.
- NFR-002: Booking/cancel provides immediate feedback with no full-page reload.
- NFR-003: Server-side authorization enforced on all mutations.
- NFR-004: Database is Postgres; schema changes are managed via Prisma.
- NFR-005: Seeded demo data supports local testing.

## 5. Out of Scope (V1)

- Multi-location support.
- Payments, subscriptions, and credit packs.
- Recurring class series with exceptions.
- Email/SMS notifications.
- Instructor portal (instructor login).
