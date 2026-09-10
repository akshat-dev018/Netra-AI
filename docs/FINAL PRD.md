# NETRA
### National Emergency & Transport Risk Analytics
**Freight Intelligence & Predictive Logistics Control Tower**

> *"From reactive logistics to proactive decisions."*

---

**Document Type:** Product Requirements Document (PRD)
**Product:** NETRA
**Version:** 1.1 (revised — role architecture, fleet, live tracking, highways/hospitals)
**Status:** Prototype / Demonstration Product — Build Reference
**Platform:** Web Application (multi-portal — see [Section 4](#4-role-architecture--portals))
**Primary Interface:** Desktop/Laptop for back-office roles; Mobile-first for the Driver/Field portal
**Design Direction:** Government-grade, enterprise, clean, professional, light UI
**Color Theme:** `#DEEBEC` (surface/main), `#11315F` (primary/ink), `#EF270B` (critical/alert), `#EC7507` (warning), `#278B56` (success/safe)
**Document Snapshot:** Practices and structure are maintained over time; dependency versions referenced anywhere in this document are illustrative only and **must be re-verified** at build time (see [Section 16](#16-version-safety--dependency-rule)).

---

## Changelog — v1.0 → v1.1

This revision closes gaps found on final review before implementation begins:

- **Added a real role architecture.** v1.0 had one shared sidebar with role-gated menu items. That's not what was asked for. v1.1 defines **four distinct portals** (Command & Analytics Suite, Fleet Manager Portal, Driver/Field Portal, Admin Console) — each a genuinely different experience, not the same screen with hidden buttons.
- **Added the missing role.** "The signed-in user" whose location needs tracking is now a first-class role: **Driver / Field User**. Added **Fleet Manager** as its own role with its own data (vehicles, drivers, assignments) — previously there was no fleet concept at all.
- **Added live location tracking.** New `UserLocationPing` entity, a `/tracking` real-time channel, and explicit device-geolocation requirements — this did not exist in v1.0 beyond static shipment coordinates.
- **Made highways a real map layer, not just an abstract score.** Corridors are risk-scoring abstractions; highways are the physical road network underneath them. v1.1 separates the two and specifies where highway geometry data comes from.
- **Made "nearby hospitals" work from any live position** (a driver's current location, a vehicle's position, or an alert location), not only from a fixed alert location as in v1.0.
- **Added a full page/route count table** per portal so nothing is missing when scaffolding the frontend.
- **Added location-data privacy requirements** to the security checklist — live GPS tracking of a signed-in person is sensitive PII and needed explicit handling, which v1.0 did not address.

---

## Table of Contents

1. [Product Overview & Vision](#1-product-overview--vision)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Target Users & Personas](#3-target-users--personas)
4. [Role Architecture & Portals](#4-role-architecture--portals)
5. [Scope — v1.0 Prototype](#5-scope--v10-prototype)
6. [Information Architecture & Page Index](#6-information-architecture--page-index)
7. [Module Requirements](#7-module-requirements)
8. [Core Data Model](#8-core-data-model)
9. [Tech Stack](#9-tech-stack)
10. [Repository Structure](#10-repository-structure)
11. [Environment Variables](#11-environment-variables)
12. [Authentication & Authorization](#12-authentication--authorization)
13. [API Standards](#13-api-standards)
14. [Real-Time Architecture](#14-real-time-architecture)
15. [Design System](#15-design-system)
16. [Version Safety & Dependency Rule](#16-version-safety--dependency-rule)
17. [Security Checklist](#17-security-checklist)
18. [Non-Functional Requirements](#18-non-functional-requirements)
19. [NETRA Copilot (AI Assistance)](#19-netra-copilot-ai-assistance)
20. [Analytics & Reporting](#20-analytics--reporting)
21. [Roadmap & Phasing](#21-roadmap--phasing)
22. [Risks & Assumptions](#22-risks--assumptions)
23. [Appendix A — API Endpoint Index](#23-appendix-a--api-endpoint-index)

---

## 1. Product Overview & Vision

NETRA is a web-based **control tower** for national freight and transport networks. It fuses live shipment and vehicle telemetry, road/corridor risk signals, historical accident data, weather, and disruption feeds into a command surface that lets logistics operators, fleet managers, transport authorities, and emergency responders **see risk before it becomes an incident**, and **act within the same platform** once it does.

The product sits at the intersection of four traditionally siloed systems:

- **Fleet & driver management** (who is driving what, where they are right now, are they safe)
- **Shipment tracking** (where is the cargo, right now)
- **Risk & predictive analytics** (where is something likely to go wrong, and when)
- **Emergency response coordination** (who needs to be notified and dispatched when it does go wrong — including the nearest hospital to wherever the incident actually is)

NETRA's differentiator is the **correlation layer**: live vehicle/driver positions and shipments overlaid on real highway geometry and corridor risk models, predictive accident probability by segment, and a collapsed "detect → decide → dispatch" loop — with the right experience shown to the right role, instead of one shared admin screen everyone has to filter through.

### 1.1 Elevator Pitch
> A single platform that shows every shipment, vehicle, and driver on the network, scores every highway corridor for risk in real time, predicts where the next incident is statistically likely to happen, and — when something does happen — instantly surfaces the nearest hospital and response team relative to wherever the person actually is, not a fixed office location.

---

## 2. Goals & Success Metrics

| Goal | Metric (Prototype-stage proxy) |
|---|---|
| Reduce time-to-detection for corridor-level disruptions | Time from disruption ingestion → dashboard surfacing (target: <10s demo latency) |
| Reduce time-to-decision during an emergency | Clicks/time from alert trigger → nearest hospital + response team suggested (target: single screen, <3 clicks), computed from the actual live location of the incident |
| Increase route safety awareness | % of active shipments routed through corridors with a visible, current risk score, on top of real highway geometry |
| Give fleet managers real visibility | % of active drivers/vehicles with a live location ping in the last 5 minutes |
| Demonstrate predictive value | Accuracy/plausibility of the What-If Simulator and Accident Risk model outputs on demo datasets |
| Executive legibility | A non-technical stakeholder can read the Command Overview and correctly state network status within 60 seconds |
| Role clarity | Each role logs in and lands on a screen relevant to their job with zero navigation needed to find it |

Since v1.1 is still a **prototype/demonstration product**, success is measured primarily by coherence of the workflow story (data in → risk scored → predicted → visualized → acted on → reported) rather than production-scale KPIs. Section 21 defines what graduates this into a measurable production system.

---

## 3. Target Users & Personas

| Persona | Role Code | Portal | Core Need |
|---|---|---|---|
| **System Administrator** | `admin` | Admin Console (+ full access to Command Suite) | Control over users, roles, data sources, and configuration |
| **Operations Manager** | `ops_manager` | Command & Analytics Suite | Strategic oversight of shipments, routes, corridors, disruptions; owns SLA/cost/reporting |
| **Network Controller** | `controller` | Command & Analytics Suite | Live, minute-to-minute situational awareness of the whole network |
| **Risk Analyst** | `analyst` | Command & Analytics Suite | Confidence in *why* a corridor/highway segment is flagged, and *what-if* levers |
| **Emergency Dispatcher** | `dispatcher` | Command & Analytics Suite | Fastest possible path from alert → nearest capable hospital/unit → dispatch confirmation |
| **Fleet Manager** | `fleet_manager` | **Fleet Manager Portal** | Real-time visibility into vehicles and drivers, assignment, compliance, and safety |
| **Driver / Field User** | `driver` | **Driver / Field Portal** | A simple, mobile screen showing their assigned trip, a way to share live location, and one-tap access to nearby hospitals / SOS if something goes wrong |
| **Executive / Policy Stakeholder** | `viewer` | Command & Analytics Suite (read-only) | Clear rollups and exportable reports to brief leadership |

**Why `driver` matters:** this is the role behind "the signed-in user whose location is tracked." Every other role works from an office/desk view of the network; the Driver/Field User is physically *on* the network, and their live GPS position is itself one of the data feeds the rest of the platform consumes (it powers the Live Map, feeds Fleet Manager visibility, and is the anchor point for "nearby hospitals" in a real emergency).

---

## 4. Role Architecture & Portals

This is the structural fix from v1.0: **not everyone gets the same screen.** NETRA is one codebase and one login, but it renders four distinct experiences depending on who signed in. Role is decided at login (from the user's profile) and determines which portal shell loads.

### 4.1 Portal 1 — Command & Analytics Suite
*Used by: Network Controller, Operations Manager, Risk Analyst, Emergency Dispatcher, Executive/Viewer, and Admin (with full access).*

This is the full desktop control-tower experience described in [Section 6](#6-information-architecture--page-index) — the grouped sidebar (Command Center / Operations / Risk & Prediction / Emergency Response / Analytics / AI Assistance). All five of these roles share this shell, but:
- **The sidebar is filtered per role** — a Risk Analyst does not see Emergency Response write-actions; a Dispatcher's sidebar foregrounds Emergency Response and Live Map.
- **The landing page differs per role** on login:
  - Network Controller → Overview
  - Operations Manager → Overview (with Operations-focused KPIs emphasized)
  - Risk Analyst → Risk Monitoring
  - Emergency Dispatcher → Emergency Alerts
  - Executive/Viewer → Overview, read-only, Reports emphasized in nav
  - Admin → Overview, with Settings/Admin Console access always visible

### 4.2 Portal 2 — Fleet Manager Portal
*Used by: Fleet Manager.*

A **separate top-level portal**, not a tab inside the Command Suite. Fleet Managers care about vehicles and people, not corridor risk math. Its own sidebar:

```
FLEET MANAGER PORTAL
──────────────────────────────
Fleet Overview
Vehicles
Drivers
Assignments
Live Fleet Map
Compliance & Maintenance
```

Landing page: **Fleet Overview** (fleet-wide status: vehicles active/idle/in-maintenance, drivers on-trip/available/off-duty, any driver who has gone silent — no location ping beyond a configurable threshold). Fleet Managers also get **read-only** visibility into Shipments and the Live Map filtered to their own fleet, via a link out to the Command Suite in view-only mode.

### 4.3 Portal 3 — Driver / Field Portal
*Used by: Driver / Field User.*

Mobile-first, minimal-chrome, large touch targets — built for a phone screen on the move, not a desktop dashboard. This is the smallest and simplest portal in the product on purpose.

```
DRIVER PORTAL (mobile-first)
──────────────────────────────
My Trip           — assigned shipment, route, ETA
Share My Location — live tracking on/off toggle
Nearby Hospitals   — closest hospitals to current live position
SOS / Report Issue — one-tap emergency alert or disruption report
My Profile         — contact info, vehicle, password
```

No sidebar groups, no data tables, no charts — five screens, bottom tab navigation. See [7.9](#79-driver--field-portal) for full requirements.

### 4.4 Portal 4 — Admin Console
*Used by: System Administrator (as a dedicated section inside the Command Suite, not a separate login).*

Reached via **Settings** inside the Command & Analytics Suite, but functionally a distinct area: User & Role Management, Data Sources, Audit Log, Organization Settings. Only `admin` sees these tabs at all — they don't appear, disabled or otherwise, for any other role.

### 4.5 Why one codebase, four portals (not four separate apps)
A single Next.js app with role-aware routing keeps auth, the database, and shared components (map, tables, alert banner) in one place, while still giving each role a genuinely tailored entry point and navigation — satisfying "different for user / fleet manager / operations manager" without the overhead of maintaining three separate deployments. Route groups in Next.js's App Router map directly to this: `(command)/`, `(fleet)/`, `(driver)/` — detailed in [Section 10](#10-repository-structure).

---

## 5. Scope — v1.0 Prototype

### 5.1 In Scope
- All four portals in [Section 4](#4-role-architecture--portals), each with real (or realistically seeded) data.
- Email/password authentication with role-based access (no OAuth, no SSO).
- Live-updating map, fleet, and alert views via WebSockets, including **live geolocation tracking of the signed-in Driver/Field User's device**.
- A real highway/road layer on the map (not just abstract corridor lines) — see [7.2](#72-national-network-network) and [8.1](#81-highway--road-network-data).
- Hospital lookup that works relative to **any live coordinate** — an alert, a shipment, or a driver's current position — not a fixed location.
- Fleet management: vehicles, drivers, assignments, compliance status.
- Risk scoring and prediction surfaces driven by a documented, swappable scoring service (rule-based/statistical in v1.0).
- Emergency alert lifecycle: trigger → acknowledge → dispatch → resolve, including driver-initiated SOS.
- NETRA Copilot as a chat-based assistant scoped to the platform's own data.
- Report generation (on-screen + exportable PDF/CSV).

### 5.2 Out of Scope for v1.0
- Native mobile apps — the Driver Portal is a mobile-first **responsive web app** (installable as a PWA is a nice-to-have, not a requirement), not a native iOS/Android build.
- OAuth/SSO/SAML — email-based auth only, per requirement.
- Direct hardware telematics (OBD/CAN-bus vehicle sensors) — vehicle position in v1.0 comes from the driver's authenticated device (browser Geolocation API), not embedded hardware. Hardware telematics integration is a documented v2 upgrade path.
- Multi-tenant white-labeling — v1.0 is single-organization.
- Payment/billing flows.

---

## 6. Information Architecture & Page Index

### 6.1 Command & Analytics Suite

```
NETRA — COMMAND & ANALYTICS SUITE
──────────────────────────────────────────────
COMMAND CENTER
  ├─ Overview                 /dashboard
  ├─ National Network         /network
  └─ Live Map                 /map

OPERATIONS
  ├─ Shipments                /shipments
  ├─ Route Optimizer          /routes/optimizer
  ├─ Corridor Intelligence    /corridors
  └─ Disruptions              /disruptions

RISK & PREDICTION
  ├─ Risk Monitoring          /risk
  ├─ Accident Risk            /risk/accidents
  ├─ Predictions              /predictions
  └─ What-If Simulator        /simulator

EMERGENCY RESPONSE
  ├─ Emergency Alerts         /emergency/alerts
  ├─ Hospital Network         /emergency/hospitals
  └─ Response Monitoring      /emergency/response

ANALYTICS
  ├─ Analytics                /analytics
  └─ Reports                  /reports

AI ASSISTANCE
  └─ NETRA Copilot            /copilot
──────────────────────────────────────────────
SYSTEM (admin only)
  └─ Settings                 /settings
      ├─ Profile
      ├─ Users & Roles (admin)
      ├─ Data Sources (admin)
      ├─ Audit Log (admin)
      └─ Notification Preferences
```

### 6.2 Fleet Manager Portal

```
NETRA — FLEET MANAGER PORTAL
──────────────────────────────
Fleet Overview        /fleet
Vehicles              /fleet/vehicles
Drivers               /fleet/drivers
Assignments           /fleet/assignments
Live Fleet Map        /fleet/map
Compliance & Maint.   /fleet/compliance
```

### 6.3 Driver / Field Portal

```
NETRA — DRIVER PORTAL (mobile-first)
──────────────────────────────
My Trip                /driver
Share My Location      /driver/location
Nearby Hospitals       /driver/hospitals
SOS / Report Issue     /driver/sos
My Profile             /driver/profile
```

### 6.4 Shared / Cross-Portal
```
/login, /register, /verify-email, /forgot-password, /reset-password   — auth (all portals)
/health, /ready                                                       — system, not user-facing
```

### 6.5 Full Page Count (for build scaffolding)

| Portal | Pages | Count |
|---|---|---|
| Command & Analytics Suite | Overview, National Network, Live Map, Shipments, Route Optimizer, Corridor Intelligence, Disruptions, Risk Monitoring, Accident Risk, Predictions, What-If Simulator, Emergency Alerts, Hospital Network, Response Monitoring, Analytics, Reports, NETRA Copilot, Settings (with 4 sub-tabs) | **18** |
| Fleet Manager Portal | Fleet Overview, Vehicles, Drivers, Assignments, Live Fleet Map, Compliance & Maintenance | **6** |
| Driver / Field Portal | My Trip, Share My Location, Nearby Hospitals, SOS/Report Issue, My Profile | **5** |
| Auth (shared) | Login, Register, Verify Email, Forgot Password, Reset Password | **5** |
| **Total distinct routes** | | **34** |

**Sidebar / nav behavior (Command Suite):** collapsible to icon-only rail, active-route highlighting, group auto-expand on active child. Global top bar: organization selector (future multi-region), live connection status indicator, active-alerts badge. A persistent **critical alert ribbon** appears above the top bar app-wide (all portals, including Driver) whenever there is an unacknowledged critical emergency alert relevant to that user.

---

## 7. Module Requirements

### 7.1 Overview (`/dashboard`)
KPI strip: Active Shipments, Shipments At Risk, Open Disruptions, Active Emergency Alerts, **Drivers Currently Live** (location ping in last 5 min), Network Risk Index (0–100). Mini live map widget. Recent activity feed (real-time). Top 5 highest-risk corridors. Weather/hazard banner strip.

### 7.2 National Network (`/network`)
Structural view of the network: hubs, depots, **and the underlying highway/road geometry** (not just abstract corridor lines — see [8.1](#81-highway--road-network-data)). Filter by region, corridor type, operational status. Corridor detail drawer: length, capacity, utilization %, which highway(s) it runs along, linked shipments, linked risk score.

### 7.3 Live Map (`/map`)
Real-time geospatial operating picture. Layers (all independently toggleable):
- **Highways** — the real physical road network (base layer, always available, sourced per [8.1](#81-highway--road-network-data))
- **Corridor Risk Heat** — the scored abstraction overlaid on relevant highway stretches
- **Shipments** — live positions
- **Vehicles / Drivers** — live positions from device geolocation (visible to Controller, Ops Manager, Dispatcher, Admin, and Fleet Manager for their own fleet)
- **Disruptions**
- **Emergency Alerts**
- **Hospitals**

Marker click → contextual side panel with entity detail and quick actions (Reroute, Acknowledge Alert, Dispatch, **Find Nearest Hospital to this point**). Time-scrub (replay last N hours) is a nice-to-have, not required for v1.0.

### 7.4 Shipments (`/shipments`)
Data table: ID, origin, destination, carrier, assigned vehicle/driver, status, current corridor, risk exposure, ETA, last updated. Filters: status, corridor, risk level, date range, carrier, assigned driver. Detail view: route polyline on mini-map with the live vehicle position on top of it, timeline of status events, linked disruptions/alerts. Create/Edit shipment; bulk CSV import.

### 7.5 Route Optimizer (`/routes/optimizer`)
Input: origin, destination, cargo type/priority, constraints. Output: 2–3 ranked route candidates (ETA, distance, cost, composite risk score with breakdown), computed against real highway geometry where available. "Apply to Shipment" links the chosen route to a shipment and, optionally, assigns a vehicle/driver directly from here (handoff to Fleet Manager's Assignments).

### 7.6 Corridor Intelligence (`/corridors`)
Per-corridor risk score, 30/90-day trend, active shipment/disruption counts, historical accident density, weather exposure, infrastructure notes, and the specific highway segment(s) it maps to.

### 7.7 Disruptions (`/disruptions`)
Feed/table of disruptions; manual reporting + external feed webhook stub; **driver-submitted disruption reports from the field appear here too**, tagged by source (`manual` / `feed` / `driver_reported`). Impact panel: affected shipments, suggested reroutes.

### 7.8 Risk Monitoring, Accident Risk, Predictions, What-If Simulator (`/risk`, `/risk/accidents`, `/predictions`, `/simulator`)
Unchanged in substance from the original design: composite risk board with component breakdown by corridor/highway segment; historical + predictive accident probability; forward-looking prediction cards with confidence and an accuracy-tracking log; scenario builder for what-if analysis. All scoring is corridor/highway-segment based, so it inherits real geometry once [8.1](#81-highway--road-network-data) is wired in.

### 7.9 Driver / Field Portal
*(New in v1.1 — full spec, since this did not exist before.)*

**My Trip (`/driver`)** — the driver's current assigned shipment: origin/destination, route map, ETA, cargo notes, and a single "Start Trip" / "End Trip" action that begins/ends location sharing for that trip.

**Share My Location (`/driver/location`)** — a clear on/off toggle (default **on** only while a trip is active) requesting the browser's Geolocation permission; shows the driver their own current position on a small map; sends periodic location pings (configurable interval, e.g. every 30–60s while moving) to the backend. Explicit copy explaining *why* location is shared and *when* it stops (trip end / toggle off) — required for informed consent, not just a permission prompt.

**Nearby Hospitals (`/driver/hospitals`)** — list + mini map of the closest hospitals to the driver's **current live position** (not a fixed office location), ranked by distance and trauma capability, with one-tap call/directions.

**SOS / Report Issue (`/driver/sos`)** — one large, unmistakable action to raise an emergency alert immediately (auto-attaches current location, shipment, and vehicle), plus a secondary, lower-urgency "Report a Disruption" form (road closure, accident witnessed, weather hazard) for things that aren't a personal emergency.

**My Profile (`/driver/profile`)** — name, phone, assigned vehicle, license info (read-only, managed by Fleet Manager), password change, notification preferences.

### 7.10 Fleet Manager Portal Modules
*(New in v1.1.)*

**Fleet Overview (`/fleet`)** — counts by status: vehicles (active/idle/maintenance), drivers (on-trip/available/off-duty), and a **"gone silent" list** — drivers whose last location ping exceeds a configurable staleness threshold, surfaced prominently since this is often the first sign something is wrong.

**Vehicles (`/fleet/vehicles`)** — table: registration/plate, type, capacity, status, assigned driver, current location, linked shipment. Create/edit vehicle; retire vehicle (soft delete).

**Drivers (`/fleet/drivers`)** — table: name, license number/expiry, phone, status, assigned vehicle, last location ping time. Create/edit driver profile (this creates the corresponding `driver`-role user account); license expiry flagged in the design system's warning color as it approaches.

**Assignments (`/fleet/assignments`)** — assign a driver + vehicle to a shipment; view current and upcoming assignments; conflict detection (can't double-book a driver or vehicle).

**Live Fleet Map (`/fleet/map`)** — same map component as the Command Suite's Live Map, but scoped to only this fleet's vehicles/drivers, with the Highways and Corridor Risk layers still available as context.

**Compliance & Maintenance (`/fleet/compliance`)** — license expiry tracking, vehicle maintenance due dates/history, flagged items requiring action.

### 7.11 Emergency Alerts, Hospital Network, Response Monitoring (`/emergency/*`)
Unchanged core behavior, with two additions:
- Alerts can now be **driver-initiated** (`triggeredBy: 'driver_sos'`) in addition to `system` and `manual`, and carry the driver's live location at time of trigger.
- **Hospital Network's "Suggest Hospitals" action now accepts any coordinate as input** — an alert's location, a shipment's current position, or (from the Driver Portal) the driver's own live position — ranked by distance + capacity + capability match. This is the same underlying `GET /api/v1/hospitals/nearby?lat&lng` endpoint reused across three different UI entry points.

### 7.12 Analytics & Reports (`/analytics`, `/reports`)
Unchanged in substance; add fleet-oriented metrics (driver location-ping reliability, on-trip vs. idle time, license/maintenance compliance rate) as additional chart options and a report template ("Fleet Compliance Report").

### 7.13 NETRA Copilot (`/copilot`)
Unchanged from v1.0 — see [Section 19](#19-netra-copilot-ai-assistance).

### 7.14 Settings / Admin Console (`/settings`)
Unchanged from v1.0, with the role list in User Management updated to the seven roles in [Section 3](#3-target-users--personas), and a note that creating a `driver` account should optionally prompt to also create the linked `Driver` fleet profile (or link to an existing unlinked profile) so Fleet Manager and Driver Portal data stay in sync.

---

## 8. Core Data Model

### 8.1 Highway / Road Network Data
Corridors in NETRA are a **risk-scoring abstraction** ("this stretch of network"); highways are the **real physical roads** underneath them, and the product needs both. For v1.0:

- Seed the map's highway layer from an open geometry source — **OpenStreetMap (via the Overpass API or a pre-extracted regional extract)** is the recommended default: free, detailed, and covers national/state highways with reference numbers (e.g., `NH-44`, `SH-...` for an India-context deployment) and administrative metadata.
- Each `Corridor` record stores a `highwayRef` (the real-world highway name/number it corresponds to) and its `path` is derived from or aligned to that OSM geometry, rather than being drawn freehand — this is what makes the risk-heat overlay actually sit on real roads on the Live Map instead of floating arbitrary lines.
- If a government/NHAI-style authoritative highway dataset is available for the target region, prefer it over OSM and document the swap — the data-access layer should not care which source populated `Corridor.path`.

### 8.2 Entities

All models include `createdAt`, `updatedAt`, and `isDeleted: boolean` (soft delete) unless noted. Geo fields use GeoJSON with `2dsphere` indexes.

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `email`, `passwordHash`, `name`, `role` (`admin`\|`ops_manager`\|`controller`\|`analyst`\|`dispatcher`\|`fleet_manager`\|`driver`\|`viewer`), `isEmailVerified`, `failedLoginAttempts`, `lockUntil`, `refreshTokenHash` | Email/password only |
| **Driver** *(new)* | `userId` (links to a `driver`-role User), `licenseNumber`, `licenseExpiry`, `phone`, `assignedVehicleId?`, `status` (`available`\|`on_trip`\|`off_duty`), `emergencyContact`, `lastKnownLocation` (GeoJSON Point, cached from latest ping), `lastPingAt` | Managed by Fleet Manager |
| **Vehicle** *(new)* | `registrationNumber`, `type` (`truck`\|`van`\|`rail_car`\|`other`), `capacity`, `status` (`active`\|`idle`\|`maintenance`\|`retired`), `assignedDriverId?`, `currentLocation` (cached), `maintenanceDueAt` | Managed by Fleet Manager |
| **UserLocationPing** *(new)* | `driverId`, `location` (GeoJSON Point), `accuracy`, `speed?`, `heading?`, `recordedAt`, `tripId?` (links to active shipment) | High-write, time-series; retain full detail 24–72h then downsample/purge (see [17](#17-security-checklist)); `Driver.lastKnownLocation` is a denormalized cache of the latest row for fast reads |
| **Shipment** | `reference`, `origin`, `destination`, `carrier`, `status`, `assignedDriverId?`, `assignedVehicleId?`, `currentCorridorId`, `routePolyline`, `riskScore`, `eta`, `priority`, `cargoType`, `createdBy` | |
| **Corridor** | `name`, `highwayRef`, `path` (GeoJSON LineString, sourced per [8.1](#81-highway--road-network-data)), `nodeStart`, `nodeEnd`, `type`, `capacity`, `currentUtilization`, `riskScore`, `riskComponents` | |
| **Disruption** | `type`, `severity`, `affectedCorridorIds[]`, `status`, `source` (`manual`\|`feed`\|`driver_reported`), `reportedByDriverId?`, `location`, `startedAt`, `resolvedAt`, `description` | |
| **RiskEvent** | `corridorId`, `score`, `components`, `threshold`, `triggeredAlertId?` | |
| **Prediction** | `corridorId`/`regionId`, `predictedRiskTrajectory[]`, `confidence`, `horizonHours`, `contributingSignals[]`, `resolvedOutcome?` | |
| **SimulationScenario** | `name`, `createdBy`, `inputVariables`, `resultSummary` | |
| **EmergencyAlert** | `type`, `severity`, `status`, `location`, `corridorId?`, `shipmentId?`, `triggeredBy` (`system`\|`manual`\|`driver_sos`), `triggeredByDriverId?`, `acknowledgedBy?`, `dispatchedUnits[]`, `resolvedAt?`, `slaMinutes` | |
| **Hospital** | `name`, `location`, `traumaLevel`, `capabilities[]`, `capacityStatus`, `contactInfo` | `2dsphere` indexed — queried by any live coordinate, not just a fixed alert location |
| **ResponseUnit** | `name`, `type`, `status`, `currentLocation`, `assignedAlertId?` | |
| **Report** | `type`, `generatedBy`, `dateRange`, `filters`, `fileUrl`, `format` | |
| **AuditLog** | `actorId`, `action`, `targetType`, `targetId`, `metadata`, `ip` | |
| **CopilotConversation** | `userId`, `messages[]`, `contextSnapshotIds[]` | |

---

## 9. Tech Stack

### 9.1 Frontend completion and accessibility requirements

- The frontend must use the backend route inventory as its source of truth. Every
  mounted HTTP endpoint must have either a user-facing workflow or an explicit
  service-layer integration; do not invent client routes such as `/fleet/overview`
  or `/drivers/me` when the backend does not expose them.
- Authenticated downloads and mutations must use the shared API client so bearer
  tokens, refresh handling, cookies, and error envelopes are preserved.
- Live portals must subscribe to the Socket.io `/map`, `/alerts`, `/risk`, and
  `/tracking` namespaces when real-time mode is enabled.
- A persistent **Colorblind Mode** toggle must be available in the application
  chrome. It must persist locally, expose `aria-pressed`, use palettes that do
  not rely on red/green alone, and add patterns, labels, icons, or shapes to
  critical/warning/safe statuses.
- The supplied transparent `netra_logo.png` is the canonical brand asset and
  must be used in authentication and portal shells.
- Browser geolocation must be requested only with user consent, clearly explain
  why location is shared, stop on trip completion or opt-out, and surface
  permission/network errors without silently failing.

### 9.2 Backend-to-frontend coverage

The UI must cover authentication, users/admin, fleet, assignments, tracking,
shipments/import, route optimization, corridors/highways, disruptions,
emergency alerts and response units, risk/predictions, simulation, analytics,
reports/export, Copilot, audit logs, and settings/data sources. Read-only
administrative endpoints may be presented as settings tabs, but they must not be
rendered to roles that cannot access them server-side.

| Layer | Choice | Notes |
|---|---|---|
| **Frontend framework** | Next.js (React, App Router) | Route groups per portal: `(command)/`, `(fleet)/`, `(driver)/`, `(auth)/` |
| **Styling** | Tailwind CSS | NETRA color tokens; Driver Portal uses larger touch targets and simplified components from the same design system |
| **Frontend state (server)** | TanStack Query | |
| **Frontend forms** | React Hook Form + Zod | |
| **Maps** | Mapbox GL JS or MapLibre GL (open-source) | Must render a highway/road base layer, not just point markers — verify chosen library supports vector tile road layers or an OSM-derived GeoJSON overlay |
| **Device geolocation** | Browser Geolocation API (`navigator.geolocation.watchPosition`) | Driver Portal only; requires HTTPS and explicit user permission; must handle permission-denied gracefully |
| **Charts** | Recharts | |
| **HTTP client** | Axios | Token-refresh interceptor pattern |
| **Backend runtime** | Node.js | Search current Active LTS |
| **Backend framework** | Express | TypeScript, strict mode |
| **Database** | MongoDB Atlas | Geo-indexed collections |
| **ODM** | Mongoose | |
| **Validation** | Zod | |
| **Auth** | Email + password only | JWT access + refresh; no OAuth |
| **Password hashing** | bcryptjs | Cost ≥ 10 |
| **Email delivery** | Nodemailer (SMTP via Resend/SendGrid) | |
| **Real-time** | Socket.io | Namespaces incl. `/tracking` for live driver/vehicle location — see [Section 14](#14-real-time-architecture) |
| **Job scheduling** | node-cron | Prediction refresh, TTL cleanup of stale location pings, license/maintenance due reminders |
| **Security headers** | helmet | |
| **CORS** | cors | Explicit allowlist |
| **Rate limiting** | express-rate-limit | Strict on `/auth/*` and `/tracking/ping` |
| **NoSQL sanitize** | express-mongo-sanitize | |
| **Logging** | winston | Never logs raw coordinates at info level in production |
| **Monitoring** | @sentry/node + @sentry/nextjs | |
| **AI / Copilot backend** | Anthropic API via server-side proxy | Never called from the browser directly |
| **Deploy — Frontend** | Vercel | |
| **Deploy — Backend** | Render or Railway | |
| **Deploy — Database** | MongoDB Atlas | |

**Token lifetime standard:** Access JWT `15 minutes` · Refresh token `7 days` (`HttpOnly; Secure; SameSite=Strict`).

---

## 10. Repository Structure

```
NETRA/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── config/{env.ts, db.ts}
│   │   ├── middleware/{requireAuth.ts, validate.ts, roleGuard.ts, errorHandler.ts}
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── drivers/                # new
│   │   │   ├── vehicles/               # new
│   │   │   ├── tracking/               # new — location ping ingest + latest-position reads
│   │   │   ├── shipments/
│   │   │   ├── corridors/              # includes highwayRef + geometry source logic
│   │   │   ├── disruptions/
│   │   │   ├── risk/
│   │   │   ├── predictions/
│   │   │   ├── simulator/
│   │   │   ├── emergency-alerts/
│   │   │   ├── hospitals/              # nearby-by-coordinate query, reused across portals
│   │   │   ├── response-units/
│   │   │   ├── analytics/
│   │   │   ├── reports/
│   │   │   ├── copilot/
│   │   │   └── audit-log/
│   │   ├── services/
│   │   │   ├── riskScoring.service.ts
│   │   │   ├── prediction.service.ts
│   │   │   ├── highwayData.service.ts  # new — OSM/Overpass ingestion & sync
│   │   │   ├── email.service.ts
│   │   │   ├── report.service.ts
│   │   │   └── cron.service.ts         # incl. stale-location & TTL cleanup jobs
│   │   ├── sockets/index.ts            # namespaces: /map, /alerts, /risk, /tracking
│   │   ├── utils/{jwt.ts, encryption.ts, ownershipCheck.ts, tokenCompare.ts}
│   │   └── types/express.d.ts
│   ├── postman/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/ register/ verify-email/ reset-password/
│   │   │   ├── (command)/                     # Command & Analytics Suite (5 role groups share this)
│   │   │   │   ├── dashboard/  network/  map/
│   │   │   │   ├── shipments/  routes/optimizer/  corridors/  disruptions/
│   │   │   │   ├── risk/  risk/accidents/  predictions/  simulator/
│   │   │   │   ├── emergency/alerts/  emergency/hospitals/  emergency/response/
│   │   │   │   ├── analytics/  reports/  copilot/
│   │   │   │   └── settings/  settings/users/  settings/data-sources/  settings/audit-log/
│   │   │   ├── (fleet)/                        # Fleet Manager Portal
│   │   │   │   ├── fleet/  fleet/vehicles/  fleet/drivers/
│   │   │   │   └── fleet/assignments/  fleet/map/  fleet/compliance/
│   │   │   ├── (driver)/                       # Driver / Field Portal — mobile-first layout
│   │   │   │   ├── driver/  driver/location/
│   │   │   │   └── driver/hospitals/  driver/sos/  driver/profile/
│   │   │   └── layout.tsx                      # role-aware: picks portal shell by session role
│   │   ├── components/
│   │   │   ├── layout/{CommandSidebar.tsx, FleetSidebar.tsx, DriverTabBar.tsx, TopBar.tsx, AlertRibbon.tsx}
│   │   │   └── ui/
│   │   ├── lib/{env.ts, api/client.ts, api/refreshClient.ts, socket.ts, geolocation.ts}
│   │   ├── auth/{AuthProvider.tsx, tokenStore.ts}
│   │   ├── features/<resource>/{api.ts, components/, types.ts}
│   │   └── styles/tailwind.config.ts
│   ├── .env.example
│   └── package.json
│
└── docs/
    ├── NETRA_PRD_v1_1.md
    └── BACKEND_PLANNING.md
```

---

## 11. Environment Variables

### Backend `.env.example`
```env
# ── Server ─────────────────────────────────────────────
NODE_ENV=development
PORT=5000

# ── Database ───────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/netra

# ── JWT ────────────────────────────────────────────────
JWT_ACCESS_SECRET=replace_with_64_char_hex
JWT_REFRESH_SECRET=replace_with_different_64_char_hex
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Frontend URL / CORS ─────────────────────────────────
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# ── Encryption ──────────────────────────────────────────
ENCRYPTION_KEY=replace_with_64_char_hex

# ── Email ────────────────────────────────────────────────
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_smtp_api_key
EMAIL_FROM=alerts@netra.yourdomain.com

# ── Maps & Highway Data ──────────────────────────────────
MAPBOX_SERVER_TOKEN=your_mapbox_server_token
OVERPASS_API_URL=https://overpass-api.de/api/interpreter   # or a self-hosted instance

# ── Location Tracking ────────────────────────────────────
LOCATION_PING_MAX_INTERVAL_SECONDS=60
LOCATION_STALE_THRESHOLD_MINUTES=5
LOCATION_RAW_RETENTION_HOURS=72       # raw pings purged/downsampled after this window

# ── AI Copilot ────────────────────────────────────────────
ANTHROPIC_API_KEY=your_anthropic_api_key

# ── Monitoring ────────────────────────────────────────────
SENTRY_DSN=https://your_sentry_dsn_here
```

### Frontend `.env.example`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_COPILOT=true
NEXT_PUBLIC_LOCATION_PING_INTERVAL_SECONDS=45
```

### Env Validation Pattern (Backend)
```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).default('5000'),
  MONGODB_URI: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CLIENT_URL: z.string().url(),
  CORS_ORIGINS: z.string(),
  ENCRYPTION_KEY: z.string().length(64),
  LOCATION_STALE_THRESHOLD_MINUTES: z.string().transform(Number).default('5'),
  LOCATION_RAW_RETENTION_HOURS: z.string().transform(Number).default('72'),
  SMTP_HOST: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

---

## 12. Authentication & Authorization

Email/password only — no Google/OAuth/SSO. Same flow set as v1.0: Register (admin-invited in production posture) → Verify Email → Login (15min access / 7d refresh cookie) → Refresh (rotating) → Logout, with account lockout after 5 failed attempts (15 min).

### 12.1 Roles (RBAC) — revised
| Role | Portal | Access |
|---|---|---|
| `admin` | Command Suite + Admin Console | Full access everywhere, incl. User Management, Data Sources, Audit Log |
| `ops_manager` | Command Suite | Command Center, Operations (read/write), Analytics, Reports |
| `controller` | Command Suite | Command Center, Operations (read/write) — live day-to-day monitoring |
| `analyst` | Command Suite | Risk & Prediction (read/write), Analytics |
| `dispatcher` | Command Suite | Emergency Response (read/write), Live Map |
| `fleet_manager` | **Fleet Manager Portal** | Vehicles, Drivers, Assignments, Compliance (read/write, own fleet); read-only Shipments/Live Map |
| `driver` | **Driver / Field Portal** | Own trip, own location sharing, nearby hospitals, SOS, own profile only |
| `viewer` | Command Suite | Read-only across all Command Suite modules except Settings |

`roleGuard` middleware enforces module-level (and, for `driver`/`fleet_manager`, **record-level** — a driver can only read/write their own trip and location; a fleet manager only their own fleet) access server-side. The frontend additionally renders a different portal shell per role — not just hidden buttons on a shared page.

---

## 13. API Standards

Unchanged response contract from v1.0:

```typescript
// Success
{ "success": true, "data": { ... } }
// Paginated
{ "success": true, "data": [...], "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 } }
// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable", "fields": {} } }
```

New error codes for v1.1:

| HTTP | Code | When to use |
|---|---|---|
| 400 | `LOCATION_PERMISSION_REQUIRED` | Driver attempted to start a trip without granting geolocation permission |
| 403 | `NOT_YOUR_TRIP` | Driver tried to access/update a shipment not assigned to them |
| 403 | `NOT_YOUR_FLEET` | Fleet Manager tried to access a vehicle/driver outside their fleet |
| 422 | `STALE_LOCATION` | A location ping's timestamp is implausibly old/future — rejected rather than silently accepted |
| 503 | `HIGHWAY_DATA_UNAVAILABLE` | Highway geometry source (Overpass/OSM) unreachable — map falls back to last-cached geometry |

(All error codes from the v1.0 master reference — `VALIDATION_ERROR`, `UNAUTHORIZED`, `TOKEN_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_ERROR`, `ROLE_SCOPE_DENIED`, `ALERT_ALREADY_ACKNOWLEDGED`, `RISK_ENGINE_UNAVAILABLE`, `COPILOT_UNAVAILABLE` — still apply.)

---

## 14. Real-Time Architecture

Socket.io namespaces, JWT-authenticated on connection:

| Namespace | Purpose | Emits |
|---|---|---|
| `/map` | Live shipment position + corridor risk color updates | `shipment:position`, `corridor:risk-updated` |
| `/alerts` | Emergency alert lifecycle | `alert:created`, `alert:acknowledged`, `alert:dispatched`, `alert:resolved` |
| `/risk` | Risk board + prediction refresh | `risk:updated`, `prediction:updated` |
| `/tracking` *(new)* | Live driver/vehicle location | `driver:location`, `vehicle:location`, `driver:offline` (fired when a driver crosses the stale-location threshold) |

**Driver Portal → `/tracking` flow:** while a trip is active and location sharing is on, the client calls `navigator.geolocation.watchPosition`, batches/throttles updates to the configured interval, and emits a ping to the backend. The backend validates the ping (rejects implausible jumps/timestamps — `STALE_LOCATION`), writes a `UserLocationPing` row, updates the denormalized `Driver.lastKnownLocation`, and re-broadcasts `driver:location` to any Command Suite or Fleet Manager clients subscribed to that driver/fleet room. A cron job flags any driver with no ping past `LOCATION_STALE_THRESHOLD_MINUTES` and emits `driver:offline` to the Fleet Manager Portal.

For the prototype, non-driver live data (shipment movement not tied to a real driver session, ambient corridor score drift) may still be simulated server-side, isolated behind `services/simulationFeed.service.ts` as in v1.0 — but **driver/vehicle location must come from the actual authenticated device**, since that is the specific capability requested for this revision, not a simulated feed.

---

## 15. Design System

Unchanged from v1.0 — see full detail in the original tokens table. Summary:

| Token | Hex | Usage |
|---|---|---|
| Surface | `#DEEBEC` | Backgrounds, cards |
| Primary | `#11315F` | Nav, headers, buttons |
| Critical | `#EF270B` | Emergency alerts, high risk, SOS button |
| Warning | `#EC7507` | Medium risk, license/maintenance expiring soon |
| Success | `#278B56` | Normal/healthy, resolved, driver "live" indicator |

**Driver Portal specifics:** larger touch targets (min 44×44px), high-contrast SOS button always in the same place (bottom tab, red, icon + label), minimal text entry, works one-handed.

---

## 16. Version Safety & Dependency Rule

Unchanged from v1.0: **never copy version numbers from this document into `package.json`.** Web-search + `npm show <package> version` for every dependency at implementation time, check for CVEs, run `npm audit` before shipping. This applies to all additions in this revision too — notably any Overpass/OSM client library and the Geolocation-related packages, if a wrapper library is used instead of the raw browser API.

---

## 17. Security Checklist

All items from the v1.0 checklist still apply (env/config, auth, API security, infrastructure, frontend-specific — not repeated here for brevity; see the base sections). **New items for v1.1:**

### 17.1 Location Data Privacy (new — critical)
- [ ] Location sharing requires **explicit, informed consent** at the point of use (clear copy in the Driver Portal, not buried in Settings)
- [ ] Location sharing defaults to **off outside of an active trip** — a driver is never tracked when not on the clock
- [ ] Raw `UserLocationPing` rows are retained only for `LOCATION_RAW_RETENTION_HOURS` (default 72h) then purged or downsampled — enforced via a TTL index or scheduled cron job
- [ ] Only roles with a legitimate need (`fleet_manager` for their own fleet; `controller`/`dispatcher`/`ops_manager`/`admin` for network-wide operational awareness) can read live driver locations — `driver` role can only read their own
- [ ] Location data is never included in analytics exports or reports in a way that reveals a specific driver's movement history without that driver's role-appropriate context
- [ ] `AuditLog` records who accessed a specific driver's location history and when

### 17.2 Fleet & Assignment Integrity
- [ ] `roleGuard` enforces `NOT_YOUR_FLEET` / `NOT_YOUR_TRIP` — a Fleet Manager or Driver cannot read/write records outside their own scope, checked server-side on every request, not just hidden in the UI
- [ ] Vehicle/driver double-booking prevented at the API layer (not just a UI warning) when creating Assignments

---

## 18. Non-Functional Requirements

All v1.0 items still apply (performance, scalability, availability, accessibility, auditability, retention, browser support). **Additions:**

| Category | Requirement |
|---|---|
| **Driver Portal performance** | Must remain usable on a mid-range Android phone over a 4G connection; location pings must degrade gracefully (queue/retry) on intermittent connectivity rather than failing silently |
| **Battery/data consideration** | Location ping interval is configurable (`LOCATION_PING_MAX_INTERVAL_SECONDS`) specifically to balance map freshness against driver phone battery/data usage — do not default to continuous high-frequency tracking |
| **Geolocation accuracy** | Accept and display the browser-reported accuracy radius; do not present low-accuracy pings (e.g., IP-based fallback) as precise on the map without visually indicating uncertainty |
| **Highway data freshness** | Corridor `path` geometry synced from the highway data source on a scheduled basis (e.g., weekly cron), not fetched live per request — cache and serve from the database |

---

## 19. NETRA Copilot (AI Assistance)

Unchanged from v1.0: server-side-only LLM proxy, grounded in the platform's own data, no direct write access, all output sanitized before render. One addition: Copilot can now answer fleet/location questions too (e.g., "Which drivers haven't pinged in the last 15 minutes?"), pulling from `Driver`/`UserLocationPing` the same way it pulls from `Corridor`/`EmergencyAlert`.

---

## 20. Analytics & Reporting

Unchanged core design; add the Fleet Compliance Report template and fleet/location-derived metrics noted in [7.12](#712-analytics--reports-analytics-reports).

---

## 21. Roadmap & Phasing

| Phase | Scope |
|---|---|
| **Phase 0 — Prototype (this PRD, v1.1)** | All four portals with seeded/simulated network data, **real device-based driver location tracking**, real highway geometry (OSM-sourced), hospital lookup by any live coordinate, rule-based risk scoring, Copilot on live DB context |
| **Phase 1 — MVP** | Replace simulated corridor/weather/disruption feeds with real data sources; calibrate risk scoring with historical data; scheduled report delivery; evaluate authoritative (e.g., government/NHAI-style) highway data as an OSM replacement |
| **Phase 2 — Production Hardening** | Multi-instance scaling (Redis Socket.io adapter for the `/tracking` load specifically, since it's the highest-frequency namespace), trained ML model replacing rule-based scoring, optional hardware telematics integration for vehicles, formal penetration test, automated location-data retention/archival |
| **Phase 3 — Expansion** | Multi-region/multi-tenant support, native driver mobile app (push notifications, background location, offline queueing), deeper carrier/IoT integration |

---

## 22. Risks & Assumptions

| Risk / Assumption | Mitigation |
|---|---|
| Browser geolocation is less accurate/reliable than dedicated hardware GPS trackers | Documented explicitly as a v1.0 constraint; accuracy radius shown in UI; hardware telematics is the named v2 upgrade path |
| Drivers may deny location permission or lose connectivity | Graceful degradation: last-known position shown with a clear "stale" indicator rather than the UI breaking; retry/queue on reconnect |
| OSM highway data quality varies by region | Flagged as a data-sourcing risk in Phase 1; authoritative government data preferred where available |
| Live location tracking of employees is a sensitive privacy topic even with consent | Section 17.1 treated as mandatory, not optional, from prototype stage — this is not a "we'll add privacy later" item |
| Government-grade product implies higher scrutiny on auditability and access control | `AuditLog` and role-scoping (`NOT_YOUR_FLEET`/`NOT_YOUR_TRIP`) enforced server-side from day one |
| Map/highway provider (Mapbox) has usage-based costs | Evaluate MapLibre + self-served OSM tiles as a no-cost alternative before committing |
| Risk/prediction scoring is rule-based, not ML-trained, in v1.0 | Explicitly documented as illustrative; Predictions module tracks confidence and accuracy over time |

---

## 23. Appendix A — API Endpoint Index

| Module | Endpoint | Method | Auth | Min Role |
|---|---|---|---|---|
| Auth | `/api/v1/auth/register` | POST | No | — |
| Auth | `/api/v1/auth/login` | POST | No | — |
| Auth | `/api/v1/auth/verify-email` | POST | No | — |
| Auth | `/api/v1/auth/forgot-password` / `reset-password` | POST | No | — |
| Auth | `/api/v1/auth/refresh` | POST | Cookie | — |
| Auth | `/api/v1/auth/logout` | POST | Yes | any |
| Users | `/api/v1/users/me` | GET | Yes | any |
| Users | `/api/v1/users`, `/api/v1/users/:id` | GET/POST/PATCH/DELETE | Yes | admin |
| **Drivers** *(new)* | `/api/v1/drivers`, `/api/v1/drivers/:id` | GET/POST/PATCH | Yes | fleet_manager (own fleet) / admin |
| **Vehicles** *(new)* | `/api/v1/vehicles`, `/api/v1/vehicles/:id` | GET/POST/PATCH | Yes | fleet_manager (own fleet) / admin |
| **Assignments** *(new)* | `/api/v1/assignments` | GET/POST/PATCH | Yes | fleet_manager / admin |
| **Tracking** *(new)* | `/api/v1/tracking/ping` | POST | Yes | driver (own only) |
| **Tracking** *(new)* | `/api/v1/tracking/drivers/:id/latest` | GET | Yes | fleet_manager (own fleet), controller+, admin |
| **Tracking** *(new)* | `/api/v1/tracking/drivers/:id/history` | GET | Yes | fleet_manager (own fleet), admin — audit-logged |
| Shipments | `/api/v1/shipments`, `/api/v1/shipments/:id` | GET/POST/PATCH/DELETE | Yes | controller+ / driver (own trip, read + status update only) |
| Shipments | `/api/v1/shipments/import` | POST | Yes | controller+ |
| Route Optimizer | `/api/v1/routes/optimize` | POST | Yes | controller+ |
| Corridors | `/api/v1/corridors`, `/api/v1/corridors/:id` | GET | Yes | any |
| **Highways** *(new)* | `/api/v1/highways/sync` | POST | Yes | admin — triggers OSM/Overpass geometry refresh |
| Disruptions | `/api/v1/disruptions` | GET/POST | Yes | controller+ / driver (create only, `driver_reported`) |
| Disruptions | `/api/v1/webhooks/disruptions` | POST | API key | system |
| Risk | `/api/v1/risk/corridors`, `/api/v1/risk/accidents` | GET | Yes | any |
| Predictions | `/api/v1/predictions` | GET | Yes | any |
| Simulator | `/api/v1/simulator/scenarios`, `/api/v1/simulator/run` | GET/POST | Yes | analyst+ |
| Emergency Alerts | `/api/v1/emergency/alerts` | GET/POST | Yes | dispatcher+ / driver (create only, `driver_sos`) |
| Emergency Alerts | `/api/v1/emergency/alerts/:id/acknowledge` \| `/dispatch` \| `/resolve` | POST | Yes | dispatcher+ |
| **Hospitals** | `/api/v1/hospitals` | GET | Yes | any |
| **Hospitals** | `/api/v1/hospitals/nearby?lat&lng&radius` | GET | Yes | any — used by Command Suite, Fleet Portal, and Driver Portal alike |
| Response Units | `/api/v1/emergency/response-units` | GET/POST/PATCH | Yes | dispatcher+ |
| Analytics | `/api/v1/analytics/*` | GET | Yes | ops_manager+ |
| Reports | `/api/v1/reports`, `/api/v1/reports/:id/export` | GET/POST | Yes | ops_manager+ |
| Copilot | `/api/v1/copilot/message`, `/api/v1/copilot/conversations/:id` | GET/POST | Yes | any |
| Settings | `/api/v1/settings/data-sources` | GET/POST | Yes | admin |
| Settings | `/api/v1/audit-log` | GET | Yes | admin |
| System | `/health`, `/ready` | GET | No | — |

---

*NETRA v1.1 — Prototype / Demonstration Product, build reference. This revision adds the role/portal architecture, fleet management, live device-based location tracking, real highway geometry, and coordinate-based hospital lookup that were missing from v1.0. Dependency versions and third-party data providers (maps, highway geometry source, SMS/email, LLM) should be re-verified at each implementation milestone per Section 16.*
