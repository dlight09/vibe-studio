# V2 Acceptance (Membership + Counter Payments)

V2 is "ready" when the following scenarios pass end-to-end in a seeded environment.

## Staff/Admin

### Plans
- Create a plan (unlimited and credit-based).
- Deactivate and reactivate a plan.

### Counter Sales
- Sell an unlimited plan; member shows active subscription.
- Sell a credit plan; member credit balance increases.

### Member Management
- Adjust credits as admin (positive and negative deltas).
- Audit log contains PLAN_CREATE, PURCHASE_CREATE, PAYMENT_RECORD, CREDIT_ADJUST.

## Member

### Booking Eligibility
- Member with unlimited subscription can book.
- Member with credits can book.
- Member with no credits and no unlimited is blocked.

### Credits
- Booking with credits consumes 1 credit.
- Cancellation outside window refunds 1 credit.
- Cancellation inside window is blocked for members.

### Waitlist
- Waitlist promotion requires eligibility.
- Promotion consumes 1 credit when member is credit-based.

## Admin Overrides

- Admin waitlist promotion consumes 1 credit when member is credit-based.
- Admin capacity override consumes 1 credit when member is credit-based.

## Non-functional

- `npm run build` succeeds.
- `npm run db:push` and `npm run db:seed` succeed on Postgres.
