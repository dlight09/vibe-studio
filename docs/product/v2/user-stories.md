# V2 User Stories

Document ID: VS-US-V2

Version: 0.1

Status: Draft

Last updated: 2026-02-05

Format:
- ID
- As a <role>, I want <capability> so that <benefit>
- Acceptance criteria

## Member

### US-M-101 View Entitlements

As a member, I want to see my current entitlement status so that I know if I can book.

Acceptance criteria:
- Schedule page shows unlimited or credit badge.
- Dashboard shows membership plan or credit balance.

### US-M-110 Book with Credits

As a member, I want to book using credits so that I can attend classes without a subscription.

Acceptance criteria:
- Booking succeeds when credit balance > 0.
- Credit balance decreases by 1 after booking.

### US-M-111 Blocked Booking

As a member, I want a clear message when I have no entitlements so that I know what to do next.

Acceptance criteria:
- Booking attempt returns an error when no credits or unlimited subscription exist.

### US-M-120 Credit Refund

As a member, I want a credit refunded when I cancel outside the window so that my balance is accurate.

Acceptance criteria:
- Cancel outside the window creates a refund ledger entry.

## Staff/Admin

### US-A-101 Sell Plan at Counter

As staff, I want to sell a plan at the front desk so that members get access immediately.

Acceptance criteria:
- Sale records purchase + payment.
- Member entitlement reflects the plan (subscription or credits).

### US-A-102 View Member Entitlements

As staff, I want to view a member’s entitlements and ledger so that I can help with questions.

Acceptance criteria:
- Member detail page shows subscriptions, purchases, and credit ledger.

### US-AD-101 Adjust Credits

As an admin, I want to adjust credits with a reason so that exceptions are traceable.

Acceptance criteria:
- Admin-only form requires a reason.
- Adjustment creates a ledger entry and audit log.

### US-AD-110 Manage Plans

As an admin, I want to create and deactivate plans so that offerings stay current.

Acceptance criteria:
- Admin can create plans.
- Admin can activate/deactivate plans.

## Auditability

### US-U-101 Audit Membership Events

As staff/admin, I want to see membership and payment events in the audit log so that changes are traceable.

Acceptance criteria:
- Audit log includes plan create/update, purchases, payments, and credit adjustments.
