# Banquet Manager (CraftCater / BanquetPro)

A full-stack banquet and catering management platform for handling event enquiries, bookings, menu planning, guest flow, payments, and team collaboration.

## Project Structure

- `/frontend` — React + Vite + Tailwind UI
- `/backend` — Node.js + Express + MongoDB API
- `/fastapi` — FastAPI ML microservice for menu recommendations

## Core Features

- Role-based authentication and protected routes (`ADMIN`, `SALES`, `FINANCE`, `GRE`, `USER`)
- Event lifecycle management:
  `TEMPORARY_ENQUIRY → ENQUIRY_CONFIRMED → DEPOSIT_RECEIVED → BOOKED → IN_PROGRESS → COMPLETED`
- Venue conflict detection before event creation
- Menu catalogue + tier-based menu selection (`Standard`, `Premium`, `Elite`)
- Real-time collaborative menu editing using **Yjs + WebSocket**
- ML menu recommendations from the FastAPI service
- Installment-based Stripe payment flow with booking confirmation
- Guest check-in support (QR + arrival updates)
- Event gallery upload/moderation via Cloudinary
- WhatsApp QR/message delivery integration

## Tech Stack

### Frontend
- React 19
- Vite 8
- Tailwind CSS 4
- Zustand
- React Router
- Axios

### Backend
- Node.js (ESM)
- Express 5
- MongoDB + Mongoose
- JWT auth + cookies
- Redis (optional)
- Stripe
- Cloudinary
- WebSocket server (Yjs sync)

### ML Service
- FastAPI
- scikit-learn (Logistic Regression pipeline)
- pandas + joblib

## Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+
- MongoDB instance

## Environment Variables

Create `/backend/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLIENT_URL=http://localhost:5173

# Optional but used by features below
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_xxx
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
VONAGE_API_KEY=xxx
VONAGE_API_SECRET=xxx
SANDBOX_NUMBER=whatsapp_number
```

Create `/frontend/.env` with:

```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_COLLAB_WS=ws://localhost:4000/collab
```

## Installation

### 1) Install frontend dependencies

```bash
cd /home/runner/work/Banquet-Manager/Banquet-Manager/frontend
npm install
```

### 2) Install backend dependencies

```bash
cd /home/runner/work/Banquet-Manager/Banquet-Manager/backend
npm install
```

### 3) Install FastAPI dependencies

```bash
cd /home/runner/work/Banquet-Manager/Banquet-Manager/fastapi
pip install fastapi uvicorn scikit-learn pandas joblib
```

## Running the Application

Open 4 terminals:

### Terminal A — Backend API (port 5000)

```bash
cd /home/runner/work/Banquet-Manager/Banquet-Manager/backend
npm run dev
```

### Terminal B — Collaboration WebSocket server (port 4000)

```bash
cd /home/runner/work/Banquet-Manager/Banquet-Manager/backend
node ws-server.js
```

### Terminal C — ML recommendation service (port 8000)

```bash
cd /home/runner/work/Banquet-Manager/Banquet-Manager/fastapi
uvicorn ml_api:app --reload --host 0.0.0.0 --port 8000
```

### Terminal D — Frontend app (port 5173)

```bash
cd /home/runner/work/Banquet-Manager/Banquet-Manager/frontend
npm run dev
```

Then open: `http://localhost:5173`

## Main API Route Groups

- `/api/auth` — login/register/profile/token refresh
- `/api/events` — conflict check, create, list, detail, confirm enquiry
- `/api/menu` — menu catalogue + event menu operations
- `/api/payments` — payment initialization, Stripe checkout session, success callback
- `/api/guests` — event guest list and arrival marking
- `/api/venues` — venue CRUD
- `/api/gallery` — gallery upload/moderation
- `/api/qr` — QR generation/decryption
- `/api/whatsapp` — WhatsApp messaging

## Notes

- The repository is under active development; some dashboards/endpoints are placeholders.
- Keep backend, websocket server, and FastAPI service running together for full feature support.
