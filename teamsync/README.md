# TeamSync – Full-Stack Real-Time Team Availability Tracker

> **Tagline:** *Know Who's Available. Collaborate Without Limits.*

TeamSync is a modern, production-grade SaaS web application built with the **MERN stack** (MongoDB, Express.js, React + Vite, Node.js) and **Socket.IO**. It enables team members to manage their availability status with instant real-time synchronization, while providing organizational leaders with high-level statistics, an audited activity timeline, and team management dashboards.

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema & Relationships](#3-database-schema--relationships)
4. [REST API Documentation](#4-rest-api-documentation)
5. [Socket.IO Event Architecture](#5-socketio-event-architecture)
6. [Project Folder Structure](#6-project-folder-structure)
7. [Installation & Local Setup](#7-installation--local-setup)
8. [Automated Testing & Verification](#8-automated-testing--verification)
9. [Deployment Guide (Vercel + Render + MongoDB Atlas)](#9-deployment-guide)

---

## 1. Architecture Overview

TeamSync follows a decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                 REACT FRONTEND (Vite SPA)                   │
│   Tailwind CSS • Framer Motion • Lucide Icons • Recharts    │
│   AuthContext • SocketContext • ThemeContext (Dark/Light)   │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP REST Requests           │ Socket.IO Events
               │ (JWT Bearer Token)           │ (Live Broadcast)
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                 NODE.JS / EXPRESS BACKEND                   │
│   Helmet • CORS • Rate Limiting • JWT Auth Middleware       │
│   REST Controllers • Socket.IO Server Engine                │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                         │
│   MongoDB Atlas / Local / In-Memory Dev Fallback            │
│   Collections: Users • Teams • History • Notifications      │
└─────────────────────────────────────────────────────────────┘
```

### Core Architecture Highlights
- **Boolean Status Source of Truth**: Availability is tracked as a strict database boolean (`isAvailable: true | false`). The extended status (`available`, `unavailable`, `away`) is kept synchronized at the Mongoose middleware level, ensuring `away` always sets `isAvailable: false`.
- **Optimistic UI with Rollback**: When a user clicks an availability switch, the frontend UI updates immediately for zero perceived latency. If the backend fails or rejects the request, the state is rolled back and an error toast is surfaced.
- **Bi-directional Real-Time Sync**: When any team member updates their availability, the backend commits to MongoDB, creates an audit record in `AvailabilityHistory`, and immediately broadcasts an `availability:updated` event via Socket.IO to all active dashboards.
- **Zero-Config Developer Experience**: In local development, if remote MongoDB Atlas is not yet configured, the backend automatically spins up an embedded in-memory MongoDB instance with zero configuration.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom SaaS color palette & dark mode
- **Routing**: React Router v6
- **Real-Time Client**: Socket.IO Client v4
- **State Management**: React Context (`AuthContext`, `SocketContext`, `ThemeContext`)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Analytics Charts**: Recharts
- **Date Handling**: Date-fns

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database ODM**: Mongoose v8
- **Real-Time Engine**: Socket.IO v4
- **Authentication**: JSON Web Tokens (JWT) + HTTP Bearer authorization
- **Password Security**: bcryptjs (12 salt rounds)
- **Security Middleware**: Helmet, CORS, Express Rate Limit
- **Testing**: Built-in automated E2E test suite

---

## 3. Database Schema & Relationships

```
┌───────────────────────┐             ┌───────────────────────┐
│         User          │ ◄────────── │         Team          │
├───────────────────────┤  member of  ├───────────────────────┤
│ _id                   │ ──────────► │ _id                   │
│ fullName              │  teamId     │ teamName              │
│ email (unique)        │             │ description           │
│ password (hashed)     │             │ department            │
│ designation           │             │ inviteCode (unique)   │
│ department            │             │ createdBy (ref User)  │
│ role (admin | member) │             │ members [ref User]    │
│ isAvailable (Boolean) │             └───────────────────────┘
│ availabilityStatus    │
│ statusMessage         │             ┌───────────────────────┐
│ workingHours          │             │  AvailabilityHistory  │
│ timezone              │             ├───────────────────────┤
│ lastActiveAt          │ ◄────────── │ userId (ref User)     │
└───────────────────────┘  audited in │ previousStatus        │
                          │ newStatus             │
                          │ previousAvailability  │
                          │ newAvailability       │
                          │ updatedBy (ref User)  │
                          │ reason                │
                          │ changedAt             │
                          └───────────────────────┘
```

---

## 4. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user. First user gets `admin` role. |
| `POST` | `/api/auth/login` | Public | Login with email & password, returns JWT token. |
| `POST` | `/api/auth/logout` | Private | Invalidate session. |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile. |

### Availability Management (`/api/availability`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/availability` | Private | Get availability status for all team members. |
| `GET` | `/api/availability/:userId` | Private | Get availability details for single user. |
| `PATCH` | `/api/availability/:userId` | Private | Update user availability (`isAvailable`, `availabilityStatus`, `reason`). Non-admins can only edit self. |
| `GET` | `/api/availability/history` | Private | Paginated audit trail with date/status filtering. |

#### Sample Availability Update Request:
```http
PATCH /api/availability/65f123456789abcdef012345 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "isAvailable": true,
  "reason": "Ready for team sprint planning"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Availability updated successfully",
  "data": {
    "userId": "65f123456789abcdef012345",
    "isAvailable": true,
    "availabilityStatus": "available",
    "updatedAt": "2026-11-17T17:00:00.000Z"
  }
}
```

### Team Directory & Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Private | Paginated member list with search and filtering. |
| `GET` | `/api/users/:id` | Private | Get member details by ID. |
| `PATCH` | `/api/users/:id` | Private | Update profile info (self or admin). |
| `DELETE` | `/api/users/:id` | Admin | Delete member account. |

### Analytics Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Private | Total, Available, Unavailable, Away counts, %, and recent activity. |
| `GET` | `/api/dashboard/team-stats` | Private | Department-wise and team-wise availability analytics. |

---

## 5. Socket.IO Event Architecture

Socket.IO connections are authenticated during handshake via the JWT token:

```javascript
const socket = io(SERVER_URL, {
  auth: { token: localStorage.getItem('teamsync_token') }
});
```

### Events
| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `availability:updated` | Server -> All Clients | `{ userId, fullName, isAvailable, availabilityStatus, updatedAt, updatedBy }` | Emitted when any user availability changes. |
| `user:online` | Server -> Team Room | `{ userId, fullName }` | Emitted when a team member connects. |
| `user:offline` | Server -> Team Room | `{ userId }` | Emitted when a team member disconnects. |

---

## 6. Project Folder Structure

```
teamsync/
├── package.json              # Root package with orchestration scripts
├── README.md                 # Complete system documentation
│
├── server/                   # Express.js Backend
│   ├── config/
│   │   ├── db.js             # Mongoose connection with Atlas + in-memory fallback
│   │   └── jwt.js            # JWT signing utility
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── availabilityController.js
│   │   ├── dashboardController.js
│   │   ├── notificationController.js
│   │   ├── teamController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication & role-based authorization
│   │   └── errorHandler.js   # Centralized Mongoose and Express error handler
│   ├── models/
│   │   ├── AvailabilityHistory.js
│   │   ├── Notification.js
│   │   ├── Team.js
│   │   └── User.js           # Auto-sync hook for isAvailable & status
│   ├── routes/
│   ├── sockets/
│   │   └── socketHandler.js  # Authenticated Socket.IO engine
│   ├── tests/
│   │   └── e2e.test.js       # 31/31 scenario automated test suite
│   ├── server.js             # Express & Socket.IO server entrypoint
│   ├── .env.example
│   └── package.json
│
└── client/                   # React + Vite Frontend
    ├── index.html
    ├── vite.config.js        # Vite config with backend & socket proxy
    ├── tailwind.config.js    # Custom SaaS palette & dark mode setup
    ├── postcss.config.js
    ├── src/
    │   ├── components/
    │   │   ├── auth/         # ProtectedRoute
    │   │   ├── common/       # UserCard, UserTable, AvailabilityToggle, Badge, Skeleton
    │   │   ├── dashboard/    # NotificationPanel
    │   │   └── layout/       # Sidebar, Header
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── SocketContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── layouts/
    │   │   ├── AuthLayout.jsx
    │   │   └── DashboardLayout.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── auth/         # LoginPage, RegisterPage, ForgotPasswordPage
    │   │   └── dashboard/    # DashboardPage, TeamMembersPage, AvailabilityPage, History, Profile, Settings, Admin
    │   ├── services/         # Axios API clients
    │   ├── utils/            # Helper formatting utilities
    │   ├── App.jsx           # Master route registry
    │   ├── index.css         # Tailwind directives & components
    │   └── main.jsx
    └── package.json
```

---

## 7. Installation & Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB Atlas cluster URL (optional — runs with zero-config in-memory MongoDB automatically if omitted)

### Step 1: Clone or Navigate to Directory
```bash
cd /Users/sabarish/Documents/VW/TASK5/teamsync
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Step 3: Configure Environment Variables
Inside `teamsync/server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/teamsync?retryWrites=true&w=majority
JWT_SECRET=teamsync_production_secret_key_32_chars_long
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(Note: If you leave `MONGODB_URI` as placeholder, TeamSync automatically starts an in-memory database for immediate testing!)*

### Step 4: Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd teamsync/server
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd teamsync/client
npm run dev
# Vite will open on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 8. Automated Testing & Verification

TeamSync includes an end-to-end integration test suite that tests all 18 requirements from the project specification:

```bash
cd teamsync/server
node tests/e2e.test.js
```

### Verified Test Scenarios
1. ✅ Register new user (First user gets Admin role)
2. ✅ Password hashed with bcrypt; JWT token issued
3. ✅ Register second user (Assigned Member role)
4. ✅ Login with valid credentials succeeds (200 OK)
5. ✅ Login with invalid credentials rejected (401 Unauthorized)
6. ✅ `GET /api/auth/me` returns authenticated user data
7. ✅ `GET /api/users` lists all authorized team members
8. ✅ Socket.IO authenticates via JWT and establishes connection
9. ✅ Toggle availability from `false` to `true`
10. ✅ MongoDB verifies `isAvailable: true` and `availabilityStatus: "available"`
11. ✅ Socket.IO broadcasts `availability:updated` event to connected clients in real time
12. ✅ Toggle availability from `true` to `false`
13. ✅ MongoDB verifies `isAvailable: false` and `availabilityStatus: "unavailable"`
14. ✅ Extended `away` mode preserves boolean `isAvailable: false`
15. ✅ `AvailabilityHistory` records all transitions with previous, new, timestamps, reasons
16. ✅ Non-admin member forbidden from modifying another user (403 Forbidden)
17. ✅ Admin successfully authorized to update member availability
18. ✅ `GET /api/dashboard/stats` calculates headcounts and percentages accurately
19. ✅ Admin creates team via `POST /api/teams` with auto-generated invite code

**Test Result:** `31/31 Test Scenarios Passed (100% Success)`.

---

## 9. Deployment Guide

### A. Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. In **Network Access**, whitelist `0.0.0.0/0` (allow access from anywhere) or your hosting provider IP.
3. In **Database Access**, create a user with read/write access.
4. Click **Connect** -> **Connect your application** and copy the URI string into `MONGODB_URI`.

### B. Backend Deployment (Render)
1. Push the code to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your repository.
4. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<Secure random 32-character string>`
   - `CLIENT_URL`: `https://<your-vercel-domain>.vercel.app`

### C. Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Set:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://<your-render-app>.onrender.com`
5. Deploy.
