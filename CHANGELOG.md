# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

## Unreleased

## v2.0.0 - 2026-02-05

### Added
- Membership plans with counter sales, payments, and credit ledger tracking.
- Admin plan management (`/admin/plans`) and member entitlement management (`/admin/members`).
- Entitlement badges on schedule (unlimited / credits / none).

### Changed
- Booking now requires an active unlimited subscription or available credits.
- Waitlist promotion and admin overrides consume credits when applicable.

### Fixed
- Waitlist promotion eligibility now evaluates entitlements without a session context.

### Known Gaps
- Credit balance checks are not fully transactional; concurrent bookings may overspend without DB-level locking.

## v1.0.0 - 2026-02-05

### Added
- Member schedule browse/filter/book/cancel with waitlist and overlap prevention.
- Staff/admin class management (create/edit) with instructor conflict checks and admin override.
- Instructor management with availability and time off.
- Instructor swap workflow with required reason.
- Audit log model, writers, and admin viewer.

### Changed
- Booking UX: toasts + loading states.

### Fixed
- Booking cancel flow now targets booking id correctly.
