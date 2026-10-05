# Database Overview

Prisma maps the shared MySQL schema used by the PHP app. **Do not run `prisma migrate` against production** without explicit approval.

## Core tables

| Model | Table | Purpose |
|---|---|---|
| `User` | `users` | Login accounts (`password_hash`) |
| `UserRoleAssignment` | `user_roles` | Roles: admin, hr, ceo, employee, … |
| `Job` | `jobs` | Public job postings |
| `Application` | `applications` | Candidate applications + screening fields |
| `Employee` | `employees` | HR employee records; optional `user_id` → portal |
| `EmployeeDocument` | `employee_documents` | Per-employee files / slips |
| `CompanyDocument` | `company_documents` | Org-wide policies / docs |
| `Achievement` | `achievements` | Employee achievements |
| `Feedback` | `feedback` | Employee feedback |
| `SalaryRecord` | `salary_records` | Monthly salary rows |

## Portal linkage

```
users.id  ←──  employees.user_id  (nullable)
```

If `user_id` is null, the portal shows a “contact HR” style empty state (PHP parity). Linking is a **manual DB update**, not an in-app feature.

## Index notes (report only — no schema changes in Phase 5)

Present and useful: job `isActive` / department / location; application `jobId` / status / email / createdAt; user email unique.

**Recommended for future approval** (not applied):

- `employees.email` index (exact lookup)
- Composite `(jobId, email)` on applications (duplicate-apply check)
- `screening_priority` / score indexes if admin filters grow
- `file_path` indexes for document download lookups
- Composite `(isActive, department, createdAt)` for public job lists

## Prisma usage policy

- `db:pull` / `db:generate` OK for syncing types
- Never `migrate deploy` without written approval
- Prefer repository pagination (`take` / `skip`) for admin lists
