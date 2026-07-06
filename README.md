# StudyLog — MERN Study Routine Tracker

Plan a weekly study routine, log study sessions with a live timer, track
planned-vs-actual performance, set goals, count down to exams, and get study
reminders — all backed by MongoDB.

```
study-tracker/
├── frontend/    → React + Vite + Tailwind (port 5173)
├── backend/     → Express + MongoDB   (port 5000)
└── package.json → root scripts (runs both together)
```

## Features
- **Passwordless auth** — sign in with a name + a unique 6-character username. The
  session persists (long-lived JWT in `localStorage`), so you stay logged in.
- **Weekly routine** — an editable subject × day grid of planned hours.
- **Time Log** — a live start/pause timer, plus manual session entry.
- **Analytics** — planned-vs-actual weekly trend, subject-wise hour distribution,
  a study streak, and total hours — all computed from your real data.
- **Goals & Exams** — set a weekly hours target and add exams with a live countdown.
- **Reminders** — real browser notifications (with vibration on phones); scheduled
  reminders fire while the app is open.

## 1. Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## 2. Install everything (from the root folder)
```bash
npm install
```
Uses npm workspaces, so `frontend` and `backend` dependencies install together.

## 3. Configure environment variables
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/study-tracker
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173
```
The frontend defaults to `http://localhost:5000/api`. To override, create
`frontend/.env` with `VITE_API_URL=<your-api-url>`.

## 4. Run both apps together (recommended)
```bash
npm run dev
```
- Frontend → http://localhost:5173
- Backend  → http://localhost:5000/api/health

## 5. Or run them separately
```bash
npm run dev:backend
npm run dev:frontend
```

## API reference
All routes except auth require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST   | `/api/auth/login` | Passwordless find-or-create; returns token + user |
| POST   | `/api/auth/register` | Strict create (409 if username taken) |
| GET    | `/api/auth/me` | Current user |
| PATCH  | `/api/auth/goal` | Set weekly hours goal |
| GET/POST | `/api/subjects` · DELETE `/:id` | Subjects (delete cascades) |
| GET    | `/api/routines` · PUT `/api/routines` | Read grid / upsert one cell |
| GET/POST | `/api/sessions` · DELETE `/:id` | Study sessions |
| GET/POST | `/api/reminders` · PATCH `/:id/toggle` · DELETE `/:id` | Reminders |
| GET/POST | `/api/exams` · DELETE `/:id` | Exams |
| GET    | `/api/analytics/summary` | Dashboard + Analytics data |

## Folder structure

**backend/src/**
- `config/db.js` — MongoDB connection
- `models/` — Mongoose schemas: User, Subject, Routine, Session, Reminder, Exam
- `routes/` — Express routers
- `controllers/` — route logic
- `middleware/auth.js` — JWT guard (`protect`)
- `utils/` — token + formatting helpers
- `app.js` — Express app + route mounting · `server.js` — entry point

**frontend/src/**
- `pages/` — Dashboard, Routine, TimeLog, Analytics, Goals, Reminders, Login
- `components/` — Layout, Modal, Spinner
- `store/` — `AuthContext` (session) and `StudyContext` (data + actions)
- `api/` — axios client (token interceptor) + endpoint functions
- `hooks/useNotifications.js` — permission + reminder scheduler
- `utils/` — date helpers

## Notes
- New users are seeded with 5 default subjects (Mathematics, Physics, Chemistry,
  English, Biology).
- Reminders and browser notifications only fire while a StudyLog tab is open —
  background/offline push (service worker + web-push) is a future enhancement.
