# Backend Documentation

The backend is a **FastAPI** application with async SQLAlchemy, Supabase Auth integration, and Supabase Storage for file uploads.

---

## Technology Stack

| Dependency | Version | Purpose |
|------------|---------|---------|
| `fastapi` | latest | HTTP framework |
| `uvicorn[standard]` | latest | ASGI server |
| `sqlalchemy[asyncio]` | latest | ORM (async) |
| `asyncpg` | latest | PostgreSQL async driver |
| `pydantic-settings` | latest | Configuration from `.env` |
| `PyJWT[cryptography]` | ≥2.12 | JWT verification (ES256/RS256) |
| `httpx` | latest | HTTP client |
| `supabase` | latest | Supabase Storage uploads |
| `python-multipart` | latest | File upload parsing |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app, CORS, router registration
│   ├── config.py         # Settings via pydantic-settings
│   ├── database.py       # Async SQLAlchemy engine + session factory
│   ├── deps.py           # JWT auth dependencies (get_current_user, require_admin)
│   ├── models/           # SQLAlchemy ORM models
│   │   ├── booking.py
│   │   ├── profile.py
│   │   └── property.py   # Property + PropertyImage
│   ├── routers/          # Route handlers
│   │   ├── bookings.py
│   │   ├── properties.py
│   │   ├── storage.py    # Image upload endpoint
│   │   └── users.py
│   └── schemas/          # Pydantic request/response schemas
│       ├── auth.py       # ProfileOut, ProfileUpdate
│       ├── booking.py    # BookingCreate, BookingOut, BookingStatusUpdate
│       └── property.py   # PropertyCreate, PropertyOut, PropertyUpdate, PropertyImageOut
├── migrations/
│   ├── 001_schema.sql
│   ├── 002_rls.sql
│   └── 003_seed.sql
├── requirements.txt
├── .env                  # Not committed — see .env.example
└── .env.example
```

---

## Configuration

Settings are loaded by `pydantic-settings` from `backend/.env`.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | `postgresql+asyncpg://...` — Transaction pooler URL (port 6543) |
| `SUPABASE_URL` | ✅ | Your Supabase project URL, e.g. `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | ✅ | Supabase `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (used for Storage uploads) |
| `FRONTEND_URL` | ✅ | Allowed CORS origin, e.g. `http://localhost:5173` |

---

## Authentication & Authorization

### Flow

1. The **frontend** authenticates via `@supabase/supabase-js` and receives a JWT.
2. Every protected API request includes the JWT as `Authorization: Bearer <token>`.
3. The backend verifies the token using **PyJWT + PyJWKClient** (no shared secret needed).

### JWT Verification (`deps.py`)

```
Bearer Token
     │
     ▼
PyJWKClient.get_signing_key_from_jwt(token)
     │  fetches JWKS from {SUPABASE_URL}/auth/v1/.well-known/jwks.json
     │  result is cached globally
     ▼
pyjwt.decode(token, signing_key, algorithms=["RS256","ES256"], audience="authenticated")
     │
     ▼
payload["sub"]  →  UUID  →  db.get(Profile, user_id)
     │
     ▼
returns {"id", "name", "role", "avatar_url"}
```

- **Algorithm:** Supabase uses **ES256** on newer projects. Both `RS256` and `ES256` are in the allowed list.
- **JWKS cache:** `_get_jwks_client()` creates a single `PyJWKClient` instance for the process lifetime (`cache_keys=True`).
- **Admin check:** `require_admin` dependency calls `get_current_user` and raises `403` if `role != "admin"`.

### Dependencies

| Dependency | Applied to | Effect |
|------------|------------|--------|
| `get_current_user` | Protected user routes | Verifies token, returns profile dict |
| `require_admin` | Admin-only routes | Calls `get_current_user` + checks `role == "admin"` |
| `get_db` | All DB routes | Yields async SQLAlchemy session |

---

## API Endpoints

Base path: `/api`

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Returns `{"status": "ok"}` |

### Properties

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/properties` | None | List all properties (filterable) |
| GET | `/properties/{id}` | None | Get single property with images |
| POST | `/properties` | Admin | Create property |
| PATCH | `/properties/{id}` | Admin | Update property fields |
| DELETE | `/properties/{id}` | Admin | Delete property |

**Query parameters for `GET /properties`:**

| Param | Type | Description |
|-------|------|-------------|
| `type` | string | Filter by property type |
| `minCapacity` | int | Minimum guest capacity |
| `maxPrice` | float | Maximum price per night |
| `search` | string | Full-text search on title/description (ILIKE) |
| `featured` | bool | Show only featured properties |

### Property Images

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/properties/{id}/images` | Admin | Upload image to Supabase Storage + create DB record |
| DELETE | `/properties/{id}/images/{image_id}` | Admin | Delete from Storage + DB |

**Upload request:** `multipart/form-data` — field `file` (image) + optional `position` (int, default 0).  
**Allowed types:** JPEG, PNG, WebP, GIF. Max size: 5 MB.  
**Storage path:** `properties/{property_id}/{uuid}.{ext}` in bucket `property-images`.

### Bookings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/bookings/me` | User | Get current user's bookings |
| POST | `/bookings` | User | Create a booking |
| PATCH | `/bookings/{id}/cancel` | User | Cancel own booking |
| GET | `/bookings` | Admin | Get all bookings |
| PATCH | `/bookings/{id}/status` | Admin | Update booking status |

**`POST /bookings` body:**

```json
{
  "property_id": "uuid",
  "check_in": "2024-08-01",
  "check_out": "2024-08-07",
  "guests": 2
}
```

`total_price` is calculated server-side as `property.price × nights`.

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | User | Get own profile |
| PATCH | `/users/me` | User | Update own profile (name, avatar_url) |
| GET | `/users` | Admin | List all user profiles |

---

## Database Layer (`database.py`)

```python
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=False,            # disabled — incompatible with transaction pooler
    connect_args={
        "ssl": "require",           # required for Supabase
        "statement_cache_size": 0,  # required for PgBouncer transaction mode
    },
)
```

Sessions are managed per-request via the `get_db` dependency. `expire_on_commit=False` prevents lazy-load errors after commit.

---

## Running the Backend

```bash
cd backend
source .venv/bin/activate   # Windows: .venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)
