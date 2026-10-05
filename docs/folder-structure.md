# Folder Structure

```
web/
├── docs/                      # Operational & architecture docs
├── prisma/
│   └── schema.prisma          # Introspected schema (no migrate against live DB)
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── (public)/          # Careers site (jobs, apply, check-status)
│   │   ├── (auth)/            # Login
│   │   ├── (app)/
│   │   │   ├── admin/         # Staff dashboard
│   │   │   └── portal/        # Employee portal
│   │   ├── api/               # Route handlers (auth, downloads, health, …)
│   │   └── unauthorized/
│   ├── actions/               # Server Actions
│   ├── components/
│   │   ├── admin/
│   │   ├── portal/
│   │   ├── application/
│   │   └── …
│   ├── lib/
│   │   ├── auth/              # Auth.js config, guards, roles
│   │   ├── config/            # env validation
│   │   ├── logging/           # Structured logger
│   │   ├── storage/           # Local disk storage
│   │   └── uploads/           # Upload validation helpers
│   ├── repositories/          # Prisma data access
│   ├── services/              # Domain services
│   └── validators/            # Zod schemas
├── .env.example
├── middleware.ts              # Edge auth for /admin and /portal
└── package.json
```

## Conventions

- **Pages** load data via services; mutations go through Server Actions.
- **Repositories** must not contain business rules or auth checks.
- **Services** own file validation, ownership checks, and domain errors.
- Prefer Zod at action / form boundaries before calling services.
