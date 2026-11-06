# CRM Pro — Lead Management System

**Author:** Dhikshith Ram Poshala — B.E. CSE (AIML), St Mary's Engineering College, Hyderabad (2023–2027)
**LinkedIn:** https://www.linkedin.com/in/poshala-dhikshith-ram-a422492b2 · **GitHub:** https://github.com/Rams1586

A full-stack CRM application to manage leads end-to-end — from capture to conversion — with a React frontend, Node.js/Express API, MongoDB, and JWT authentication.

**Tech stack:** React 18, Vite, React Router, Axios, Node.js, Express, MongoDB, Mongoose, JWT, bcrypt

**Features:** JWT admin login, lead CRUD with search / filter / sort, lead pipeline (New → Contacted → Qualified → Converted / Lost), notes and follow-ups per lead, dashboard with pipeline value and source breakdown, seeded demo data.

> **Security note:** set your own `JWT_SECRET` and `SEED_ADMIN_PASSWORD` in `backend/.env` (see `.env.example`). Never deploy with demo credentials.

---

## 📁 Project Structure

```
crm-pro/
├── backend/              Express API (auth, leads CRUD, notes, MongoDB)
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/           Admin, Lead, Note
│   ├── routes/           auth, leads, notes
│   ├── seed.js           demo data script
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/             React + Vite SPA
    ├── src/
    │   ├── api/          Axios client
    │   ├── context/      Auth + Toast providers
    │   ├── components/   Sidebar, LeadModal, NotesPanel, StatusBadge, ProtectedRoute
    │   ├── pages/        Login, Dashboard, Leads, LeadDetail
    │   ├── App.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

---

## ✅ Key Features

- 🔐 **Secure Admin Auth** — JWT login, bcrypt-hashed passwords, token auto-refresh
- 📋 **Lead Listing** — sortable, searchable table with name, email, company, source, status, priority, deal value
- 🔄 **Status Pipeline** — click-to-update stepper: New → Contacted → Qualified → Converted / Lost
- 📝 **Notes & Follow-ups** — per-lead notes with type tags (call, email, meeting, follow-up), pinning, timestamps, and next follow-up date
- 📊 **Dashboard** — stat cards, pipeline value, source breakdown, recent leads
- 🗑️ **Full CRUD** — add, view, edit, delete leads and notes
- 🔍 **Search & Filters** — real-time search + filter by status, source, priority

---

## 🚀 Run Locally in VS Code — Step by Step

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or later | https://nodejs.org |
| MongoDB Community | Latest | https://www.mongodb.com/try/download/community |
| Git | Latest | https://git-scm.com |
| VS Code | Latest | https://code.visualstudio.com |

After installing MongoDB, start it:
- **Windows:** MongoDB starts as a service automatically, or run `mongod`
- **macOS:** `brew services start mongodb-community`
- **Linux:** `sudo systemctl start mongod`

---

### Step 1 — Open in VS Code

```bash
code crm-app
```

---

### Step 2 — Set Up & Start the Backend

Open Terminal 1 in VS Code (`Ctrl+`` ` ```) and run:

```bash
cd backend
npm install
cp .env.example .env
```

The default `.env` is pre-configured for local MongoDB — no changes needed for localhost.

**Seed demo data** (creates admin account + 7 sample leads):
```bash
npm run seed
```
Output:
```
✅  Admin created
   Email:    admin@crm.com
   Password: set via SEED_ADMIN_PASSWORD in backend/.env (see below)
✅  Lead: Priya Sharma (new)
...
🎉  Seed complete!
```

**Start the API server:**
```bash
npm run dev
# → CRM API running on http://localhost:5000
```

---

### Step 3 — Set Up & Start the Frontend

Open Terminal 2 in VS Code and run:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5173
```

---

### Step 4 — Open the App

Open **http://localhost:5173** in your browser.

Log in with:
- **Email:** `admin@crm.com`
- **Password:** the value you set in `SEED_ADMIN_PASSWORD` before running `node seed.js`

---

## 📌 API Reference

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/register` | Create admin account |
| POST | `/api/auth/login` | Login → returns JWT |
| GET  | `/api/auth/me` | Get current admin |
| GET  | `/api/leads` | List leads (search, filter, sort, paginate) |
| GET  | `/api/leads/stats` | Dashboard stats |
| POST | `/api/leads` | Create lead |
| GET  | `/api/leads/:id` | Get lead by ID |
| PUT  | `/api/leads/:id` | Update lead |
| PATCH| `/api/leads/:id/status` | Update lead status |
| DELETE | `/api/leads/:id` | Delete lead + notes |
| GET  | `/api/leads/:id/notes` | List notes for lead |
| POST | `/api/leads/:id/notes` | Add note |
| PATCH| `/api/leads/:id/notes/:nid` | Edit/pin note |
| DELETE | `/api/leads/:id/notes/:nid` | Delete note |

---

## 🌐 Push to GitHub

```bash
cd crm-app
git init
git add .
git commit -m "feat: CRM Pro — lead management system"
git branch -M main
git remote add origin https://github.com/<your-username>/crm-app.git
git push -u origin main
```

> `.env` files are excluded by `.gitignore`. Only `.env.example` files are committed.

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Vite, Axios, react-icons |
| Backend | Node.js, Express, JWT, bcryptjs, express-validator |
| Database | MongoDB (Mongoose) |
| Auth | JWT tokens, bcrypt password hashing, rate limiting |

---

**Demo credentials:** use the seeded admin account (`admin@crm.com` with the password from `SEED_ADMIN_PASSWORD`). Change it after first login in production.