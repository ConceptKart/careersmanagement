# Authentication Flow

## Overview

Auth.js (NextAuth v5) with **Credentials** provider and **JWT** sessions.

## Login

1. User visits `/admin/login`
2. Client calls `signIn("credentials", …)` from `next-auth/react`
3. Credentials validated against `users.password_hash` (bcrypt)
4. Roles loaded from `user_roles`
5. JWT issued; session cookie set:
   - Dev: `authjs.session-token`
   - Prod: `__Secure-authjs.session-token` (`httpOnly`, `sameSite=lax`, `secure`)

## Post-login redirect

| Roles | Destination |
|---|---|
| Any of `admin`, `hr`, `ceo` | `/admin` (or safe `callbackUrl`) |
| Otherwise | `/portal` |

## Middleware

`src/middleware.ts` matcher: `/admin/:path*`, `/portal/:path*`

- Unauthenticated → redirect to `/admin/login?callbackUrl=…`
- Authenticated non-staff on `/admin/*` → `/unauthorized`
- Logged-in users on login page → post-login destination

## Server-side guards (defense in depth)

| Helper | Use |
|---|---|
| `requireAuth()` | Any signed-in user (portal layout / pages) |
| `requireAdmin()` | Staff only (admin layout / pages / actions) |

API downloads:

- `/api/admin/downloads` — session + `isStaffAdmin`
- `/api/portal/downloads` — session + ownership / active company docs

## Secrets

- `AUTH_SECRET` is **required when `NODE_ENV=production`** (`getEnv()`).
- Never commit `.env` (`.gitignore` includes `.env*`, keeps `.env.example`).

## Session lifetime

JWT `maxAge`: 24 hours.
