# Phase 5 — Production Hardening Report

**Date:** 2026-07-16  
**Scope:** Security, performance, reliability, docs — no new product features, no UI redesign, no schema changes.

---

## Executive verdict

The Careers Next.js app is **production-capable** after this hardening pass, provided deployment checklist items (secrets, HTTPS, shared uploads) are completed. Remaining items are operational or require **approval** before schema/index work.

**Build:** `npm run build` succeeded (types + lint). Auth.js Edge `jose` CompressionStream warnings are upstream and do not block production.

---

## Changes implemented in Phase 5

| Area | Change |
|---|---|
| Env | `AUTH_SECRET` required when `NODE_ENV=production` |
| Uploads | Shared MIME/ext/size validation for company + employee docs |
| Actions | Zod `entityIdSchema` on ID-only job/company-doc/achievement/employee-doc mutations |
| Downloads | Filename sanitization + `X-Content-Type-Options: nosniff` |
| Performance | `React.cache()` for portal employee profile + job detail by id/slug |
| Errors | Portal + public `loading.tsx` / `error.tsx`; public `not-found.tsx`; apply segment boundaries |
| UX safety | Public error UIs no longer expose raw `error.message` |
| Logging | `src/lib/logging/logger.ts` with secret redaction |
| UI accept | Employee + company file inputs align with server allowlist |
| Docs | Architecture, folders, auth, DB, routes, deployment checklist |

---

## 1. Security findings

### Pass

- Middleware protects `/admin/*` and `/portal/*`
- Layouts/pages use `requireAdmin` / `requireAuth`
- Server Actions call guards; downloads enforce staff vs ownership
- Prisma parameterized queries (no raw SQL injection surface in app code)
- Resume upload MIME/size validation
- Secure cookies (`httpOnly`, `sameSite=lax`, `secure` in production)
- `.env` gitignored; `.env.example` has placeholders only
- Action errors return generic messages to clients

### Fixed this phase

- Production `AUTH_SECRET` enforcement
- Company/employee document MIME + extension allowlist
- ID validation on previously raw-string delete/toggle/duplicate actions
- Content-Disposition filename sanitization
- Client error boundaries stop leaking exception text

### Residual / monitor

| Finding | Severity | Notes |
|---|---|---|
| Admin document download is path-based (staff can request any sanitized path under type) | Low | Matches PHP staff download model |
| Settings page stub | Info | Not a security hole |
| Auth.js Edge jose warning | Info | Upstream; middleware still functions |
| Dual PHP+Next writers on uploads | Ops | Ensure single shared volume + permissions |

---

## 2. Performance findings

### Fixed

- Deduped portal profile fetch (layout + pages) via `cache()`
- Deduped job detail fetch (metadata + page) via `cache()`

### Report only (no schema changes)

**Missing indexes (approval required):**

- `employees.email`
- Composite `applications(jobId, email)`
- `screening_priority` / score if filter volume grows
- Document `file_path` lookups
- Optional composites for public job listing sorts

**Unbounded lists (consider pagination later):**

- Public `findActive` jobs
- Portal documents / achievements / feedback / company docs
- Employee detail documents include

**Further opportunities:**

- Derive public department/location filters from the same active-job query
- Parallelize a few independent service awaits (apply duplicate check, delete-job count)
- Lightweight existence helpers instead of full `findById` with includes

---

## 3. Error handling

| Segment | loading | error | not-found |
|---|---|---|---|
| Admin | Yes (group + key children) | Yes | Via Next defaults |
| Portal | **Added** | **Added** | Defaults |
| Public | **Added** (+ apply) | **Added** (+ jobs/check-status/apply) | **Added** |

Empty states already exist on portal/admin list UIs.

---

## 4. Logging

- Structured JSON logger with redaction of password/secret/token-like keys
- Server actions for apply + status lookup use `logger.error`
- Client error boundaries avoid logging full errors to the browser console

---

## 5. File handling

| Flow | Size | MIME/ext | Path sanitize | Auth |
|---|---|---|---|---|
| Resumes | Yes | Yes | Yes | Staff download |
| Employee docs | Yes | **Yes (new)** | Basename | Staff / own (portal) |
| Company docs | Yes | **Yes (new)** | `{type}/{name}` | Staff / active (portal) |

Allowed document types: PDF, DOC, DOCX, JPG, PNG (≤ `MAX_UPLOAD_BYTES`).

---

## 6. Code quality

| Item | Status |
|---|---|
| No unjustified `any` in `src` | Pass |
| Settings stub | Known gap (product, not hardening) |
| Duplicate apply routes (`/apply/[jobId]` + slug apply) | Intentional parity; keep both |
| Dead code | No critical unused services found in audit |
| Large files | Repositories/services are sizable but cohesive; refactor optional later |

---

## 7. TypeScript & build

- Production build: **PASS**
- Typecheck (Next build step): **PASS**
- Lint: only transient unused eslint-disable (cleaned in logger)

---

## 8. Production readiness checklist

- [x] Auth on protected routes + guards on actions/APIs  
- [x] Secure session cookies  
- [x] Zod on mutations (including ID-only)  
- [x] Upload validation for all upload paths  
- [x] Download authorization  
- [x] Env validation for production secrets  
- [x] Error / loading boundaries for major segments  
- [x] Structured server logging  
- [x] Docs for ops + architecture  
- [x] `npm run build` green  
- [ ] Production env values set on host (ops)  
- [ ] HTTPS + shared uploads volume verified (ops)  
- [ ] Live UAT of apply / admin download / portal download (ops)  
- [ ] Optional DB indexes after approval  

---

## 9. Recommended improvements (non-blocking)

1. Paginate public jobs and portal list endpoints  
2. Add approved indexes listed above  
3. Implement Settings when product requirements exist  
4. Add employee↔user link admin UI only if product requests it  
5. Consider `unstable_cache` / ISR for public job list with short revalidation  

---

## 10. Items requiring approval before changing

| Item | Why |
|---|---|
| Any Prisma migration / new indexes | Shared live DB with PHP |
| Recruiter assignment / status history tables | Explicitly deferred; schema |
| Audit log tables | Explicitly out of scope |
| Analytics | Explicitly out of scope |
| Storage driver swap to S3 | Ops + env + dual-app coordination |

---

## Documentation index

- [architecture-overview.md](./architecture-overview.md)
- [folder-structure.md](./folder-structure.md)
- [authentication-flow.md](./authentication-flow.md)
- [database-overview.md](./database-overview.md)
- [route-map.md](./route-map.md)
- [deployment-checklist.md](./deployment-checklist.md)
