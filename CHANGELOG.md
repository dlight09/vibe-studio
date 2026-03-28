# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

## Unreleased

### Added
- Online checkout integration with Stripe session creation and webhook fulfillment.
- Structured application logging utility and dedicated observability/deployment runbooks.
- Automated test suite with Vitest and CI pipeline running lint, typecheck, tests, and build.

### Changed
- Booking, cancellation, and waitlist promotion now execute in serializable transactions with retry handling.
- Authentication now requires a strong configured session secret and includes basic login rate limiting.
- Project setup now documents quality gates and production deployment workflow.

### Fixed
- Transactional entitlement checks now reduce race-condition risk for booking and waitlist credit consumption.
- API handlers now emit explicit failure logs for booking and payment endpoints.

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
