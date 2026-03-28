# Observability

Document ID: VS-ARCH-OBSERVABILITY

Version: 0.1

Status: Draft

Last updated: 2026-03-28

## Scope

Observability is currently implemented with structured application logs and audit records.

## Structured Logs

- Utility: `lib/observability.ts`
- Format: JSON lines with `level`, `event`, `timestamp`, and metadata payload
- Current usage:
  - Booking API failures (`api.bookings.*.failed`)
  - Payment checkout API failures (`api.payments.checkout.failed`)
  - Stripe webhook signature and processing failures (`api.stripe.webhook.*`)
  - Audit write failures (`audit.write.failed`)

## Audit Logging

- Utility: `lib/audit.ts`
- Model: `AuditLog`
- Goal: immutable, best-effort record of business-critical events

## Operational Notes

- Logs are stdout/stderr friendly for Vercel and container runtimes.
- Alerting and trace correlation are not yet implemented.
- For next step, connect JSON log stream to a managed observability provider.
