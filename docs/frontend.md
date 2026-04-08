# Frontend Documentation

The frontend is a **React 19 + Vite** single-page application styled with **Tailwind CSS 4**.

---

## Technology Stack

| Dependency | Version | Purpose |
|------------|---------|---------|
| `react` | 19 | UI framework |
| `vite` | 8 | Build tool & dev server |
| `tailwindcss` | 4 | Utility-first CSS |
| `react-router-dom` | 7 | Client-side routing |
| `zustand` | 5 | Global state management |
| `@tanstack/react-query` | 5 | Server-state caching & fetching |
| `@supabase/supabase-js` | latest | Auth client |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── main.jsx             # Entry point — ReactDOM.createRoot
│   ├── App.jsx              # RouterProvider + QueryClientProvider
│   ├── index.css            # Tailwind directives
│   ├── lib/
│   │   ├── supabase.js      # Supabase client singleton
│   │   └── api.js           # Authenticated fetch helper
│   ├── store/
│   │   └── authStore.js     # Zustand auth store + Supabase listener
│   ├── services/
│   │   ├── authService.js   # signIn, signUp, signOut via supabase.auth
│   │   ├── propertyService.js  # Property CRUD via api.js
│   │   └── bookingService.js   # Booking CRUD via api.js
│   ├── router/
│   │   └── index.jsx        # React Router config
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── CatalogPage.jsx
│   │   ├── PropertyDetailPage.jsx
│   │   ├── BookingPage.jsx
│   │   ├── AccountPage.jsx
│   │   ├── AuthPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── admin/
│   │       ├── AdminLayout.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProperties.jsx
│   │       └── AdminBookings.jsx
│   ├── components/
│   │   ├── auth/            # ProtectedRoute
│   │   ├── booking/         # Booking form components
│   │   ├── layout/          # PageWrapper, Navbar, Footer
│   │   ├── property/        # PropertyCard, ImageUpload, etc.
│   │   └── ui/              # Generic UI primitives (Button, Modal, etc.)
│   └── utils/               # Shared utility functions
├── .env                     # Not committed — see .env.example
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

---

## Environment Variables

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_API_URL=http://localhost:8000/api
```

All variables must be prefixed with `VITE_` to be exposed to the browser by Vite.

---

## Routing

Defined in `src/router/index.jsx` using `createBrowserRouter`.

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/` | `LandingPage` | Public | Hero, featured properties |
| `/properties` | `CatalogPage` | Public | Filterable property listing |
| `/properties/:id` | `PropertyDetailPage` | Public | Property detail + booking CTA |
| `/login` | `AuthPage` | Public | Sign in / sign up form |
| `/about` | `AboutPage` | Public | About page |
| `/book/:id` | `BookingPage` | User | Booking form (date picker, guest count) |
| `/account` | `AccountPage` | User | Profile + booking history |
| `/admin` | `AdminDashboard` | Admin | Admin statistics |
| `/admin/properties` | `AdminProperties` | Admin | Property management (CRUD + images) |
| `/admin/bookings` | `AdminBookings` | Admin | All bookings, status management |
| `*` | `NotFoundPage` | Public | 404 fallback |

All routes are nested under `PageWrapper` which renders `Navbar` + `Footer`.

### `ProtectedRoute`

Located at `src/components/auth/ProtectedRoute.jsx`. Accepts optional `requiredRole` prop.

- While auth state is loading → shows spinner.
- User not authenticated → redirects to `/login`.
- `requiredRole="admin"` set but `user.role !== "admin"` → redirects to `/`.

---

## Auth Flow

```
Browser load
     │
     ▼
supabase.auth.onAuthStateChange (module-level listener in authStore.js)
     │   fires immediately with existing session from localStorage
     ▼
authStore.setSession(session)
     │   if session exists → GET /api/users/me (fetches profile with role)
     │   if no session    → clears user + session
     ▼
useAuthStore state: { user, session, loading }
     │
     ▼
ProtectedRoute reads loading + user from store
```

### Key functions

| Function | Location | Description |
|----------|----------|-------------|
| `signIn(email, password)` | `authService.js` | `supabase.auth.signInWithPassword` |
| `signUp(email, password, name)` | `authService.js` | `supabase.auth.signUp` with `data: { name }` |
| `signOut()` | `authService.js` | `supabase.auth.signOut`, also clears store |
| `useAuthStore` | `authStore.js` | Zustand store with `{ user, session, loading }` |

---

## API Layer

### `src/lib/supabase.js`

Single `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` instance shared across the app.

### `src/lib/api.js`

Thin fetch wrapper that automatically attaches the current Supabase session token.

```
api.get('/path')
api.post('/path', body)
api.patch('/path', body)
api.delete('/path')
api.upload('/path', formData)   ← multipart, for image uploads
```

All methods:
1. Call `supabase.auth.getSession()` to get the access token.
2. Add `Authorization: Bearer <token>` header.
3. Throw if the response is not OK (uses `detail` from FastAPI error body).
4. Return parsed JSON (or `null` for 204 No Content).

---

## Services

### `propertyService.js`

| Function | Method | Endpoint | Auth |
|----------|--------|----------|------|
| `getProperties(filters)` | GET | `/properties?...` | None |
| `getProperty(id)` | GET | `/properties/:id` | None |
| `createProperty(data)` | POST | `/properties` | Admin |
| `updateProperty(id, data)` | PATCH | `/properties/:id` | Admin |
| `deleteProperty(id)` | DELETE | `/properties/:id` | Admin |
| `uploadImage(propertyId, file, position)` | POST | `/properties/:id/images` | Admin |
| `deleteImage(propertyId, imageId)` | DELETE | `/properties/:id/images/:imageId` | Admin |

**`transformProperty(raw)`** — maps the API response shape to the frontend:
- `raw.images` (array of `{id, url, position}`) → `imageObjects: [...]`
- Also produces `images: [url1, url2, ...]` for components that only need URLs.

### `bookingService.js`

| Function | Method | Endpoint | Auth |
|----------|--------|----------|------|
| `getMyBookings()` | GET | `/bookings/me` | User |
| `createBooking(data)` | POST | `/bookings` | User |
| `cancelBooking(id)` | PATCH | `/bookings/:id/cancel` | User |
| `getAllBookings()` | GET | `/bookings` | Admin |
| `updateBookingStatus(id, status)` | PATCH | `/bookings/:id/status` | Admin |

**`transformBooking(raw)`** — converts snake_case fields to camelCase (`check_in` → `checkIn`, `total_price` → `totalPrice`, etc.) and embeds a nested `property` object.

### `authService.js`

| Function | Description |
|----------|-------------|
| `signIn(email, password)` | Returns Supabase session |
| `signUp(email, password, name)` | Registers user, passes `name` in user metadata |
| `signOut()` | Signs out from Supabase and clears authStore |

---

## State Management

### Zustand — `authStore`

Global auth state. Persists session until page refresh; re-hydrated immediately via `onAuthStateChange`.

```js
const { user, session, loading, logout, updateProfile } = useAuthStore();
```

| Field | Type | Description |
|-------|------|-------------|
| `user` | object \| null | `{ id, name, role, avatar_url }` from `/users/me` |
| `session` | object \| null | Raw Supabase session (contains `access_token`) |
| `loading` | bool | `true` until first `onAuthStateChange` event fires |

### TanStack Query

Used for server-state (properties, bookings). Provides caching, background refetch, and loading/error states. The `QueryClient` is configured in `App.jsx` and wrapped around the entire router.

---

## Building for Production

```bash
cd frontend
npm run build      # outputs to dist/
npm run preview    # serves the built dist/ locally
```
