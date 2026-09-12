<div align="center">

<img src="frontend/public/netra_logo.png" alt="NETRA Logo" width="100"/>

# NETRA — FreightIntel
### National Emergency & Transport Risk Analytics AI Platform

**An enterprise-grade, AI-powered predictive freight intelligence and highway accident prevention platform for India's national logistics corridors.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%207.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-00D632?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-ML%20Engine-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)

</div>

---

## 📌 Overview

**NETRA (National Emergency & Transport Risk Analytics)** is a real-time, AI-driven freight intelligence and safety control platform modeled for India's national highway logistics ecosystem. 

It connects **Freight Operations**, **Commercial Fleet Fleets**, **Drivers**, and **Emergency Trauma Centers** into a single cohesive system powered by an autonomous Python machine learning engine and human-in-the-loop safety oversight.

### 🌟 Core Capabilities

- 🧠 **Integrated Python ML Risk Engine** — 36-dimensional feature extraction evaluating speed variance, curvature, congestion, weather impact, visibility, and historical accident density to output real-time accident probability scores (0–100%).
- 🚑 **Operator-in-the-Loop Hospital Emergency Dispatch** — When high accident risks or SOS beacons are detected, AI agents automatically locate nearby Level-1/2 trauma centers within a configurable radius (5–50 km) and prepare emergency alerts for single-click operator dispatch.
- 🗺️ **Dynamic Highway Route Optimization & Risk Mapping** — Real-time corridor telemetry for NH-44, NH-48, NH-19, and Western DFC with automated rerouting recommendations around high-risk segments.
- 🎛️ **Triple Multi-Role Portals**:
  1. **🏛️ Command Center Portal** — National freight overview, corridor health, live risk heatmaps, scenario simulator, emergency dispatch, and AI Copilot.
  2. **🚛 Fleet Management Portal** — Vehicle telematics, maintenance, driver rosters, trip manifests, and MoRTH compliance tracking.
  3. **👨‍✈️ Driver Cockpit Portal** — Mobile-first mission HUD, live GPS beaconing, one-tap SOS panic button, and trauma hub radar.
- 🎨 **Enterprise Light & Dark Theme** — Clean modern interface with dynamic light/dark mode switcher, glassmorphic HUD overlays, and responsive mobile layouts.

---

## 🗂️ Monorepo Architecture

```
Netra-ai/
├── backend/                       # Node.js + Express 5 + TypeScript Server (Port 5000)
│   ├── postman/                   # Exported Postman collections & environments
│   ├── src/
│   │   ├── config/                # Database & environment variables (Zod validated)
│   │   ├── middleware/            # JWT auth, role guards, validation, error handler
│   │   ├── modules/               # 21 domain modules (auth, corridors, emergency, etc.)
│   │   ├── scripts/               # Database seeder & test-endpoints runner
│   │   ├── services/              # ML Engine bridge, prediction, simulation & cron
│   │   ├── sockets/               # Real-time WebSocket emitter & event handlers
│   │   ├── types/                 # TypeScript typings
│   │   ├── utils/                 # Security, cryptographic utils, geo-spatial math
│   │   ├── app.ts                 # Express application configuration
│   │   ├── routes.ts              # Central API router registry
│   │   └── server.ts              # HTTP & Socket.IO server bootstrap
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # Next.js 15 (App Router) + TypeScript + Tailwind (Port 3000)
│   ├── public/                    # Static assets & netra_logo.png
│   ├── src/
│   │   ├── app/                   # App Router pages ((auth), (command), (driver), (fleet))
│   │   ├── auth/                  # AuthProvider, session store, cookie rotation
│   │   ├── components/            # Emergency modals, live risk maps, sidebars, navbars
│   │   ├── contexts/              # Light/Dark Theme & TanStack Query Provider
│   │   └── lib/                   # API Axios clients, Geolocation, Socket.io client
│   ├── package.json
│   └── tsconfig.json
│
├── netra-ml-engine/               # Core Python Machine Learning Pipeline
│   ├── feature_extractor.py       # 36-factor spatial & temporal feature engineering
│   ├── inference.py               # RiskPredictor engine runtime
│   ├── predict_cli.py             # JSON CLI bridge called seamlessly by backend
│   ├── train.py                   # Model training script
│   ├── test_pipeline.py           # ML test suite
│   ├── netra_ml_engine.pkl        # Serialized trained model
│   └── requirements.txt           # Python dependencies (scikit-learn, numpy, pandas)
│
├── docs/                          # PRD, Architecture & Backend API Reference
├── README.md                      # Platform documentation
└── .gitignore                     # Monorepo ignore rules
```

---

## ⚙️ Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Backend API** | Node.js 20+ / 24, Express 5.2, TypeScript 7 | RESTful microservice handling 74+ endpoints |
| **Real-time Engine** | Socket.IO 4.8.3 | Sub-second telemetry & incident broadcasting |
| **Database** | MongoDB 9.9 via Mongoose | GeoJSON spatial indexing & document storage |
| **ML Engine** | Python 3.10+, Scikit-Learn, Joblib, NumPy | 36-feature accident probability inference |
| **Frontend** | Next.js 15.5 (App Router), React 19, TypeScript | Server & client rendered interactive dashboards |
| **Styling & UI** | Vanilla CSS + Tailwind CSS, Lucide Icons | Responsive enterprise Light & Dark theme |
| **Mapping & GIS** | Leaflet.js, CartoDB & OpenStreetMap Tiles | Real-time corridor telemetry & GPS tracking |
| **State Management**| TanStack Query v5 (React Query) | Cache synchronization & background polling |
| **Security** | Helmet 8, Mongo Sanitize, Rate Limiting, JWT | Secure cookie rotation & RBAC |

---

## 🚀 Step-by-Step Server Setup Guide

Follow these steps to run the entire NETRA platform locally or on your server.

### 📋 Prerequisites

Ensure you have installed:
1. **Node.js**: v20.x or v24.x LTS ([Download](https://nodejs.org/))
2. **Python**: v3.10 or higher ([Download](https://www.python.org/))
3. **MongoDB**: Local MongoDB community instance running on port `27017` or a [MongoDB Atlas](https://cloud.mongodb.com/) cluster URI.
4. **Git**: Installed and configured.

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/akshat-dev018/Netra-AI.git
cd Netra-AI
```

---

### Step 2: Set Up the Python ML Engine

```bash
cd netra-ml-engine

# Create and activate a Python virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# Install required ML libraries
pip install -r requirements.txt

# Run the test pipeline to verify model readiness
python3 test_pipeline.py

# Return to root
cd ..
```

---

### Step 3: Configure and Start the Backend Server

```bash
cd backend

# Create environment configuration
cp .env.example .env
```

Configure your `.env` variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/netra
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
ALLOW_PUBLIC_REGISTER=true

# Security Secrets (Must be 64-character hex strings)
JWT_ACCESS_SECRET=e7b4c91d8f2a5b6c3d4e7f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c
JWT_REFRESH_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0ce7b4c91d8f2a5b6c3d4e7f8
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SAMESITE=lax
```

Install dependencies, seed the database with mock national corridors, hospitals & fleets, and start the development server:

```bash
npm install

# Seed the database with corridors, demo users, hospitals & trucks
npm run seed

# Start the Express & Socket.IO server
npm run dev
```

The backend server is now running at `http://localhost:5000`.  
- **Health Check**: `http://localhost:5000/health`
- **API Base**: `http://localhost:5000/api/v1`

---

### Step 4: Configure and Start the Frontend Application

Open a new terminal window:

```bash
cd frontend

# Create local environment configuration
cp .env.example .env.local
```

Ensure `.env.local` points to your backend:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_COPILOT=true
NEXT_PUBLIC_LOCATION_PING_INTERVAL_SECONDS=45
```

Install dependencies and start Next.js:

```bash
npm install

# Start Next.js App Router in dev mode
npm run dev
```

Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo Accounts & Pre-Seeded Roles

Use any of the pre-seeded demo accounts to test different roles (or use the one-click demo login buttons on the login page):

| Portal / Role | Email | Password | Access Highlights |
|---|---|---|---|
| **Command Center (Admin)** | `admin@netra.local` | `NetraDemo123!` | Full national map, risk matrix, ML predictions, emergency alert dispatch, copilot |
| **Fleet Manager** | `fleet@netra.local` | `NetraDemo123!` | Commercial truck fleet, driver roster, live GPS radar, compliance vault |
| **Commercial Driver** | `driver@netra.local` | `NetraDemo123!` | Mobile mission cockpit, GPS beacon transmitter, SOS panic trigger, nearby trauma hubs |
| **Ops Controller** | `ops@netra.local` | `NetraDemo123!` | Operational dispatch, route approvals, active disruption management |
| **Risk Analyst** | `analyst@netra.local` | `NetraDemo123!` | Incident reports, risk factor decomposition, corridor health charts |

> 💡 **Demo Role Switcher**: When logged in, a top banner enables seamless switching between Command, Fleet, and Driver views without needing to re-login.

---

## 🚑 AI Hospital Alert & Operator Workflow

1. **AI Anomaly & Risk Detection**: The system continuously monitors corridors and vehicles. When risk score $\ge 70\%$ or an emergency SOS is received, an automated alert is generated.
2. **Trauma Center Geosearch**: The backend automatically finds the nearest accredited trauma hospitals (e.g. AIIMS Delhi, Fortis, Apollo) with distance calculations.
3. **Operator Verification Modal**: A confirmation modal is presented to the operator displaying the risk level, corridor details, incident cause, and the nearest hospitals.
4. **Actionable Dispatch**: The operator can adjust the search radius (5–50 km), review hospital contact numbers, and click **"Dispatch Alert to Hospitals"**.
5. **Real-Time Broadcast**: The alert is dispatched to the emergency response units and logged in the emergency operations room with live status updates.

---

## 🧪 Testing & Verification

Run these verification commands to ensure code quality and build integrity:

```bash
# 1. Backend Typecheck
cd backend && npm run typecheck

# 2. Backend Unit Test Suite (Geo utilities & spatial math)
cd backend && npm test

# 3. Python ML Engine Pipeline Tests
cd netra-ml-engine && python3 test_pipeline.py

# 4. Frontend Production Build
cd frontend && npm run build
```

---

## 📡 Key API Endpoints Reference

All endpoints are mounted on `/api/v1`:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate user & receive JWT cookies |
| `GET` | `/corridors` | Real-time national corridors with live risk scores |
| `GET` | `/corridors/:id/risk` | Segment-level risk breakdown for a specific highway |
| `GET` | `/predictions` | ML-driven accident probability forecasts & congestion indices |
| `GET` | `/hospitals/nearby` | Geospatial query for trauma centers near coordinates |
| `POST` | `/emergency/alerts` | Create / broadcast emergency alerts to response units & hospitals |
| `POST` | `/emergency/sos` | Driver emergency SOS panic broadcast |
| `GET` | `/vehicles` | Commercial fleet registry & maintenance telemetry |
| `POST` | `/tracking/ping` | Ingest real-time GPS telemetry from driver devices |
| `POST` | `/copilot/chat` | AI Copilot conversational assistant |

---

## 🚢 Production Deployment

### Backend (Node.js)
```bash
cd backend
npm run build
NODE_ENV=production node dist/server.js
```

### Frontend (Next.js)
```bash
cd frontend
npm run build
npm start
```
*Alternatively, deploy the frontend to [Vercel](https://vercel.com) by setting `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SOCKET_URL` in project settings.*

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.

---

<div align="center">

**NETRA AI — Protecting Every Kilometer, Predicting Every Risk 🇮🇳**

</div>
