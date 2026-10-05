# Architecture Overview

Next.js Careers (`web/`) is a TypeScript App Router application that shares the existing MySQL database and upload filesystem with the legacy PHP careers app. Prisma is used in **introspect / query-only** mode — do not run migrations against the live database unless explicitly approved.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Auth | Auth.js (NextAuth v5) — Credentials + JWT |
| Data | Prisma Client → MySQL (shared with PHP) |
| Validation | Zod |
| Storage | Local disk (`UPLOAD_ROOT`, typically `../uploads`) |
| Styling | Existing CSS / Tailwind utilities (no redesign in Phase 5) |

## Request flow

```
Browser
  → Middleware (auth gate for /admin/*, /portal/*)
  → Server Component / Server Action / Route Handler
  → requireAuth() / requireAdmin() (defense in depth)
  → Service layer
  → Repository (Prisma)
  → MySQL / local uploads
```

## Layers

1. **`src/app`** — Routes, layouts, loading/error UI, API route handlers  
2. **`src/actions`** — Server Actions (mutations); always call auth guards + Zod  
3. **`src/services`** — Domain logic (uploads, business rules)  
4. **`src/repositories`** — Prisma queries only  
5. **`src/validators`** — Zod schemas  
6. **`src/lib`** — Auth, env, storage, logging, upload helpers  
7. **`src/components`** — UI (admin / portal / public)

## Auth model

- **Staff** (`admin` | `hr` | `ceo`) → `/admin`
- **Other authenticated users** → `/portal`
- Portal employee data resolves via `employees.user_id` (manual DB link; no invite UI)

## Storage layout

| Kind | Disk key | DB path shape |
|---|---|---|
| Resumes | `resumes/{jobId}/{uuid}.ext` | relative under resumes |
| Employee docs | `documents/{uuid}.ext` | basename only |
| Company docs | `documents/{type}/{uuid}.ext` | `{type}/{uuid}.ext` |

## Related docs

- [Folder structure](./folder-structure.md)
- [Authentication flow](./authentication-flow.md)
- [Database overview](./database-overview.md)
- [Route map](./route-map.md)
- [Deployment checklist](./deployment-checklist.md)
- [Phase 5 production report](./phase-5-production-hardening-report.md)
