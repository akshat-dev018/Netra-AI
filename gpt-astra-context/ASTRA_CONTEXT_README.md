# NETRA context for GPT Astra

This folder is a safe, curated handoff of the NETRA project for frontend work.

## Included

- `backend/src/`: API routes, controllers, validation schemas, models, services, middleware, auth, and Socket.IO setup.
- `backend/postman/`: Postman collection and local environment template.
- `backend/package.json`, `backend/tsconfig.json`, and `backend/.env.example`: backend setup and dependencies.
- `frontend/src/`: all current Next.js pages, auth, layout, API client, environment handling, sockets, and accessibility/colorblind mode.
- `frontend/public/netra_logo.png`: canonical transparent NETRA logo.
- `frontend/package.json`, `frontend/tsconfig.json`, Next/PostCSS/Tailwind config, and `.env.example`.
- `docs/`: PRD, engineering instructions, backend API reference, and planning notes.

## API coverage

The backend API reference documents 74 HTTP endpoints, including health/readiness
checks, authentication, users, fleet, shipments, corridors, disruptions,
emergency response, highways, risk, predictions, simulation, reports, copilot,
audit logs, settings, and tracking. Socket.IO namespaces are documented in the
backend source and API handoff.

## Intentionally excluded

- `.env` files and all credentials/secrets
- `node_modules/`, `.next/`, `dist/`, and build/cache artifacts
- Local databases and runtime logs
- Editor-specific and machine-specific files

## Local setup

1. Start MongoDB.
2. In `backend/`, copy `.env.example` to `.env`, fill the required local values, install dependencies, seed, and run the API.
3. In `frontend/`, copy `.env.example` to `.env.local`, install dependencies, and run the Next.js app.
4. Backend defaults to `http://localhost:5000`; frontend defaults to `http://localhost:3000`.

Use the Postman collection with the included `NETRA Local` environment to
exercise the API. Demo credentials, when using the local seed, are documented
in `docs/BACKEND_API.md`; do not use them outside local development.
