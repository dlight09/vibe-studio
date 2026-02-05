# Manual Test Scripts (V2)

Document ID: VS-QA-MANUAL-V2

Version: 0.1

Status: Draft

Last updated: 2026-02-05

Pre-req: local env seeded (`npm run db:seed`).

## QA-V2-010 Plan management

1) Admin: `/admin/plans`.
2) Create an unlimited plan and a credit plan.
3) Deactivate and reactivate one plan.

## QA-V2-020 Counter sale (unlimited)

1) Staff/Admin: `/admin/members/[id]`.
2) Sell an unlimited plan at counter.
3) Verify active subscription and end date show in the member card.

## QA-V2-021 Counter sale (credits)

1) Staff/Admin: `/admin/members/[id]`.
2) Sell a credit plan at counter.
3) Verify credit balance increases and ledger entry exists.

## QA-V2-030 Booking eligibility

1) Login as member with unlimited; book a class (success).
2) Login as member with credits; book a class (success).
3) Login as member with no entitlements; booking is blocked.

## QA-V2-040 Credit consumption

1) Login as credit-based member.
2) Book a class; verify ledger entry `BOOKING_CONSUME` with delta -1.
3) Cancel outside cancellation window; verify `CANCEL_REFUND` entry.

## QA-V2-050 Waitlist promotion

1) Fill a class; add a credit-based user to the waitlist.
2) Cancel a confirmed booking to open a spot.
3) Verify waitlist promotion and credit consumption.

## QA-V2-060 Admin promotion/override

1) As staff/admin, promote a waitlist entry from `/admin/classes`.
2) Verify credit consumption for credit-based member.
3) Override capacity for a credit-based member; verify credit consumption.

## QA-V2-070 Audit logging

1) Admin: `/admin/audit`.
2) Verify PLAN_CREATE, PURCHASE_CREATE, PAYMENT_RECORD, CREDIT_ADJUST events exist.
