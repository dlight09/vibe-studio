# Production Deployment Runbook

## Target Stack

- Application: Vercel
- Database: managed PostgreSQL (Neon or Supabase)
- Payments: Stripe Checkout + webhook
- Monitoring: structured JSON logs from application routes and actions

## Required Environment Variables

- `DATABASE_URL`
- `APP_URL` (public app URL)
- `APP_SESSION_SECRET` (32+ random characters)
- `NEXTAUTH_SECRET` (optional fallback; keep same strength)
- `STRIPE_SECRET_KEY` (required for online checkout)
- `STRIPE_WEBHOOK_SECRET` (required for webhook verification)

## Database Setup

1. Provision Postgres and store `DATABASE_URL`.
2. Run Prisma client generation and schema sync:

```bash
npm run db:generate
npm run db:push
```

3. Seed demo data only in non-production environments:

```bash
npm run db:seed
```

## Verification Gates

Run all checks before each release:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

CI executes the same gates in `.github/workflows/ci.yml`.

## Stripe Webhook

Configure Stripe webhook endpoint:

- URL: `https://<your-domain>/api/stripe/webhook`
- Events: `checkout.session.completed`

Use Stripe CLI locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Release Checklist

1. Verify environment variables are set in deployment platform.
2. Confirm database connectivity and schema synchronization.
3. Validate checkout session creation endpoint (`POST /api/payments/checkout`).
4. Validate Stripe webhook signature and purchase fulfillment.
5. Verify booking/cancellation/waitlist behavior with seeded test accounts.
6. Inspect logs for any `*.failed` events from API handlers.
