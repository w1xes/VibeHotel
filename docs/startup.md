# Startup Guide

Complete step-by-step instructions to get VibeHotel running locally from scratch.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | [python.org](https://python.org) |
| Supabase account | — | [app.supabase.com](https://app.supabase.com) — free tier is enough |

---

## 1. Supabase Project Setup

### 1a. Create a project

1. Go to [app.supabase.com](https://app.supabase.com) → **New project**.
2. Note the **Project URL** and **API keys** (you'll need them in steps 3 and 4).

### 1b. Run migrations

Open the **SQL Editor** in your Supabase dashboard and run each file in order:

1. `backend/migrations/001_schema.sql` — creates all tables and triggers
2. `backend/migrations/002_rls.sql` — enables RLS and creates policies
3. `backend/migrations/003_seed.sql` _(optional)_ — inserts 7 sample properties

> Run each file separately. Do **not** combine them into a single query.

### 1c. Create the Storage bucket

1. Go to **Storage** → **New bucket**.
2. Name: `property-images`
3. Enable **Public bucket** (so images can be displayed without auth).
4. Leave default file size limit or set to `5 MB`.

---

## 2. Backend Setup

```bash
cd backend
```

### 2a. Create and activate a virtual environment

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**
```bash
python -m venv .venv
source .venv/bin/activate
```

### 2b. Install dependencies

```bash
pip install -r requirements.txt
```

### 2c. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=<anon key from Project Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from Project Settings → API>
FRONTEND_URL=http://localhost:5173
```

**Where to find each value:**

| Variable | Location in Supabase Dashboard |
|----------|-------------------------------|
| `DATABASE_URL` | Project Settings → Database → **Transaction pooler** connection string. Change driver to `postgresql+asyncpg://` and port to `6543`. |
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key (keep secret!) |

> **Important:** Use the **Transaction pooler** URL (port **6543**), not the direct connection (port 5432). The direct host is blocked in many environments.

### 2d. Start the backend

```bash
uvicorn app.main:app --reload --port 8000
```

Verify it's running: [http://localhost:8000/api/health](http://localhost:8000/api/health) should return `{"status":"ok"}`.

Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. Frontend Setup

```bash
cd frontend
```

### 3a. Install dependencies

```bash
npm install
```

### 3b. Configure environment variables

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_API_URL=http://localhost:8000/api
```

> Use the same `SUPABASE_URL` and `SUPABASE_ANON_KEY` values as in the backend. The `VITE_` prefix is required for Vite to expose them to the browser.

### 3c. Start the dev server

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## 4. Making a User an Admin

By default, all new sign-ups receive the `user` role. To grant admin access:

1. Sign up through the app at `/login` to create an account.
2. In the Supabase dashboard, go to **SQL Editor** and run:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = '<your-user-uuid>';
```

To find your user UUID:
- Go to **Authentication → Users** in the Supabase dashboard, or
- Call `GET /api/users/me` with your auth token.

3. Sign out and back in — the frontend will fetch the updated profile with the `admin` role.

---

## 5. Running Both Servers Together

You need two terminals running simultaneously:

**Terminal 1 — Backend:**
```bash
cd backend
.venv\Scripts\activate      # or: source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Common Errors

### `FATAL: Tenant or user not found`

The `DATABASE_URL` is missing SSL. Make sure your URL uses the **Transaction pooler** (port **6543**) — SSL is enabled by default on that endpoint, and the backend adds `ssl=require` automatically.

### `DuplicatePreparedStatementError`

This occurs when connecting via PgBouncer (transaction mode) without disabling prepared statements. The backend already sets `statement_cache_size=0` — if you see this error, verify you are copying `database.py` exactly as committed.

### `401 Invalid token: The specified alg value is not allowed`

The JWT library doesn't support ES256. Ensure `PyJWT[cryptography]` is installed (not `python-jose`). Run:
```bash
pip install "PyJWT[cryptography]"
```

### `401 Invalid token: Signature verification failed`

Token is from a different Supabase project than the one in `SUPABASE_URL`. Check that the frontend and backend `.env` files point to the **same** Supabase project.

### `403 Admin access required`

Your account doesn't have the `admin` role. Follow step 4 above.

### `CORS error` in browser

The `FRONTEND_URL` in `backend/.env` doesn't match the origin the frontend is running on. The default is `http://localhost:5173`. Update if you're running on a different port.

### Images not loading after upload

- Verify the `property-images` bucket exists and **is set to public**.
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly in `backend/.env`.
- Check the Supabase Storage tab to see if the file was actually uploaded.

---

## Production Build

```bash
# Frontend
cd frontend
npm run build       # outputs to frontend/dist/

# Backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

For production, set `FRONTEND_URL` in the backend `.env` to your actual deployed frontend URL.
