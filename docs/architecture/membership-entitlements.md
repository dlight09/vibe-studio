# Membership and Entitlements

Document ID: VS-ARCH-MEMBERSHIP

Version: 0.2

Status: Draft

Last updated: 2026-02-05

## Goals

- Allow bookings only for members with active unlimited access or available credits.
- Support staff-managed, counter-based sales (no online payments).
- Record financial and entitlement events with audit logging.

## Data Model

- Plan
  - type: UNLIMITED, CLASS_PACK, DROP_IN
  - durationDays for unlimited; credits + creditExpiryDays for packs/drop-in
- Purchase
  - a sales record for a plan
- Payment
  - counter payment record (cash/card/comp/adjustment)
- MemberSubscription
  - active unlimited memberships with start/end dates
- CreditLedgerEntry
  - ledger for class credits (positive or negative) with optional expiry

## Entitlement Rules

- Active unlimited: a MemberSubscription with status ACTIVE, within start/end, and plan type UNLIMITED.
- Credits: sum of CreditLedgerEntry deltas where expiresAt is null or in the future.
- Eligibility: a member can book if active unlimited OR credit balance > 0.

## Booking and Cancellation Behavior

- Booking (confirmed):
  - If unlimited: no credit change.
  - If credit-based: create CreditLedgerEntry with delta -1, reason BOOKING_CONSUME.
- Cancellation:
  - Inside cancellation window: blocked for members; no credit change.
  - Outside window: if a BOOKING_CONSUME entry exists, add CreditLedgerEntry with delta +1, reason CANCEL_REFUND.
- Waitlist promotion:
  - Re-check eligibility.
  - If eligible and not unlimited: consume 1 credit on promotion.

## Admin Workflows

- Sell plan at counter: creates Purchase + Payment, then
  - UNLIMITED: creates MemberSubscription.
  - PACK/DROP_IN: creates CreditLedgerEntry (PURCHASE).
- Adjust credits (admin only): writes CreditLedgerEntry with reason MANUAL_ADJUST.

## Audit Logging

- PLAN_CREATE / PLAN_UPDATE
- PURCHASE_CREATE
- PAYMENT_RECORD
- SUBSCRIPTION_CREATE
- CREDIT_ADJUST
- Booking and waitlist actions include `creditConsumed` metadata when relevant.

## Known Gaps (Production)

- Credit balance checks occur before consumption; concurrent bookings may overspend without DB-level locking.
- No idempotency keys for counter sales.
- No automated expiry cleanup job for old credit entries.
