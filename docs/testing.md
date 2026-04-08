# Testing

## Overview

The project has two separate test suites:

| Layer | Tool | Tests | Location |
|-------|------|-------|----------|
| Backend (Python) | pytest + pytest-asyncio | 44 | `backend/tests/` |
| Frontend (JS) | Vitest + Testing Library | 35 | `frontend/src/**/___tests__/` |

---

## Backend tests

### Setup

All test dependencies are in `backend/requirements.txt` and installed into the same virtual environment as the app:

```bash
cd backend
pip install -r requirements.txt
```

Configuration lives in `backend/pytest.ini`:

```ini
[pytest]
asyncio_mode = auto
testpaths = tests
```

`asyncio_mode = auto` means every `async def test_*` function runs in an event loop automatically — no `@pytest.mark.asyncio` decorator needed.

### Running

```bash
cd backend
pytest                  # run all tests with summary
pytest -v               # verbose (one line per test)
pytest tests/test_bookings.py   # single file
pytest -k "cancel"      # filter by name pattern
```

### Strategy

**No real database or Supabase connection.** All external resources are replaced with mocks via FastAPI's `dependency_overrides` and `unittest.mock.AsyncMock`.

Three HTTP clients are available as pytest fixtures:

| Fixture | Auth state |
|---------|-----------|
| `anon_client` | No authentication (no `get_current_user` override) |
| `user_client` | Authenticated as a regular user (`role = "user"`) |
| `admin_client` | Authenticated as admin (`role = "admin"`, `require_admin` bypassed) |

The `mock_db` fixture (used by `user_client` and `admin_client`) provides an `AsyncMock` SQLAlchemy session. Override its return values per-test:

```python
# Return a single property from GET
mock_db.execute.return_value = stub_result(scalar_one_or_none=make_property())

# Return an empty list
mock_db.execute.return_value = stub_result(items=[])

# Simulate a missing row → router raises 404
mock_db.get.return_value = None
```

Helper factories in `conftest.py`:

- `make_property(**overrides)` — creates a `Property` ORM instance with sensible defaults
- `make_booking(**overrides)` — creates a `Booking` ORM instance linked to the default property
- `make_profile(**overrides)` — creates a `Profile` ORM instance
- `stub_result(items, scalar_one, scalar_one_or_none)` — returns a `MagicMock` that covers all SQLAlchemy `AsyncResult` chain patterns used in the routers

### Test files

#### `test_schemas.py` — 10 tests
Validates Pydantic schema rules with no HTTP or DB involved.

- `BookingCreate`: valid payload, `check_out` before `check_in`, same-day checkout, `guests = 0`, `guests = -1`
- `PropertyCreate`: valid types (`house`, `suite`, `room`), invalid types (`villa`, `cabin`)

#### `test_health.py` — 1 test
`GET /api/health` → `200 {"status": "ok"}`

#### `test_properties.py` — 11 tests
| Test | Expected |
|------|----------|
| List all properties | `200` with data |
| List when empty | `200` with `[]` |
| Get single (found) | `200` |
| Get single (not found) | `404` |
| Create — no auth | `401` |
| Create — admin | `201` |
| Create — invalid type | `422` |
| Update (found) | `200` |
| Update (not found) | `404` |
| Delete (found) | `204` |
| Delete (not found) | `404` |

#### `test_bookings.py` — 15 tests
| Test | Expected |
|------|----------|
| List my bookings | `200` |
| List — no auth | `401` |
| Create booking | `201` with correct total price |
| Create — guests > capacity | `400` |
| Create — `check_out` before `check_in` | `422` |
| Create — same-day checkout | `422` |
| Create — no auth | `401` |
| Cancel own booking | `200` |
| Cancel another user's booking | `403` |
| Cancel already-cancelled | `400` |
| Cancel not found | `404` |
| Admin: list all bookings | `200` |
| List all — regular user | `403` |
| Admin: update booking status | `200` |
| Update status — not found | `404` |

#### `test_users.py` — 7 tests
| Test | Expected |
|------|----------|
| `GET /api/users/me` | `200` |
| `GET /api/users/me` — no auth | `401` |
| `GET /api/users/me` — profile not found | `404` |
| `PUT /api/users/me` | `200` |
| `PUT /api/users/me` — no changes | `200` |
| Admin: list all users | `200` |
| List users — regular user | `403` |

---

## Frontend tests

### Setup

Install dependencies from `frontend/`:

```bash
cd frontend
npm install
```

Vitest is configured inside `vite.config.js` under the `test` key:

```js
test: {
  environment: 'jsdom',   // browser-like DOM for React components
  globals: true,          // describe/it/expect available without imports
  setupFiles: './src/test/setup.js',  // loads @testing-library/jest-dom matchers
}
```

### Running

```bash
cd frontend
npm test              # watch mode
npm test -- --run     # single pass (CI)
npm test -- --run src/lib/__tests__/api.test.js   # single file
```

### Strategy

**No real network calls.** All HTTP is mocked via `vi.mock`. Zustand stores are mocked with `vi.mock` and `mockImplementation`. React components that have external dependencies (e.g. `Spinner`) are replaced with lightweight stubs where needed.

### Test files

#### `src/lib/__tests__/api.test.js` — 7 tests
Tests the low-level `api` helper (`src/lib/api.js`).

- Adds `Authorization: Bearer <token>` when a Supabase session exists
- Omits the header when no session
- Throws an error with the `detail` field from JSON on non-OK responses
- Returns `null` on `204 No Content`
- `api.post` sends correct `Content-Type: application/json` + serialised body

#### `src/services/__tests__/propertyService.test.js` — 14 tests
Tests `propertyService` transformation logic.

- Images are sorted by `position` ascending
- Returns a flat URL array alongside sorted image objects
- Handles properties with zero images
- `getProperties` builds the correct query string from filter options

#### `src/services/__tests__/bookingService.test.js` — 9 tests
Tests `bookingService` transformation and serialisation.

- API response is transformed from `snake_case` to `camelCase`
- Nested property images are sorted by position
- Handles `null` property on a booking
- `createBooking` sends the correct payload shape
- `cancelBooking` calls the correct endpoint

#### `src/components/__tests__/ProtectedRoute.test.jsx` — 5 tests
Tests the `ProtectedRoute` component using `MemoryRouter`.

| Test | Expected |
|------|----------|
| `loading = true` | Spinner rendered, children hidden |
| `user = null` | Redirects to `/login` |
| `user.role ≠ requiredRole` | Redirects to `/` |
| Authenticated, no role requirement | Renders children |
| `user.role === requiredRole` | Renders children |
