# Phase 4A.1 — Authentication Migration Analysis

**Status:** Analysis only (no code, no DB changes, no PHP modifications)  
**Date:** 2026-07-16  
**Scope:** Map the legacy PHP authentication system and recommend a Next.js migration path that preserves database compatibility.

---

## 1. Executive Summary

The PHP app uses **server-side PHP sessions** with credentials stored in `users` and roles in `user_roles`. A single login page (`admin/login.php`) serves both the **admin panel** and the **employee portal**. Authorization is enforced per-page via `requireAuth()` and `requireAdmin()` helpers in `src/session.php`.

The Next.js app already has a **partial Auth.js (NextAuth v5) stub** (`web/src/lib/auth/index.ts`) that mirrors the PHP login query pattern (email lookup → bcrypt verify → load roles). No middleware, login UI, or route guards exist yet.

**Recommended approach:** Complete the existing Auth.js Credentials + JWT setup, add middleware and server-side guards that mirror PHP semantics, and keep reading/writing the same `users` and `user_roles` tables via Prisma. PHP and Next.js can run in parallel during migration because they use independent session mechanisms.

---

## 2. Files Inspected

| File | Role |
|------|------|
| `admin/login.php` | Login form, credential validation, role loading, redirects |
| `src/session.php` | Session start, auth helpers, guards |
| `src/config.php` | `SESSION_LIFETIME` constant (86400) |
| `admin/logout.php` | Logout → redirect to login |
| `portal/logout.php` | Same logout → redirect to login |
| `api/download.php` | Protected download endpoint (`requireAdmin`) |
| `includes/admin-sidebar.php` | Displays email + roles in footer |
| `includes/portal-sidebar.php` | Shows “Switch to Admin” when `isStaffAdmin()` |
| `portal/*.php` | Portal pages use `requireAuth()` + `employees.user_id` lookup |
| `admin/*.php` | Admin pages use `requireAdmin()` |
| `sql/schema.sql` | Canonical schema + seed data |
| `web/prisma/schema.prisma` | Introspected Prisma models |
| `web/src/lib/auth/index.ts` | Auth.js stub (Credentials + JWT) |
| `web/src/app/api/auth/[...nextauth]/route.ts` | Auth.js route handler |
| `web/src/types/next-auth.d.ts` | Session/JWT type extensions |

---

## 3. Database Schema

### 3.1 `users` table

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Prisma mapping:** `User` model, `passwordHash` → `password_hash`.

### 3.2 `user_roles` table

```sql
CREATE TABLE user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'hr', 'ceo', 'employee') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role)
);
```

**Prisma mapping:** `UserRoleAssignment` model, `@@map("user_roles")`.

### 3.3 Relationships

```
users (1) ──< user_roles (many)     # one user, many roles
users (1) ──< employees (many)      # optional link via employees.user_id (nullable FK)
```

- **Users ↔ roles:** Many-to-many via `user_roles`. A user can hold multiple roles (seed admin has both `admin` and `hr`).
- **Users ↔ employees:** Optional. `employees.user_id` references `users.id` ON DELETE SET NULL. Portal data is loaded by `employees WHERE user_id = ?`, not by role alone.
- **No direct role hierarchy in DB.** Roles are a flat enum; application code defines groupings.

### 3.4 Seed credentials

From `sql/schema.sql`:

- Email: `admin@conceptkart.com`
- Password hash: `$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi` (bcrypt, documented as `admin123`)
- Roles: `admin`, `hr`

---

## 4. Password Hashing

| Aspect | PHP behavior |
|--------|----------------|
| Algorithm | **bcrypt** via `password_verify()` / `password_hash(..., PASSWORD_DEFAULT)` |
| Storage column | `users.password_hash` |
| Login check | `password_verify($password, $user['password_hash'])` in `admin/login.php` |
| Hash creation | Documented in README; no runtime `password_hash()` calls in app code (manual/seed only) |

**Next.js compatibility:** The existing stub uses `bcryptjs.compare()` against `user.passwordHash`. `bcryptjs` correctly verifies PHP `$2y$` hashes. **No password rehashing or schema change is required.**

---

## 5. Session Lifetime & Storage

### 5.1 PHP session storage

- `session_start()` at top of `src/session.php` (included by every protected page).
- Data stored in **`$_SESSION`** (server-side; default PHP file handler unless php.ini overrides).
- Client receives **`PHPSESSID`** cookie only.

### 5.2 Session keys

| Key | Set by | Purpose |
|-----|--------|---------|
| `user_id` | `loginUser()` | Primary auth check (`isLoggedIn()`) |
| `user_email` | `loginUser()` | Display in admin sidebar |
| `user_roles` | `loginUser()` | Array of role strings from `user_roles` |
| `login_time` | `loginUser()` | Unix timestamp — **stored but never checked for expiry** |

### 5.3 Configured vs actual lifetime

- `src/config.php` defines `SESSION_LIFETIME = 86400` (24 hours).
- **This constant is not referenced anywhere in PHP session code.** No `ini_set('session.gc_maxlifetime', ...)`, no custom expiry check on `login_time`.
- Effective lifetime = **PHP/server default** (`session.gc_maxlifetime`, typically 1440 minutes on many hosts, but environment-dependent).

**Migration note:** The Next.js stub sets JWT `maxAge: 86400` (24h) to align with the *documented intent* of `SESSION_LIFETIME`, not the unenforced PHP behavior. Decide in Phase 4A.2 whether to match config intent (24h) or measure production PHP ini values.

---

## 6. Login Flow (`admin/login.php`)

### 6.1 GET — already authenticated

```
if isLoggedIn():
  if isStaffAdmin() → redirect admin/index.php
  else             → redirect portal/index.php
```

### 6.2 POST — credential validation

1. Trim email; read password.
2. Validate non-empty → error: `"Please enter email and password"`.
3. `SELECT id, email, password_hash FROM users WHERE email = ?`
4. `password_verify(password, password_hash)` → on failure: `"Invalid email or password"`.
5. `SELECT role FROM user_roles WHERE user_id = ?` → array of roles.
6. `loginUser(id, email, roles)`.
7. Redirect to `$_GET['redirect']` (default: `admin/index.php`).

### 6.2.1 Behavioral quirk (preserve or fix consciously)

After **POST login**, redirect is **role-agnostic** (uses `?redirect=` or defaults to admin). A user without staff roles who logs in with default redirect lands on `admin/index.php` → `requireAdmin()` → `unauthorized.php`.

After **GET** when already logged in, non-staff users are sent to the portal. These two paths are inconsistent. The Next.js migration should **document and decide** whether to fix this (recommended: role-based post-login redirect matching the GET behavior).

### 6.3 Redirect parameter

- Supported: `?redirect=portal/index.php` (relative to `SITE_URL`).
- Sanitization: only blocks redirect back to `/admin/login.php`.

---

## 7. Logout Flow

Both `admin/logout.php` and `portal/logout.php`:

1. `logoutUser()` → `session_unset()` + `session_destroy()`
2. Redirect to `SITE_URL . 'admin/login.php'`

**No CSRF token, no server-side session invalidation list** — standard PHP session destroy.

---

## 8. Authentication Helpers (`src/session.php`)

### 8.1 Core helpers

| Function | Behavior |
|----------|----------|
| `isLoggedIn()` | `isset($_SESSION['user_id'])` |
| `getCurrentUserId()` | `$_SESSION['user_id']` or null |
| `getCurrentUserEmail()` | `$_SESSION['user_email']` or null |
| `getUserRoles()` | `$_SESSION['user_roles']` or `[]` |
| `loginUser($id, $email, $roles)` | Writes all session keys + `login_time` |
| `logoutUser()` | Clears and destroys session |
| `refreshSessionRoles()` | Re-queries `user_roles` from DB — **defined but never called** |

### 8.2 `requireAuth()` — how it works

```php
function requireAuth(): void {
    if (!isLoggedIn()) {
        header('Location: ' . SITE_URL . '/admin/login.php');
        exit;
    }
}
```

- **Purpose:** Any authenticated user (any role).
- **Used by:** All `portal/*.php` pages.
- **Failure:** HTTP redirect to login (no return URL preserved in redirect).

### 8.3 `requireAdmin()` — how it works

```php
function requireAdmin(): void {
    requireAuth();
    if (!isStaffAdmin()) {
        header('Location: ' . SITE_URL . '/unauthorized.php');
        exit;
    }
}
```

- **Purpose:** Staff with admin panel access.
- **`isStaffAdmin()`:** `admin` OR `hr` OR `ceo` in session roles.
- **Used by:** All `admin/*.php` pages + `api/download.php`.
- **Failure (not logged in):** Redirect to login (via `requireAuth()`).
- **Failure (logged in, not staff):** Redirect to `unauthorized.php` — **file does not exist in the repo** (would 404 in production).

### 8.4 Role helpers

| Function | Logic | Used in codebase? |
|----------|-------|-------------------|
| `isStaffAdmin()` | `admin` \| `hr` \| `ceo` | Yes — guards, sidebars, login redirect |
| `isEmployee()` | `'employee' in roles` | **No** — defined only, never called |

### 8.5 Role hierarchy (application-level)

There is **no numeric hierarchy** or inheritance. Effective groupings:

| Group | Roles | Access |
|-------|-------|--------|
| Staff admin | `admin`, `hr`, `ceo` | Admin panel (`requireAdmin`) |
| Employee role | `employee` | Not enforced via `isEmployee()` |
| Portal | Any logged-in user | `requireAuth()` only |

**Staff can also have `employee` role** (multi-role supported). Admin sidebar shows roles excluding a legacy `'user'` string that is **not in the DB enum** (dead filter).

### 8.6 How employee access is actually checked

Portal pages do **not** call `isEmployee()`. Pattern:

1. `requireAuth()` — must be logged in.
2. `SELECT * FROM employees WHERE user_id = ?` — load employee record.
3. Per-page handling:
   - `portal/index.php`: shows welcome message if no employee row (“contact HR”).
   - `portal/profile.php` (and similar): redirects to `portal/index.php` if no employee row.
   - `portal/company-docs.php`: only `requireAuth()` — **no employee row required** (company-wide docs).

**Implication for migration:** Portal authorization is **two-layer**:

- Layer 1: authenticated session (`requireAuth` equivalent).
- Layer 2: optional `employees.user_id` linkage for personal HR data.

---

## 9. Protected Route Inventory

### 9.1 Admin (`requireAdmin`)

- `admin/index.php`
- `admin/applications.php`
- `admin/company-docs.php`
- `admin/feedback.php`
- `admin/jobs/index.php`, `new.php`, `edit.php`
- `admin/employees/index.php`, `new.php`, `view.php`
- `admin/achievements/new.php`
- `admin/documents/new.php`
- `api/download.php`

### 9.2 Portal (`requireAuth`)

- `portal/index.php`, `profile.php`, `salary.php`, `documents.php`
- `portal/achievements.php`, `history.php`, `feedback.php`, `company-docs.php`

### 9.3 Public (no auth)

- Job listings, apply flow, check-status (already migrated in Next.js)
- `admin/login.php`

---

## 10. Comparison: PHP vs Next.js App Router

| Concern | PHP (current) | Next.js (current + App Router pattern) |
|---------|---------------|----------------------------------------|
| Session store | Server `$_SESSION` (PHPSESSID cookie) | Auth.js JWT in HTTP-only cookie (stub configured) |
| Auth check location | Top of each `.php` file | Middleware + layout `auth()` + server actions |
| Role storage | Session array, set at login | JWT claims (`token.roles`) in stub |
| Role refresh | `refreshSessionRoles()` unused | Must implement explicitly (JWT stale until re-login) |
| Login page | `admin/login.php` | Stub points to `/admin/login` (page not built) |
| Logout | Destroy PHP session | `signOut()` via Auth.js |
| Guard: authenticated | `requireAuth()` redirect | Middleware matcher on `/portal/*` |
| Guard: staff | `requireAdmin()` redirect | Middleware matcher on `/admin/*` + role check |
| Guard: employee data | Per-page Prisma/PDO query | Server component / service: `employees.userId` |
| API protection | `requireAdmin()` in `download.php` | Route handler `auth()` + role check |
| Parallel deployment | N/A | Independent cookies — PHP and Next.js sessions don't conflict |
| Password verify | `password_verify` (bcrypt) | `bcryptjs.compare` (compatible) |

### 10.1 App Router mapping (recommended structure)

```
web/src/app/
  (public)/          # jobs, apply, check-status — no auth
  (auth)/admin/login # shared login page
  (admin)/admin/...  # layout with staff guard
  (portal)/portal/...# layout with auth guard
  api/auth/[...nextauth]
  api/downloads/...  # replaces api/download.php
```

Use **route groups** so URLs stay `/admin/...` and `/portal/...` matching PHP paths.

---

## 11. Existing Next.js Auth Stub — Gap Analysis

`web/src/lib/auth/index.ts` already implements:

- Credentials provider (email + password)
- Prisma `User` + `roles` include
- `bcryptjs.compare` on `passwordHash`
- JWT session strategy, 24h maxAge
- JWT/session callbacks attaching `id` and `roles`
- `pages.signIn: "/admin/login"`

**Not yet implemented:**

| Item | Priority |
|------|----------|
| `/admin/login` page UI + `signIn()` | P0 |
| `middleware.ts` for `/admin/*` and `/portal/*` | P0 |
| `unauthorized` page (PHP reference missing) | P0 |
| Server-side `requireAuth` / `requireAdmin` utilities | P0 |
| Role-based post-login redirect | P1 |
| Role refresh after admin changes roles | P2 |
| Logout route/action | P1 |
| `AUTH_SECRET`, `NEXTAUTH_URL` env validation | P1 |
| Download API auth guard | P2 (admin panel phase) |

---

## 12. Recommended Migration Strategy

### 12.1 Principles

1. **Zero database changes** — read/write existing `users` and `user_roles` via Prisma.
2. **Zero password migration** — keep bcrypt hashes; use `bcryptjs` for verify only.
3. **Semantic parity** — mirror `requireAuth`, `requireAdmin`, and portal employee lookups.
4. **Incremental delivery** — auth infrastructure first, then admin UI, then portal UI.
5. **Parallel operation** — PHP and Next.js can share MySQL; sessions remain independent.

### 12.2 Technology choice: Auth.js (already started)

**Why not change stack:** Credentials + JWT stub is aligned with PHP (stateless-ish sessions, roles in token). Auth.js v5 integrates cleanly with App Router `auth()` in Server Components and middleware.

**Alternative considered:** Custom cookie session in DB — rejected as unnecessary; adds schema or Redis without benefit for this app size.

### 12.3 Proposed phases

#### Phase 4A.2 — Auth foundation (next)

- Build `/admin/login` page (Server Action or client `signIn("credentials", ...)`).
- Add `middleware.ts`:
  - `/admin/*` (except login): require session + `isStaffAdmin(roles)`.
  - `/portal/*`: require session only.
  - Redirect unauthenticated → `/admin/login?callbackUrl=...`.
  - Redirect authenticated non-staff on `/admin/*` → `/unauthorized`.
- Add `web/src/lib/auth/guards.ts`:
  - `isStaffAdmin(roles)`, `isEmployee(roles)` — mirror PHP names.
  - `requireAuth()`, `requireAdmin()` — async server helpers using `auth()`.
- Add `/unauthorized` page.
- Implement role-based post-login redirect (staff → `/admin`, others → `/portal`).

#### Phase 4B — Admin panel routes

- `(admin)` layout with sidebar, session user display.
- Migrate admin pages; protect server actions with `requireAdmin()`.
- Replace `api/download.php` with authenticated Next.js route handler.

#### Phase 4C — Employee portal routes

- `(portal)` layout with sidebar + conditional “Switch to Admin”.
- Portal services: `getEmployeeByUserId(userId)` via Prisma.
- Replicate per-page employee-row checks (welcome state vs redirect).
- `company-docs` — auth only, no employee row required.

#### Phase 4D — Hardening & ops

- Role refresh: on admin role change, either force re-login or add `update` trigger + session refresh endpoint.
- Env hardening: `AUTH_SECRET`, production `NEXTAUTH_URL`.
- E2E tests: login, staff guard, portal guard, bcrypt against seed user.

### 12.4 Layered authorization model (preserve exactly)

```
┌─────────────────────────────────────────────────────────┐
│  Public routes: /, /jobs, /jobs/[slug]/apply,           │
│                 /check-status                             │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  Authenticated (requireAuth): /portal/*                  │
│  - Any user with valid session                           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  Staff (requireAdmin): /admin/*, download API            │
│  - roles ∩ {admin, hr, ceo} ≠ ∅                          │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  Employee data (portal sub-pages):                       │
│  - employees.user_id = session.user.id                   │
│  - company-docs: no employee row required              │
└─────────────────────────────────────────────────────────┘
```

### 12.5 JWT role staleness

PHP sessions hold roles until logout (unless `refreshSessionRoles()` were called). JWT behaves the same unless refreshed. **Recommendation:** Accept JWT staleness for Phase 4A.2 (match PHP default). Add optional `refreshSessionRoles` equivalent in Phase 4D if admins need immediate role revocation.

### 12.6 URL & routing compatibility

| PHP URL | Next.js target |
|---------|----------------|
| `/admin/login.php` | `/admin/login` |
| `/admin/logout.php` | `/api/auth/signout` or Server Action `signOut()` |
| `/portal/logout.php` | Same (shared logout) |
| `/admin/*` | `/admin/*` |
| `/portal/*` | `/portal/*` |
| `/unauthorized.php` | `/unauthorized` (new — PHP file missing) |

### 12.7 What not to do

- Do not add a `sessions` table unless requirements change.
- Do not rehash passwords to a new algorithm.
- Do not add a `user` role to the enum (PHP UI filters it, but it doesn't exist in DB).
- Do not rely on `isEmployee()` alone for portal access — follow `employees.user_id` pattern.

---

## 13. Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| PHP `SESSION_LIFETIME` unused; Next.js uses 24h JWT | Low | Document; align with config intent |
| Post-login redirect inconsistency in PHP | Medium | Fix in Next.js with role-based redirect |
| `unauthorized.php` missing in PHP | Medium | Implement `/unauthorized` in Next.js |
| JWT roles stale after DB role change | Low | Defer to Phase 4D; optional refresh |
| `employees.user_id` often null (new employees don't create users) | Medium | Portal shows “contact HR” — preserve UX |
| bcrypt `$2y$` vs `$2a$` edge cases | Low | `bcryptjs` handles PHP hashes; test with seed user |
| Dual-app deployment (PHP + Next.js) | Low | Separate session cookies; shared DB is safe |

---

## 14. Verification Checklist (for Phase 4A.2+)

When implementation begins, verify:

- [ ] Seed user `admin@conceptkart.com` / `admin123` logs in via Next.js
- [ ] User with only `employee` role reaches `/portal`, blocked from `/admin`
- [ ] User with `admin`/`hr`/`ceo` reaches `/admin`
- [ ] User with staff role sees “Switch to Admin” in portal sidebar
- [ ] Logout clears session and returns to login
- [ ] Portal profile without `employees.user_id` shows welcome/redirect behavior
- [ ] `company-docs` accessible to any authenticated user
- [ ] No modifications to `users` or `user_roles` schema

---

## 15. Conclusion

The PHP authentication system is **straightforward**: bcrypt passwords, flat multi-role assignments, PHP native sessions, and two guard functions. Portal “employee” access is really **user ↔ employee record linkage**, not the `employee` role enum.

The Next.js project is well-positioned to migrate: Prisma models match the live schema, and the Auth.js stub already implements the login query path. **Phase 4A.2 should complete login UI, middleware, guard utilities, and unauthorized handling** — without touching the database or PHP codebase.

**No authentication code was written in this phase.** This document is the sole deliverable for Phase 4A.1.
