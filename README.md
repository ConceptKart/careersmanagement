# Concept Kart Careers — Next.js

Next.js 15 (App Router) + TypeScript rewrite of the PHP careers portal.
The PHP app in the parent folder is **reference only** and is not modified.

## Stack

- Next.js 15 / React 19 / TypeScript
- Prisma 6 + existing MySQL (no schema migrations)
- Auth.js (Credentials) — bcrypt-compatible with PHP `password_hash`
- Tailwind CSS 4
- React Hook Form + Zod
- Local disk uploads via `StorageDriver` (S3-ready abstraction)

## Phase 0 — Database

Live introspection from this workstation failed (`P1001` — MySQL on `localhost:3306` is the **server** loopback, not your PC).

The checked-in `prisma/schema.prisma` was authored from `../sql/schema.sql` plus columns used by the PHP app (`key_responsibilities`, `salary_offered`).

**When you can reach the live DB** (SSH tunnel example):

```bash
# Local port 3307 → remote MySQL 3306
ssh -L 3307:127.0.0.1:3306 user@your-host

# Then in web/.env:
# DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3307/u590978274_careers"

npm run db:pull      # overwrites prisma/schema.prisma from live DB
npm run db:generate
```

**Never** run `prisma migrate` / `db push` against production.

## Setup

```bash
cd web
cp .env.example .env   # fill DATABASE_URL + AUTH_SECRET
npm install
npm run db:generate
npm run dev
```

Open http://localhost:3000

## Architecture

```
src/
  app/(public)/     # Home, Jobs, Apply, Check Status
  app/api/          # Route handlers (auth, jobs, applications, health)
  components/       # UI
  lib/              # db, auth, config, storage, utils
  repositories/     # data access
  services/         # business logic
  validators/       # Zod schemas
```

## Public routes (Phase 3)

| Route | PHP equivalent |
|-------|----------------|
| `/` | `index.php` |
| `/jobs` | `jobs.php` |
| `/jobs/[id]` | `jobs-view.php` |
| `/apply/[jobId]` | `apply.php` |
| `/check-status` | `check-status.php` |
| `GET /api/jobs` | `api/jobs.php` |
| `GET /api/applications?email=` | `api/applications.php` |

Uploads land in the shared repo-root `uploads/resumes/{jobId}/{uuid}.ext` (same as PHP). Set `UPLOAD_ROOT="../uploads"` when running from `web/`.

## Next phases

- Admin panel (jobs, applications, employees, docs, feedback)
- Employee portal
- Auth-gated file downloads
- Optional S3 storage driver
