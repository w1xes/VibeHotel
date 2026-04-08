# VibeHotel

Vacation rental booking website for a single resort complex. Guests can browse properties, make reservations, and manage bookings via a personal account. Admins can manage properties and bookings through a dedicated panel.

## Tech Stack

**Frontend** — `frontend/`
- React 19 + Vite 8 + Tailwind CSS 4
- React Router 7, Zustand 5, TanStack Query 5
- React Hook Form + Zod validation
- Supabase Auth (email/password)

**Backend** — `backend/`
- Python 3.13 + FastAPI + SQLAlchemy 2 (async) + asyncpg
- JWT verification via Supabase JWKS (ES256)
- Supabase Storage for property images

**Database / Cloud**
- Supabase PostgreSQL (Transaction pooler)
- Supabase Auth
- Supabase Storage bucket `property-images`
- Row Level Security on all tables

## Project Structure

```
VibeHotel/
├── frontend/
│   ├── src/
│   │   ├── components/     — UI, layout, property, booking, auth
│   │   ├── pages/          — Landing, Catalog, PropertyDetail, Booking,
│   │   │   │                 Account, Auth, About, NotFound
│   │   │   └── admin/      — AdminDashboard, AdminProperties, AdminBookings
│   │   ├── services/       — propertyService, bookingService, authService
│   │   ├── store/          — authStore (Zustand), bookingStore
│   │   ├── lib/            — supabase.js, api.js
│   │   └── router/         — React Router config with ProtectedRoute
│   └── .env                — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
└── backend/
    ├── app/
    │   ├── routers/        — properties, bookings, storage, users
    │   ├── models/         — Profile, Property, PropertyImage, Booking
    │   ├── schemas/        — Pydantic schemas for all models
    │   ├── config.py       — Pydantic Settings
    │   ├── database.py     — Async SQLAlchemy engine
    │   ├── deps.py         — JWT auth dependency
    │   └── main.py         — FastAPI app, CORS, router mounts
    ├── migrations/
    │   ├── 001_schema.sql  — Tables + trigger
    │   ├── 002_rls.sql     — RLS policies + storage policies
    │   └── 003_seed.sql    — 7 sample properties with images
    └── .env                — Supabase credentials + DATABASE_URL
```

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in **SQL Editor** (in order):
   - `backend/migrations/001_schema.sql`
   - `backend/migrations/002_rls.sql`
   - `backend/migrations/003_seed.sql`
3. Create a Storage bucket named **`property-images`** (public)

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Fill in the values (see below)

# Run
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

**`backend/.env` values:**

| Variable | Where to find |
|---|---|
| `SUPABASE_URL` | Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API → service_role |
| `DATABASE_URL` | Dashboard → Settings → Database → Transaction pooler → URI (change scheme to `postgresql+asyncpg`) |
| `FRONTEND_URL` | `http://localhost:5173` |

### 3. Frontend

```bash
cd frontend

npm install

# Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

npm run dev
# → http://localhost:5173
```

## Making a User Admin

Run in **Supabase SQL Editor**, replacing the UUID with the user's `id` from the `profiles` table:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid-here';
```

Then log out and back in for the change to take effect.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/properties` | — | List properties (filters: `type`, `min_capacity`, `max_price`, `search`, `featured`) |
| GET | `/api/properties/{id}` | — | Property detail |
| POST | `/api/properties` | admin | Create property |
| PATCH | `/api/properties/{id}` | admin | Update property |
| DELETE | `/api/properties/{id}` | admin | Delete property |
| POST | `/api/properties/{id}/images` | admin | Upload image |
| DELETE | `/api/properties/{id}/images/{img_id}` | admin | Delete image |
| GET | `/api/bookings/me` | user | My bookings |
| POST | `/api/bookings` | user | Create booking |
| PATCH | `/api/bookings/{id}/cancel` | user | Cancel booking |
| GET | `/api/bookings` | admin | All bookings |
| PATCH | `/api/bookings/{id}/status` | admin | Update booking status |
| GET | `/api/users/me` | user | My profile |
| PATCH | `/api/users/me` | user | Update profile |
| GET | `/api/users` | admin | All users |
| GET | `/api/health` | — | Health check |
