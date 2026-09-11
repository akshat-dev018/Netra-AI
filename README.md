<div align="center">

<img src="netra_logo.png" alt="NETRA Logo" width="80"/>

# NETRA — FreightIntel
### National Emergency & Transport Risk Analytics

**A full-stack, AI-powered freight intelligence control tower for India's highway logistics network.**

[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-00D632?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## 🚀 What is NETRA?

NETRA (National Emergency & Transport Risk Analytics) is a **real-time freight intelligence platform** modeled after India's national highway logistics ecosystem. It provides:

- **Command Center Portal** — National-level freight monitoring for logistics controllers and analysts
- **Fleet Management Portal** — Commercial fleet operations, compliance, and driver management
- **Commercial Driver Portal** — Mobile-first driver mission cockpit with GPS beacon and emergency SOS
- **AI Copilot** — Context-aware risk analysis and route recommendations (integration layer ready)

The system monitors corridor health across India's National Highways (NH-44, NH-48, NH-58, Western DFC), tracks real-time shipment manifests, predicts congestion events, and dispatches emergency response units — all in a single dark glassmorphic interface.

---

## 🗂️ Repository Structure

```
Netra-ai/
├── backend/                  # Express 5 REST API + Socket.io server
│   ├── src/
│   │   ├── modules/          # Feature modules (21 domains)
│   │   │   ├── auth/         # JWT auth with refresh tokens
│   │   │   ├── corridors/    # Highway corridor risk & analytics
│   │   │   ├── shipments/    # Cargo manifest management
│   │   │   ├── tracking/     # Real-time GPS telemetry pings
│   │   │   ├── disruptions/  # Live incident feed
│   │   │   ├── predictions/  # Congestion forecasting engine
│   │   │   ├── simulator/    # Disruption stress-test scenarios
│   │   │   ├── copilot/      # AI Copilot conversation module
│   │   │   ├── analytics/    # Historical metrics & fleet compliance
│   │   │   ├── risk/         # Risk scoring matrix
│   │   │   ├── emergency-alerts/ # SOS panic & incident alerts
│   │   │   ├── hospitals/    # Trauma hub registry
│   │   │   ├── response-units/   # Highway patrol & ambulance fleet
│   │   │   ├── vehicles/     # Commercial truck registry
│   │   │   ├── drivers/      # Driver roster & credentials
│   │   │   ├── assignments/  # Trip allocation
│   │   │   ├── reports/      # Manifest & audit reports
│   │   │   ├── settings/     # Platform configuration
│   │   │   ├── users/        # User provisioning
│   │   │   ├── highways/     # Static highway data
│   │   │   └── audit-log/    # Immutable action audit trail
│   │   ├── services/
│   │   │   ├── riskScoring.service.ts    # Multi-factor corridor risk calculator
│   │   │   ├── prediction.service.ts     # Congestion forecast engine
│   │   │   ├── simulationFeed.service.ts # Synthetic disruption generator
│   │   │   ├── highwayData.service.ts    # External highway data aggregator
│   │   │   ├── cron.service.ts           # Scheduled risk refresh jobs
│   │   │   └── email.service.ts          # Transactional email dispatch
│   │   ├── sockets/          # Socket.io real-time event namespaces
│   │   ├── middleware/       # Auth guards, rate limiting, validation
│   │   └── config/           # DB connection, env validation
│   └── postman/              # API collection for testing
│
├── frontend/                 # Next.js 15 App Router (39 routes)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # Login, register, forgot/reset password
│   │   │   ├── (command)/    # Command Center Portal (14 routes)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── network/
│   │   │   │   ├── corridors/
│   │   │   │   ├── shipments/
│   │   │   │   ├── routes/optimizer/
│   │   │   │   ├── disruptions/
│   │   │   │   ├── simulator/
│   │   │   │   ├── predictions/
│   │   │   │   ├── analytics/
│   │   │   │   ├── copilot/
│   │   │   │   ├── risk/
│   │   │   │   ├── reports/
│   │   │   │   ├── settings/
│   │   │   │   └── emergency/ (alerts, hospitals, response)
│   │   │   ├── (fleet)/      # Fleet Management Portal (6 routes)
│   │   │   │   ├── fleet/
│   │   │   │   ├── fleet/vehicles/
│   │   │   │   ├── fleet/drivers/
│   │   │   │   ├── fleet/assignments/
│   │   │   │   ├── fleet/map/
│   │   │   │   └── fleet/compliance/
│   │   │   └── (driver)/     # Driver Mobile Portal (5 routes)
│   │   │       ├── driver/
│   │   │       ├── location/
│   │   │       ├── sos/
│   │   │       ├── hospitals/
│   │   │       └── profile/
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar, TopBar, DriverTabBar, AlertRibbon
│   │   │   └── dashboard/    # MiniRiskMap, KPI widgets, chart components
│   │   ├── lib/
│   │   │   ├── api/          # Axios API client wrappers for all 21 domains
│   │   │   ├── env.ts        # Environment configuration
│   │   │   └── socket.ts     # Socket.io client
│   │   └── auth/             # AuthProvider, token store, refresh logic
│
├── docs/
│   ├── BACKEND_API.md        # Full REST endpoint documentation
│   └── BACKEND_PLANNING.md   # Architecture decisions & rationale
└── postman/                  # Postman collection for API testing
```

---

## ⚙️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 24.x (Active LTS) |
| Framework | Express 5.2.1 |
| Database | MongoDB 9.9 via Mongoose |
| Auth | JWT (access + refresh) + bcryptjs |
| Real-time | Socket.io 4.8.3 |
| Validation | Zod 4.5.4 |
| Security | Helmet 8, mongo-sanitize, rate-limiting |
| Scheduling | node-cron (corridor risk refresh every 30min) |
| Monitoring | Sentry 10 (`@sentry/node`) |
| Language | TypeScript 7.0.2 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript 7 |
| Styling | Vanilla CSS with dark glassmorphic design system |
| Data Fetching | TanStack Query v5 (React Query) |
| Maps | Leaflet.js with CartoDB dark tiles |
| Charts | Recharts |
| Real-time | Socket.io-client |
| Auth | Custom `AuthProvider` with JWT cookie rotation |
| UI | Lucide React icons, react-hot-toast |
| Font | Inter (Google Fonts) |

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js 24.x** (Active LTS) — [nodejs.org](https://nodejs.org/)
- **MongoDB** — Local instance or [MongoDB Atlas](https://cloud.mongodb.com/) free tier
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/akshat-dev018/Netra-AI.git
cd Netra-AI
```

---

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/netra

# JWT (must be different, each ≥32 chars)
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption (64 hex chars = 32 bytes)
ENCRYPTION_KEY=your_64_hex_chars_here

# Server
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Cookie
COOKIE_SAMESITE=lax
COOKIE_SECURE=false

# Optional: Sentry DSN for error monitoring
SENTRY_DSN=

# Optional: SMTP for email verification
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

```bash
npm install
npm run seed       # Seeds demo users, corridors, hospitals, trucks
npm run dev        # Starts backend on http://localhost:5001
```

**Health check:** `GET http://localhost:5001/health`  
**API base:** `http://localhost:5001/api/v1`

#### Demo Accounts (seeded)
| Role | Email | Password |
|---|---|---|
| Admin / Command Center | `admin@netra.local` | `NetraDemo123!` |
| Fleet Manager | `fleet@netra.local` | `NetraDemo123!` |
| Driver | `driver@netra.local` | `NetraDemo123!` |
| Ops Controller | `ops@netra.local` | `NetraDemo123!` |
| Analyst | `analyst@netra.local` | `NetraDemo123!` |
| Viewer | `viewer@netra.local` | `NetraDemo123!` |

---

### 3. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local   # or create manually
```

`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

```bash
npm install
npm run dev        # Starts frontend on http://localhost:3000
```

Open **[http://localhost:3000](http://localhost:3000)** — you'll see the login page with 1-click demo buttons.

---

### 4. Role-Based Quick Login

The app includes a **Demo Role Switcher bar** pinned at the top of every screen (visible when logged in) that lets you instantly switch between all 3 portals without re-authenticating:

| Portal | Role | Key Features |
|---|---|---|
| 🏛️ Command Center | `admin` / `ops` | National freight map, corridor risk matrix, AI copilot, emergency dispatch |
| 🚛 Fleet Manager | `fleet_manager` | Truck registry, driver compliance, live fleet map, HOS tracking |
| 👨‍✈️ Driver Terminal | `driver` | Mission cockpit, GPS beacon, SOS panic, trauma hub locator |

---

## 🌐 API Endpoints

All endpoints are prefixed with `/api/v1/`. Full documentation: [`docs/BACKEND_API.md`](docs/BACKEND_API.md)

### Authentication
| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Register new organization account |
| POST | `/auth/login` | Email/password login, returns JWT access + refresh cookie |
| POST | `/auth/refresh` | Rotate access token via refresh cookie |
| POST | `/auth/logout` | Clear refresh cookie |
| POST | `/auth/forgot-password` | Request password reset link |
| POST | `/auth/reset-password` | Consume reset token |

### Core Freight Operations
| Method | Route | Description |
|---|---|---|
| GET/POST | `/corridors` | Corridor list with live risk scores |
| GET | `/corridors/:id/analytics` | Segment-level speed timelines & incidents |
| GET/POST | `/shipments` | Cargo manifest CRUD |
| GET | `/shipments/:id/track` | Live consignment telemetry |
| POST | `/tracking/ping` | GPS telemetry ingestion from driver device |
| GET/POST | `/disruptions` | Live incident feed |
| GET | `/predictions` | 24-48h corridor congestion forecasts |
| POST | `/simulator/run` | Stress-test disruption scenario |
| GET | `/risk/matrix` | Multi-corridor risk scoring matrix |

### Fleet & Driver Management
| Method | Route | Description |
|---|---|---|
| GET/POST | `/vehicles` | Commercial truck registry |
| GET/POST | `/drivers` | Driver roster & credentials |
| GET/POST | `/assignments` | Trip allocation |
| GET | `/analytics/fleet/compliance` | HOS, safety scores, audit report |

### Emergency Response
| Method | Route | Description |
|---|---|---|
| GET/POST | `/emergency-alerts` | SOS panic broadcasts & incident alerts |
| GET/POST | `/hospitals` | Trauma center registry with geocoords |
| GET/POST | `/response-units` | Highway patrol & ambulance dispatch |

### AI Copilot
| Method | Route | Description |
|---|---|---|
| POST | `/copilot/chat` | Send message to AI copilot, streaming response |
| GET | `/copilot/history` | Conversation history |

### Analytics & Reports
| Method | Route | Description |
|---|---|---|
| GET | `/analytics/dashboard` | KPI aggregates for Command Center |
| GET | `/analytics/corridors/:id` | Corridor-specific throughput metrics |
| GET | `/reports` | Manifest & operational reports |
| GET | `/audit-log` | Immutable admin action log |

---

## 🔌 Real-Time Events (Socket.io)

The backend broadcasts on two namespaces:

### `/` (Default Namespace)
| Event | Direction | Payload |
|---|---|---|
| `corridor:risk_update` | Server → Client | `{ corridorId, riskScore, segments }` |
| `disruption:new` | Server → Client | Incident object |
| `shipment:status_change` | Server → Client | `{ shipmentId, status, location }` |
| `emergency:alert` | Server → Client | Emergency alert object |

### `/tracking` Namespace
| Event | Direction | Payload |
|---|---|---|
| `gps:ping` | Client → Server | `{ lat, lng, speed, heading, tripId }` |
| `gps:broadcast` | Server → Client | Live vehicle location (all subscribers) |

The frontend connects in [`src/lib/socket.ts`](frontend/src/lib/socket.ts) and subscribes from layout components to update the `AlertRibbon` and live map overlays.

---

## 🤖 AI Integration — Current State & Remaining Work

### ✅ Currently Integrated

| Feature | Status | Implementation |
|---|---|---|
| **AI Copilot API endpoint** | ✅ Backend module built | `POST /api/v1/copilot/chat` accepts messages, returns response |
| **Copilot frontend UI** | ✅ Chat streaming interface | `/copilot` page with context hub glass panel |
| **Risk Scoring Engine** | ✅ Production-grade | `riskScoring.service.ts` — Multi-factor (weather, incidents, speed deviation, congestion index) |
| **Congestion Prediction** | ✅ Rule-based engine | `prediction.service.ts` — 24-48h forecast using corridor historical patterns |
| **Simulation Engine** | ✅ Synthetic disruption vectors | `simulationFeed.service.ts` — Stress-tests corridors with configurable parameters |

---

### 🔧 AI Integration — Remaining Work

#### 1. LLM Backend for Copilot (`/api/v1/copilot/chat`)

The copilot module scaffolding is complete with chat history persistence. The **LLM provider connection is pending**. To complete this:

```
backend/src/modules/copilot/copilot.controller.ts
```

**What's needed:**
- Connect to an LLM API (OpenAI GPT-4o, Google Gemini, or Anthropic Claude)
- Inject freight context into system prompt: active corridor risk scores, live disruptions, shipment manifests
- Stream `text/event-stream` SSE response back to frontend

**Example system prompt template to implement:**
```typescript
const systemPrompt = `
You are FreightIntel Copilot, an AI assistant for NETRA — India's national freight intelligence platform.

Current Operational Context:
- Active Corridors: ${corridorCount} highways monitored
- Live Disruptions: ${activeDisruptions.length} incidents
- High-Risk Zones: ${highRiskCorridors.map(c => c.name).join(', ')}
- Fleet Status: ${inTransitCount} vehicles in transit

Answer logistics risk, route, and freight questions concisely.
`;
```

**Environment variable to add:**
```env
OPENAI_API_KEY=sk-...
# OR
GEMINI_API_KEY=...
# OR
ANTHROPIC_API_KEY=sk-ant-...
```

---

#### 2. ML-Based Congestion Prediction (`prediction.service.ts`)

Current prediction uses **rule-based heuristics** (hour-of-day, day-of-week, known toll bottleneck patterns). To upgrade to ML:

**What's needed:**
- Train a time-series model (LSTM / Prophet / XGBoost) on historical corridor speed data
- Expose as a Python FastAPI microservice on port `5002`
- Backend calls `http://localhost:5002/predict` with corridor telemetry history
- Or use a managed ML API (AWS SageMaker, Google Vertex AI, Azure ML)

**Endpoint contract to implement:**
```
POST http://localhost:5002/predict
Body: { corridorId: string, history: [{ timestamp, avgSpeed, vehicleCount }] }
Response: { congestionProbability: number, peakHour: string, severity: 'low'|'medium'|'high' }
```

---

#### 3. Automated Risk Intelligence Feed (`riskScoring.service.ts`)

Current risk scoring uses **internal MongoDB data only**. To add external intelligence:

**What's needed:**
- **Weather API**: Integrate IMD (Indian Meteorological Department) or OpenWeatherMap for rainfall, fog, flood alerts affecting highway segments
- **News Feed NLP**: Scrape NHAI press releases + scan for road closure keywords → feed into disruption module
- **Satellite Traffic**: ISRO Bhuvan or Google Maps Routes API for real-time jam factor

**Environment variables to add:**
```env
OPENWEATHER_API_KEY=
IMD_API_TOKEN=
GOOGLE_MAPS_API_KEY=
```

---

#### 4. Driver Fatigue Detection (HOS + Behavioral)

Currently, Hours-of-Service (HOS) is rule-based (9-hour limit). To add ML fatigue scoring:

**What's needed:**
- Ingest GPS telemetry patterns: erratic speed changes, lane deviation proxies (sharp heading changes)
- Calculate a **fatigue index** score from behavioral telemetry
- Push alerts via Socket.io when fatigue index exceeds threshold

---

#### 5. Document Intelligence for Cargo Manifests

Planned but not yet built:

**What's needed:**
- Driver uploads E-Way Bill / customs form as PDF or image
- OCR + LLM extracts: cargo type, weight, shipper, consignee, validity date
- Auto-populates shipment record in `/api/v1/shipments`
- Use: Google Document AI, AWS Textract, or open-source `surya` OCR

---

## 🖥️ Frontend Screens

### Command Center (National Logistics Operations)
| Screen | Screenshot Ref | Key Glass Panel |
|---|---|---|
| **Dashboard** | Screenshot 1 | AI Recommendations & Contingency Dispatch |
| **Network Intelligence Map** | Screenshot 2 | Incident & Bottleneck Feed |
| **Corridor Intelligence** | Screenshot 3 | Risk Decomposition & Segment Metrics |
| **Shipment Intelligence** | Screenshot 4 | Active Consignment Telematics |
| **Route Optimizer** | Screenshot 5 | Route Comparison & Dispatch Approval |
| **Disruptions Feed** | — | IoT Sensor Ingestion Gateway |
| **Scenario Simulator** | — | Synthesized Contingency Vectors |
| **Congestion Predictions** | — | ML Model Accuracy & Drift |
| **Analytics** | — | Risk Factor Decomposition |
| **AI Copilot** | — | Copilot Context Hub |
| **Emergency Alerts** | — | Standby Response Units Console |
| **Hospital Registry** | — | Trauma Hub Geocoords |
| **Response Fleet** | — | Tactical Dispatch Console |
| **Settings** | — | API Key Mgmt, Audit Logs |

### Fleet Management Portal
| Screen | Description |
|---|---|
| **Fleet Overview** | Utilization, fuel index, vehicle status donut |
| **Truck Registry** | TPMS, maintenance, registration details |
| **Driver Roster** | License verification, safety scores |
| **Trip Assignments** | Haul allocation linking trucks, drivers, cargo |
| **Live Fleet Map** | Dark Carto GPS radar + right glass telematic inspector |
| **Compliance & Audit** | HOS fatigue, MoRTH statutory vault |

### Driver Mobile Portal
| Screen | Description |
|---|---|
| **Mission Cockpit** | Active journey timeline, pre-trip checklist |
| **GPS Beacon** | Telemetry transmitter, corridor waypoints |
| **SOS Panic** | One-touch emergency broadcast, helpline dials |
| **Trauma Hubs** | Nearby Level 1 & 2 hospitals, one-tap calling |
| **Profile & Credentials** | Digital driver badge, HOS remaining |

---

## 🔐 Security

- JWT access tokens (15min expiry) + HTTP-only refresh cookies (7 days)
- `bcryptjs` password hashing (rounds: 12)
- Helmet.js HTTP security headers
- `@exortek/express-mongo-sanitize` — NoSQL injection prevention (Express 5 compatible)
- Zod schema validation on all request bodies
- Role-based access control (RBAC) on all protected routes
- Immutable audit log for all admin and mutation actions
- Rate limiting on auth endpoints (100 req/15min per IP)

---

## 🧪 Testing & Validation

```bash
# Type safety check (frontend)
cd frontend && npm run typecheck    # Must exit with code 0

# Type safety check (backend)
cd backend && npm run typecheck     # Must exit with code 0

# Production build verification
cd frontend && npm run build        # 39 routes compiled

# Security audit
cd backend && npm audit --audit-level=high

# API integration testing
# Import postman/Netra-AI.postman_collection.json into Postman
```

---

## 📦 Deployment Notes

### Backend (Production)
```bash
cd backend
npm run build
npm start
```
Environment: set `NODE_ENV=production`, `COOKIE_SECURE=true`, `CORS_ORIGIN=https://your-domain.com`

### Frontend (Production)
```bash
cd frontend
npm run build
npm start
```
Or deploy to **Vercel** (recommended for Next.js):
```bash
vercel --prod
```
Set env vars in Vercel dashboard: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/ai-copilot-llm`
3. Commit your changes: `git commit -m 'feat: connect OpenAI GPT-4o to copilot endpoint'`
4. Push to branch: `git push origin feature/ai-copilot-llm`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

Built for India's ₹22 trillion freight logistics ecosystem 🇮🇳

**NETRA — See Every Risk Before It Moves.**

</div>
