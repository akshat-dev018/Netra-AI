# NETRA

National Emergency & Transport Risk Analytics — freight control-tower prototype.

This repo is **backend-first**. The API lives in `backend/`. A Next.js frontend (Command, Fleet, Driver, Admin portals) is intentionally not scaffolded yet.

## Prerequisites

- **Node.js Active LTS (24.x)** (Maintenance LTS 22.x also works). Verified at build time against [nodejs.org](https://nodejs.org/).
- MongoDB locally or Atlas (`MONGODB_URI`)

## Backend setup

```bash
cd backend
cp .env.example .env
# Fill JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (different, ≥32 chars), ENCRYPTION_KEY (64 hex chars)
npm install
npm run seed
npm run dev
```

Health: `GET http://localhost:5000/health`  
API prefix: `http://localhost:5000/api/v1`

Seed password for all demo users: `NetraDemo123!`  
Emails: `admin@netra.local`, `ops@netra.local`, `controller@netra.local`, `analyst@netra.local`, `dispatcher@netra.local`, `fleet@netra.local`, `driver@netra.local`, `viewer@netra.local`

## Version safety (verified 2026-09-08)

Searched npm + advisories; `npm show` ground truth; `npm audit` after install = **0 vulnerabilities**.

| Package | Verified latest |
|---|---|
| Node.js | Active LTS **24** |
| express | 5.2.1 (use morgan ≥1.12.0) |
| mongoose | 9.9.5 (`sanitizeFilter` on) |
| zod | 4.5.4 |
| jsonwebtoken | 9.0.3 |
| bcryptjs | 3.0.3 |
| helmet | 8.3.0 |
| @exortek/express-mongo-sanitize | 3.0.1 (Express 5; original `express-mongo-sanitize` cannot mutate `req.query`) |
| @sentry/node | 10.73.0 (`setupExpressErrorHandler`) |
| socket.io | 4.8.3 |
| typescript | 7.0.2 |

No Google OAuth. Email/password only. Refresh cookie uses `COOKIE_SAMESITE=lax` so a later Next.js app on port 3000 can send credentials cross-origin.

## CI baseline

```bash
cd backend && npm ci && npm run typecheck && npm audit --audit-level=high
```

Postman: [`backend/postman/`](backend/postman/). API handoff guide:
[`docs/BACKEND_API.md`](docs/BACKEND_API.md). Endpoint planning notes:
[`docs/BACKEND_PLANNING.md`](docs/BACKEND_PLANNING.md).
