# Vibe Studio V2 Requirements

Document ID: VS-PRD-V2

Version: 0.1

Status: Draft

Last updated: 2026-02-05

Owner: Product + Engineering

## 1. Scope

V2 adds membership plans, counter payments, and credit-based entitlements. Booking is now gated by an active unlimited subscription or available credits.

## 2. Personas

- Member: books classes and manages entitlements.
- Staff: sells plans and manages member entitlements.
- Admin: staff permissions plus plan lifecycle and credit adjustments.

## 3. Functional Requirements

### 3.1 Member

- REQ-M-101: Member can view current entitlement status (unlimited or credits).
- REQ-M-102: Member can book only if entitlement is available.
- REQ-M-103: Member is blocked from booking if no entitlement exists.
- REQ-M-104: Member credit bookings consume 1 credit.
- REQ-M-105: Credit booking cancellation outside window refunds 1 credit.

### 3.2 Staff/Admin

- REQ-A-101: Staff/Admin can sell plans at counter with payment method.
- REQ-A-102: Staff/Admin can view member entitlements and ledger.
- REQ-A-103: Admin can adjust member credits with a reason.

### 3.3 Plan Management

- REQ-P-101: Admin can create membership plans (unlimited, pack, drop-in).
- REQ-P-102: Admin can deactivate/activate plans.

### 3.4 Booking Rules and Automation

- REQ-R-101: Waitlist promotions require entitlement checks.
- REQ-R-102: Admin promotions/overrides consume credits when applicable.

### 3.5 Auditability

- REQ-U-101: System records membership and payment events (plan create/update, purchase, payment, credit adjust).

## 4. Non-Functional Requirements

- NFR-101: Entitlement checks and bookings provide immediate feedback.
- NFR-102: Server-side authorization enforced for all membership and payment actions.
- NFR-103: Seeded demo data supports membership testing.

## 5. Out of Scope (V2)

- Online payment processing.
- Automatic billing/renewals.
- Member self-serve plan purchase.
