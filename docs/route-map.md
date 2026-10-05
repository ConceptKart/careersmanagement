# Route Map

## Public

| Path | Description |
|---|---|
| `/` | Careers home |
| `/jobs` | Active job list |
| `/jobs/[slug]` | Job detail |
| `/jobs/[slug]/apply` | Apply form (slug) |
| `/apply/[jobId]` | Apply form (id) |
| `/check-status` | Candidate status lookup |

## Auth

| Path | Description |
|---|---|
| `/admin/login` | Credentials login |
| `/unauthorized` | Authenticated but not staff |

## Admin (staff: admin \| hr \| ceo)

| Path | Description |
|---|---|
| `/admin` | Dashboard |
| `/admin/jobs` | Jobs list |
| `/admin/jobs/new` | Create job |
| `/admin/jobs/[id]` | Job detail |
| `/admin/jobs/[id]/edit` | Edit job |
| `/admin/applications` | Applications list |
| `/admin/applications/[id]` | Application detail |
| `/admin/employees` | Employees list |
| `/admin/employees/new` | Create employee |
| `/admin/employees/[id]` | Employee detail (+ docs/salary) |
| `/admin/employees/[id]/edit` | Edit employee |
| `/admin/employee-documents` | Cross-employee docs browser |
| `/admin/company-documents` | Company docs |
| `/admin/achievements` | Achievements CRUD |
| `/admin/achievements/new` | Create achievement |
| `/admin/achievements/[id]/edit` | Edit achievement |
| `/admin/feedback` | Feedback list |
| `/admin/salary` | Salary records |
| `/admin/salary/new` | Create salary row |
| `/admin/salary/[id]/edit` | Edit salary row |
| `/admin/settings` | Stub (“Coming soon”) |

## Portal (authenticated)

| Path | Description |
|---|---|
| `/portal` | Dashboard (works without employee link) |
| `/portal/profile` | Profile |
| `/portal/documents` | Own documents |
| `/portal/salary` | Own salary history |
| `/portal/achievements` | Own achievements |
| `/portal/feedback` | Own feedback (+ submit) |
| `/portal/company-documents` | Active company docs |
| `/portal/history` | Employment history view |

## API

| Path | Auth | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | — | Auth.js |
| `/api/health` | Public | Health check |
| `/api/jobs` | Public | Jobs JSON (if used) |
| `/api/applications` | Public / validated | Application submit API |
| `/api/admin/downloads` | Staff | Resume / employee / company files |
| `/api/portal/downloads` | User | Own docs + active company docs |
