# Local Development

## Requirements
- Node.js 18+
- PostgreSQL (recommended)

## PostgreSQL

This project expects a Postgres `DATABASE_URL`.

### Find your local Postgres port

On Ubuntu you may have multiple clusters:

```bash
pg_lsclusters
```

Pick an `online` cluster and use its `Port` in `DATABASE_URL`.

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/vibe_studio?schema=public"
```

### Create the database

```bash
sudo -u postgres createdb -p <PORT> vibe_studio
sudo -u postgres psql -p <PORT> -c "ALTER USER postgres PASSWORD 'postgres';"
```

## App setup

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Environment

- `APP_SESSION_SECRET` (or `NEXTAUTH_SECRET`) is required and must be 32+ characters.
- `APP_URL` is required for online checkout redirects.
- Stripe keys are optional unless testing online payments.

## Local quality checks

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Stripe local webhook testing (optional)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Demo accounts

- Admin: `admin@vibestudio.com` / `admin123`
- Staff: `staff@vibestudio.com` / `admin123`
- Member (unlimited): `sarah@example.com` / `member123`
- Member (credits): `mike@example.com` / `member123`

Seed data includes default plans and entitlements. Manage plans at `/admin/plans` and member entitlements at `/admin/members`.
