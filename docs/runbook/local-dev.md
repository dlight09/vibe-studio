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

## Demo accounts

- Admin: `admin@vibestudio.com` / `admin123`
- Staff: `staff@vibestudio.com` / `admin123`
- Member (unlimited): `sarah@example.com` / `member123`
- Member (credits): `mike@example.com` / `member123`

Seed data includes default plans and entitlements. Manage plans at `/admin/plans` and member entitlements at `/admin/members`.
