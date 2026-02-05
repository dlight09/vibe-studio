# ADR 0003: Membership via Counter Payments

Status: Accepted

Date: 2026-02-05

## Context

We need to enforce paid access without integrating a payment gateway yet. The studio sells memberships at the front desk and issues class credits.

## Decision

- Use a counter-payment model with explicit sales records (Purchase + Payment).
- Represent entitlements via a CreditLedgerEntry (packs/drop-in) and MemberSubscription (unlimited).
- Keep legacy `User.membershipType` and `User.membershipExpiresAt` fields for compatibility during transition.

## Consequences

- Booking eligibility is now a function of entitlements, not legacy fields.
- Admin workflows must create purchases/payments and entitlements.
- Audit logging expands to include membership and payment events.
- Concurrency hardening remains a follow-up (transactional credit balance checks).
