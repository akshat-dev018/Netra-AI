---
name: netra-postman-sync
description: Synchronize the Netra AI backend API with the Postman Netra AI workspace. Use when creating, auditing, or repairing categorized Postman collections, endpoint coverage, request bodies, variables, or local environments.
---

# Netra AI Postman Synchronization

Keep the Postman workspace aligned with the backend source of truth.

Whenever an API route, schema, controller response, authentication rule, or
error behavior changes, update `docs/BACKEND_API.md` in the same change. This
documentation update is mandatory even when Postman access is unavailable.

## Scope

- Backend source: `backend/src/app.ts`, `backend/src/routes.ts`, and every `backend/src/modules/**/*.routes.ts`.
- Postman workspace: the workspace named `Netra AI`.
- Base URL variable: `{{baseUrl}}`, defaulting to `http://localhost:5000`.
- Authentication variable: `{{accessToken}}`, configured as Postman bearer authentication for protected routes.
- Shared identifier variables: `{{resourceId}}`, `{{driverId}}`, `{{vehicleId}}`, `{{shipmentId}}`, `{{corridorId}}`, `{{tripId}}`, and `{{conversationId}}`.

Never read, print, commit, or persist API keys, passwords, JWTs, or other secrets. Request a valid Postman API key only when the Postman MCP/API operation requires it, and use it transiently.

## Collection taxonomy

Use these collections and do not create duplicate collections:

1. `01 - Authentication & Identity`
2. `02 - Fleet & Assignments`
3. `03 - Shipments & Network`
4. `04 - Live Tracking & Emergency`
5. `05 - Risk, Intelligence & Simulation`
6. `06 - Reports, Audit & Settings`

Use nested folders for the domain areas within each collection. Put `GET /health` and `GET /ready` in `06 - Reports, Audit & Settings` under `Platform Health`, with `noauth`.

## Procedure

1. Inventory all mounted routers in `backend/src/routes.ts`.
2. Read each mounted `*.routes.ts` file and expand router prefixes into complete paths.
3. Include the two application-level routes in `backend/src/app.ts`: `GET /health` and `GET /ready`.
4. Inspect route validators and schemas (`z.object`, `validate`, and imported schemas) to derive:
   - JSON request bodies for `POST`, `PUT`, and `PATCH`.
   - Query parameters for list/search/nearby routes.
   - Path parameters as Postman variables.
   - Whether authentication and role restrictions apply.
5. Fetch the `Netra AI` workspace collections and environment.
6. Match requests by HTTP method plus normalized path, not by display name.
7. Add missing requests to the appropriate taxonomy folder. Update stale URLs, auth mode, query parameters, and example bodies when source schemas changed.
8. Preserve unrelated user-created requests and the existing `Auth` collection unless explicitly asked to modify or remove them.
9. Ensure a `Netra AI Local` environment exists with the shared variables above. Do not put real credentials or tokens in its initial values.
10. Verify by refetching every managed collection and comparing the normalized source route set against the Postman request set. Report:
    - source route count;
    - managed Postman route count;
    - missing routes;
    - extra/stale routes;
    - collections/folders changed.

## Coverage rules

- Count each route once, including nested router prefixes.
- Treat `/:id` and other path parameters as placeholders when comparing routes.
- Do not count middleware (`router.use`) as an endpoint.
- Preserve intentional `noauth` for public auth routes, webhooks when appropriate, and health/readiness checks.
- Use realistic but clearly synthetic example values. Never copy production secrets or real user passwords into examples.
- For CSV import, use a minimal valid CSV example in the JSON `csv` field.
- For endpoints without a body, omit the body rather than sending `{}`.

## Completion response

Summarize the synchronization with exact numbers and names. If a valid Postman credential is unavailable, still complete the source inventory and report the blocking API operation clearly; do not claim that Postman was updated.
