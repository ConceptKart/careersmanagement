# Deployment Checklist

## Before deploy

- [ ] Copy `.env.example` → production secrets store (never commit `.env`)
- [ ] Set `DATABASE_URL` to production MySQL (same DB as PHP if dual-running)
- [ ] Set strong `AUTH_SECRET` (`openssl rand -base64 32`) — **required in production**
- [ ] Set `NEXTAUTH_URL` / `AUTH_URL` to the public HTTPS origin
- [ ] Set `UPLOAD_ROOT` to the shared uploads volume (PHP-compatible path)
- [ ] Confirm `MAX_UPLOAD_BYTES` (default 5MB)
- [ ] HTTPS termination enabled (cookies use `secure` in production)
- [ ] Stop any `next dev` processes on the build host before `npm run build`
- [ ] `npm ci`
- [ ] `npx prisma generate`
- [ ] `npm run build`
- [ ] `npm run start` (or platform start command)

## Runtime

- [ ] `/api/health` returns OK
- [ ] Login works; staff land on `/admin`, employees on `/portal`
- [ ] Public apply + resume upload works
- [ ] Admin resume download works
- [ ] Portal download scoped to own files
- [ ] File permissions on uploads volume: app user can read/write

## Ops notes

- **Do not** run Prisma migrations against the shared live DB without approval.
- Prefer a single process writing uploads; if PHP and Next.js both run, use the same `uploads/` root.
- After a failed build while `next dev` was running, delete `web/.next` and restart cleanly.
- Rotate `AUTH_SECRET` only with a planned logout of all sessions.

## Rollback

- Redeploy previous build artifact / image
- Keep DB and uploads unchanged (schema not modified by this app’s deploy)
