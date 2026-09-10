# NETRA Backend API Documentation

National Emergency & Transport Risk Analytics (NETRA) is a freight control-tower
API for fleet operations, shipment movement, live tracking, disruption response,
and transport risk analytics.

This guide is the handoff reference for a developer starting from the current
backend state. It documents the 74 exposed HTTP endpoints: 72 versioned API
routes plus `GET /health` and `GET /ready`.

## 1. Quick start

```bash
cd backend
cp .env.example .env
# Set MongoDB, two different JWT secrets (at least 32 characters),
# and a 64-character hexadecimal ENCRYPTION_KEY.
npm install
npm run seed
npm run dev
```

The default server is `http://localhost:5000`.

| Base URL | Use |
|---|---|
| `http://localhost:5000` | Health and readiness |
| `http://localhost:5000/api/v1` | Versioned API |

The seed script creates demo users with password `NetraDemo123!`. Do not use
seed credentials outside local development.

## 2. API conventions

### Request and response format

JSON requests require:

```http
Content-Type: application/json
Accept: application/json
```

Query parameters are validated and coerced by the route schema before the
controller runs (for example, pagination values become numbers).

Successful responses use:

```json
{
  "success": true,
  "data": {}
}
```

List endpoints additionally return:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 0,
    "pages": 0
  }
}
```

Errors use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": {
      "email": ["Invalid email address"]
    }
  }
}
```

`fields` is present for schema validation errors and maps a body, query, or
path field to one or more messages.

### Authentication

1. `POST /api/v1/auth/login` returns an `accessToken` and sets a rotating
   `refreshToken` HttpOnly cookie.
2. Send the access token on protected requests:

```http
Authorization: Bearer <accessToken>
```

3. Call `POST /api/v1/auth/refresh` when the access token expires. The refresh
   cookie is rotated.
4. Call `POST /api/v1/auth/logout` to clear the refresh cookie.

Access tokens expire according to `JWT_ACCESS_EXPIRES_IN` (default 15 minutes);
refresh tokens default to 7 days. Refresh-token reuse revokes the session.

### Roles

| Role | Meaning |
|---|---|
| `admin` | Full administration |
| `ops_manager` | Operations management and reports |
| `controller` | Shipment and route control |
| `analyst` | Risk, prediction, and simulation analysis |
| `dispatcher` | Emergency coordination |
| `fleet_manager` | Fleet and assignment management |
| `driver` | Own trip and location operations |
| `viewer` | Read-only authenticated access |

All protected endpoints require a valid bearer token first. A valid token with
an insufficient role receives `403 ROLE_SCOPE_DENIED`.

### Limits and security behavior

- Global `/api` rate limit: 100 requests per minute.
- Auth rate limit: 10 failed requests per minute (successful requests skipped).
- Location ping limit: 30 requests per minute.
- Normal JSON body limit: 10 KB.
- Shipment import body limit: 1 MB.
- MongoDB filters are sanitized and strict query mode is enabled.
- IDs outside the caller's fleet are deliberately hidden as `404` where
  ownership checks apply.

## 3. Status codes and error catalog

| HTTP | When it occurs | Codes currently used |
|---:|---|---|
| `200` | Successful read, update, action, or delete | - |
| `201` | Resource created or location/report generated | - |
| `400` | Malformed body/query/path or invalid business request | `VALIDATION_ERROR`, `INVALID_REQUEST`, `LOCATION_PERMISSION_REQUIRED` |
| `401` | Missing/invalid authentication, refresh token, or webhook key | `UNAUTHORIZED`, `TOKEN_EXPIRED`, `TOKEN_INVALID`, `REFRESH_TOKEN_INVALID` |
| `403` | Authenticated user lacks role or ownership | `FORBIDDEN`, `ROLE_SCOPE_DENIED`, `NOT_YOUR_FLEET`, `NOT_YOUR_TRIP` |
| `404` | Route or resource does not exist | `NOT_FOUND` |
| `409` | Duplicate or conflicting state | `CONFLICT`, `ALERT_ALREADY_ACKNOWLEDGED` |
| `422` | Semantically implausible tracking data | `STALE_LOCATION` |
| `429` | Rate limit exceeded | `RATE_LIMIT_EXCEEDED` |
| `500` | Unexpected server error | `INTERNAL_ERROR` |
| `503` | Dependency or service unavailable | `INTERNAL_ERROR`, `HIGHWAY_DATA_UNAVAILABLE`, `COPILOT_UNAVAILABLE` |

The API currently does not intentionally return `204`; successful deletes and
actions return a JSON `200` response. In development, unexpected `500` messages
may contain the thrown error text; production returns the generic
`Internal server error` message.

## 4. Public platform endpoints

| Method | Path | Success | Scenarios |
|---|---|---|---|
| GET | `/health` | `200 { status: "ok" }` | Process is responding |
| GET | `/ready` | `200 { status: "ready" }` | MongoDB is connected |
| GET | `/ready` | `503` | MongoDB is not ready |

## 5. Endpoint reference

All paths below are relative to `http://localhost:5000/api/v1`.

### Authentication and identity

| Method and path | Auth | Body / query | Success |
|---|---|---|---:|
| POST `/auth/register` | Public if enabled | `{ email, password, name, role? }` | 201 |
| POST `/auth/login` | Public | `{ email, password }` | 200 |
| POST `/auth/verify-email` | Public | `{ token }` | 200 |
| POST `/auth/forgot-password` | Public | `{ email }` | 200 |
| POST `/auth/reset-password` | Public | `{ token, password }` | 200 |
| POST `/auth/refresh` | Refresh cookie | No body | 200 |
| POST `/auth/logout` | Any auth | No body | 200 |
| GET `/auth/sessions` | Any auth | - | 200 |
| DELETE `/auth/sessions/:id` | Any auth | Path `id` | 200 |
| GET `/users/me` | Any auth | - | 200 |
| PATCH `/users/me` | Any auth | `{ name?, password? }` | 200 |
| GET `/users/me/export` | Any auth | - | 200 |
| GET `/users` | Admin | `page?, limit?, q?` | 200 |
| POST `/users` | Admin | `{ email, password, name, role, fleetId? }` | 201 |
| GET `/users/:id` | Admin | Path `id` | 200 |
| PATCH `/users/:id` | Admin | `{ name?, role?, fleetId?, password? }` | 200 |
| DELETE `/users/:id` | Admin | Path `id` | 200 |

Password rules: at least 8 characters and at most 128 characters for auth
passwords; user-management passwords require at least 8 characters.

### Fleet and assignments

| Method and path | Auth | Body / query | Success |
|---|---|---|---:|
| GET `/drivers` | Admin, fleet manager | `page?, limit?` | 200 |
| POST `/drivers` | Admin, fleet manager | Driver creation body | 201 |
| GET `/drivers/:id` | Admin, fleet manager | Path `id` | 200 |
| PATCH `/drivers/:id` | Admin, fleet manager | Driver patch body | 200 |
| GET `/vehicles` | Admin, fleet manager | `page?, limit?` | 200 |
| POST `/vehicles` | Admin, fleet manager | Vehicle creation body | 201 |
| GET `/vehicles/:id` | Admin, fleet manager | Path `id` | 200 |
| PATCH `/vehicles/:id` | Admin, fleet manager | Vehicle patch body | 200 |
| GET `/assignments` | Admin, fleet manager | `page?, limit?` | 200 |
| POST `/assignments` | Admin, fleet manager | `{ driverId, vehicleId, shipmentId, startsAt, endsAt? }` | 201 |
| PATCH `/assignments/:id` | Admin, fleet manager | `{ status?, endsAt? }` | 200 |

Driver creation also accepts `email`, `password`, `name`, `fleetId?`,
`licenseNumber`, `licenseExpiry`, `phone`, and `emergencyContact?`.
Driver patch fields are `licenseNumber?`, `licenseExpiry?`, `phone?`,
`status?` (`available|on_trip|off_duty`), `assignedVehicleId?`,
`emergencyContact?`, and `locationSharingEnabled?`.
Vehicle creation fields are `fleetId?`, `registrationNumber`, `type`
(`truck|van|rail_car|other`), `capacity?`, `status?`
(`active|idle|maintenance|retired`), and `maintenanceDueAt?`.
Assignment status is `scheduled|active|completed|cancelled`.

### Shipments and network

| Method and path | Auth | Body / query | Success |
|---|---|---|---:|
| GET `/shipments` | Any auth | `page?, limit?` | 200 |
| POST `/shipments` | Admin, ops manager, controller | Shipment creation body | 201 |
| POST `/shipments/import` | Admin, ops manager, controller | `{ csv }` | 200 |
| GET `/shipments/:id` | Any auth | Path `id` | 200 |
| PATCH `/shipments/:id` | Any auth, ownership rules | Shipment patch body | 200 |
| DELETE `/shipments/:id` | Admin, ops manager, controller | Path `id` | 200 |
| POST `/routes/optimize` | Admin, ops manager, controller | `{ origin, destination, cargoType?, priority? }` | 200 |
| GET `/corridors` | Any auth | `page?, limit?` | 200 |
| GET `/corridors/:id` | Any auth | Path `id` | 200 |
| GET `/hospitals` | Any auth | `page?, limit?` | 200 |
| GET `/hospitals/nearby` | Any auth | `lat, lng, radius?` | 200 |
| GET `/highways` | Any auth | - | 200 |
| POST `/highways/sync` | Admin | No body | 200 |
| GET `/disruptions` | Any auth | `page?, limit?` | 200 |
| POST `/disruptions` | Admin, ops manager, controller, driver | Disruption body | 201 |
| POST `/webhooks/disruptions` | API key if configured | Disruption body | 201 |

Shipment creation fields: `reference`, `origin`, `destination`, `carrier?`,
`priority?` (`low|medium|high|critical`), `cargoType?`, `eta?`, and
`currentCorridorId?`. Patch additionally accepts `status?`
(`planned|in_transit|delayed|delivered|cancelled`).
Disruption fields are `type`, `severity` (`low|medium|high|critical`),
`description`, `affectedCorridorIds?`, GeoJSON `location?`, and `startedAt?`.
GeoJSON coordinates are `[longitude, latitude]`.

### Live tracking and emergency response

| Method and path | Auth | Body / query | Success |
|---|---|---|---:|
| POST `/tracking/ping` | Driver, own trip | `{ lat, lng, accuracy?, speed?, heading?, recordedAt, tripId? }` | 201 |
| GET `/tracking/drivers/:id/latest` | Fleet/location readers | Path `id` | 200 |
| GET `/tracking/drivers/:id/history` | Fleet write roles | Path `id` | 200 |
| GET `/emergency/alerts` | Any auth | `page?, limit?` | 200 |
| POST `/emergency/alerts` | Dispatcher roles or driver | Alert body | 201 |
| POST `/emergency/alerts/:id/acknowledge` | Dispatcher roles | Path `id` | 200 |
| POST `/emergency/alerts/:id/dispatch` | Dispatcher roles | Path `id` | 200 |
| POST `/emergency/alerts/:id/resolve` | Dispatcher roles | Path `id` | 200 |
| GET `/emergency/response-units` | Dispatcher roles | `page?, limit?` | 200 |
| POST `/emergency/response-units` | Dispatcher roles | `{ name, type, status? }` | 201 |
| PATCH `/emergency/response-units/:id` | Dispatcher roles | Any create field, optional | 200 |

Location pings require valid latitude/longitude and `recordedAt`. Drivers must
have location sharing enabled and an active trip. Old timestamps or implausible
location jumps return `422 STALE_LOCATION`. Alert creation accepts optional
`type`, `severity`, `description`, GeoJSON `location`, `corridorId`, and
`shipmentId`. Alert state transitions are acknowledge, dispatch, and resolve;
acknowledging an already acknowledged alert returns `409`.

### Risk, intelligence, and simulation

| Method and path | Auth | Body / query | Success |
|---|---|---|---:|
| GET `/risk/corridors` | Any auth | - | 200 |
| GET `/risk/accidents` | Any auth | - | 200 |
| POST `/risk/recompute` | Admin, analyst | No body | 200 |
| GET `/predictions` | Any auth | - | 200 |
| POST `/predictions/recompute` | Admin, analyst | No body | 200 |
| GET `/simulator/scenarios` | Admin, analyst | - | 200 |
| POST `/simulator/run` | Admin, analyst | `{ name, inputVariables }` | 201 |
| GET `/analytics/overview` | Admin, ops manager | - | 200 |
| GET `/analytics/fleet-compliance` | Admin, ops manager | - | 200 |
| POST `/copilot/message` | Any auth | `{ content, conversationId? }` | 200 |
| GET `/copilot/conversations/:id` | Any auth | Path `id` | 200 |

Copilot requests can return `503 COPILOT_UNAVAILABLE` when
`ANTHROPIC_API_KEY` is not configured or the provider fails.

### Reports, audit, and settings

| Method and path | Auth | Body / query | Success |
|---|---|---|---:|
| GET `/reports` | Admin, ops manager | - | 200 |
| POST `/reports` | Admin, ops manager | Report creation body | 201 |
| GET `/reports/:id/export` | Admin, ops manager | Path `id` | 200 |
| GET `/audit-log` | Admin | - | 200 |
| GET `/settings/data-sources` | Admin | - | 200 |
| POST `/settings/data-sources` | Admin | `{ name, kind, config? }` | 201 |

Report creation accepts `type`, `format?` (`csv|pdf`), `dateRange?` with
`from` and `to`, and arbitrary `filters?`. Data-source `kind` is one of
`overpass|webhook|manual|other`.

## 6. Scenario playbooks

These playbooks describe the intended developer and operator flows. Replace
IDs with values returned by earlier requests.

### Scenario A: approve a shipment for dispatch

1. Controller logs in.
2. `POST /shipments` with a `planned` shipment.
3. `POST /routes/optimize` with the shipment origin and destination.
4. `POST /assignments` using the driver, vehicle, and shipment IDs.
5. `PATCH /shipments/:id` with `{ "status": "in_transit" }`.
6. Driver sends `POST /tracking/ping`.
7. Operations verifies with `GET /tracking/drivers/:id/latest`.

Expected outcomes: `201` for creation, `200` for optimization/assignment state
changes, and `201` for the first location ping.

### Scenario B: change a shipment after a disruption

1. `POST /disruptions` with severity and affected corridor.
2. `GET /risk/corridors` to inspect updated risk.
3. `POST /routes/optimize` for an alternate route.
4. `PATCH /shipments/:id` with a new `currentCorridorId` and
   `{ "status": "delayed" }`.
5. Create a report with the affected date range.

Possible outcomes: `400` for invalid disruption data, `403` for a role that
cannot change shipments, `404` for an unknown shipment, or `503` if the highway
data source is unavailable.

### Scenario C: emergency alert lifecycle

1. Driver or dispatcher creates `POST /emergency/alerts`.
2. Dispatcher acknowledges with `POST /emergency/alerts/:id/acknowledge`.
3. Dispatcher dispatches a response unit with
   `POST /emergency/alerts/:id/dispatch`.
4. Dispatcher resolves with `POST /emergency/alerts/:id/resolve`.

An already acknowledged alert returns `409 ALERT_ALREADY_ACKNOWLEDGED`. Missing
location where the controller requires it returns `400 VALIDATION_ERROR`.

### Scenario D: discard/cancel an operation

There is no hard-delete or `discard` action for every resource. Use the
resource-specific supported transition:

- Shipment: `PATCH /shipments/:id` with `{ "status": "cancelled" }`, then
  optionally `DELETE /shipments/:id` when the caller has controller access.
- Assignment: `PATCH /assignments/:id` with `{ "status": "cancelled" }`.
- Emergency alert: use `resolve`, not delete.
- User: `DELETE /users/:id` performs the existing deletion behavior.

Clients should not invent `discard` or `approve` status values; validation
rejects values outside the documented enums with `400 VALIDATION_ERROR`.

### Scenario E: reject an invalid or unauthorized change

1. Send a request with a missing required field: expect `400` with `fields`.
2. Send a valid request using an insufficient role: expect
   `403 ROLE_SCOPE_DENIED`.
3. Send a resource ID from another fleet: expect `403 NOT_YOUR_FLEET`,
   `403 NOT_YOUR_TRIP`, or a privacy-preserving `404 NOT_FOUND`, depending on
   the controller.
4. Retry after rate limiting: expect `429`.

## 7. Real-time integration

Socket.io uses JWT authentication during connection and exposes these
namespaces:

- `/map`
- `/alerts`
- `/risk`
- `/tracking`

The current backend does not simulate driver GPS. The simulation feed drifts
corridor utilization and unassigned shipments only.

## 8. Operational dependencies

Required environment values include `MONGODB_URI`, distinct
`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`, `CLIENT_URL`, `CORS_ORIGINS`,
and `ENCRYPTION_KEY`. Optional integrations include SMTP, Mapbox, Overpass,
Anthropic, and Sentry. Startup exits when required environment validation
fails or MongoDB cannot connect.

Useful commands:

```bash
npm run dev
npm run build
npm run typecheck
npm test
```

## 9. Known implementation notes and next steps

- `GET /settings/data-sources` is exposed; a `getSource` controller function
  exists but is not currently mounted as an HTTP route.
- The API has a consistent envelope but no checked-in OpenAPI document yet.
  The next documentation step should be an OpenAPI 3.1 description generated
  from the route validators and kept in CI against this endpoint inventory.
- Add response examples to the Postman collections for each major success and
  error path before publishing externally.
- Add explicit idempotency keys for imports, webhook delivery, and emergency
  actions if clients may retry requests.
- Consider standardizing errors on RFC 9457 `application/problem+json` while
  preserving the current `success/error` shape during migration.

## 10. Documentation basis

The structure follows current API documentation guidance:

- OpenAPI Specification: <https://spec.openapis.org/oas/latest.html>
- Postman API documentation overview:
  <https://learning.postman.com/docs/publishing-your-api/api-documentation-overview/>
- HTTP status semantics: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status>
- Problem Details for HTTP APIs (RFC 9457):
  <https://www.rfc-editor.org/rfc/rfc9457>
- OWASP API Security guidance:
  <https://owasp.org/API-Security/editions/2023/en/0x00-header/>
