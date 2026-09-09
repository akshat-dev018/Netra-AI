# NETRA backend planning

Express 5 + TypeScript + MongoDB API. Prefix: `/api/v1`. Success `{ success: true, data }` / paginated `{ pagination }` / error `{ success: false, error: { code, message, fields? } }`.

Auth: Bearer access JWT (15m) + `refreshToken` HttpOnly cookie (`path=/api/v1/auth`, SameSite from `COOKIE_SAMESITE`, default `lax`). Rotation + reuse revocation on `Session`. Lockout 5 failures / 15 minutes. Generic auth errors (no email enumeration).

RBAC: `roleGuard` on modules. Fleet/trip: `NOT_YOUR_FLEET` / `NOT_YOUR_TRIP` (403). Generic IDOR: `assertOwnership` → 404.

NoSQL: Mongoose `sanitizeFilter` + `@exortek/express-mongo-sanitize` (Express 5). Body limit 10kb except `/shipments/import` 1mb.

## Error codes

`VALIDATION_ERROR`, `INVALID_REQUEST`, `UNAUTHORIZED`, `TOKEN_EXPIRED`, `TOKEN_INVALID`, `REFRESH_TOKEN_INVALID`, `FORBIDDEN`, `ROLE_SCOPE_DENIED`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_ERROR`, `LOCATION_PERMISSION_REQUIRED`, `NOT_YOUR_TRIP`, `NOT_YOUR_FLEET`, `STALE_LOCATION`, `HIGHWAY_DATA_UNAVAILABLE`, `ALERT_ALREADY_ACKNOWLEDGED`, `COPILOT_UNAVAILABLE`

## Endpoint index (implemented)

### Auth

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | No | Public if `ALLOW_PUBLIC_REGISTER=true`; default role `viewer` |
| POST | `/auth/login` | No | Sets refresh cookie; returns `accessToken` |
| POST | `/auth/verify-email` | No | Body `{ token }` |
| POST | `/auth/forgot-password` | No | Generic success |
| POST | `/auth/reset-password` | No | Revokes all sessions |
| POST | `/auth/refresh` | Cookie | Rotate refresh |
| POST | `/auth/logout` | Yes | Clears cookie |
| GET | `/auth/sessions` | Yes | List active sessions |
| DELETE | `/auth/sessions/:id` | Yes | Revoke one |

### Users

| Method | Path | Min role |
|---|---|---|
| GET/PATCH | `/users/me` | any |
| GET | `/users/me/export` | any — location history redacted |
| GET/POST | `/users` | admin |
| GET/PATCH/DELETE | `/users/:id` | admin |

### Fleet & tracking

| Method | Path | Min role |
|---|---|---|
| GET/POST | `/drivers`, `/vehicles` | fleet_manager / admin |
| GET/PATCH | `/drivers/:id`, `/vehicles/:id` | own fleet |
| GET/POST | `/assignments` | fleet_manager / admin |
| PATCH | `/assignments/:id` | own fleet |
| POST | `/tracking/ping` | driver (own, trip + sharing on) |
| GET | `/tracking/drivers/:id/latest` | fleet (own) / controller+ |
| GET | `/tracking/drivers/:id/history` | fleet/admin — **audit-logged** |

### Operations & emergency

| Method | Path | Min role |
|---|---|---|
| CRUD | `/shipments` | controller+ write; driver own trip status |
| POST | `/shipments/import` | controller+ CSV |
| POST | `/routes/optimize` | controller+ rule-based candidates |
| GET | `/corridors`, `/corridors/:id` | any authenticated |
| GET/POST | `/highways`, `/highways/sync` | sync = admin |
| GET/POST | `/disruptions` | driver create = `driver_reported` |
| POST | `/webhooks/disruptions` | optional `x-api-key` |
| GET/POST | `/emergency/alerts` | driver create = SOS |
| POST | `/emergency/alerts/:id/acknowledge\|dispatch\|resolve` | dispatcher+ |
| GET/POST/PATCH | `/emergency/response-units` | dispatcher+ |
| GET | `/hospitals`, `/hospitals/nearby?lat&lng&radius` | any |

### Intel

| Method | Path | Min role |
|---|---|---|
| GET | `/risk/corridors`, `/risk/accidents` | any |
| POST | `/risk/recompute` | analyst+ |
| GET/POST | `/predictions`, `/predictions/recompute` | analyst+ write |
| GET/POST | `/simulator/scenarios`, `/simulator/run` | analyst+ |
| GET | `/analytics/overview`, `/analytics/fleet-compliance` | ops_manager+ |
| GET/POST | `/reports`, `/reports/:id/export` | ops_manager+ (PDF stubbed) |
| POST/GET | `/copilot/message`, `/copilot/conversations/:id` | any; 503 if no API key |
| GET | `/audit-log` | admin |
| GET/POST | `/settings/data-sources` | admin |
| GET | `/health`, `/ready` | public |

### Real-time (Socket.io, JWT on connect)

Namespaces: `/map`, `/alerts`, `/risk`, `/tracking`. Driver GPS is never simulated; `simulationFeed.service.ts` only drifts corridor utilization and unassigned shipments.
