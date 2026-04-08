# Database Documentation

VibeHotel uses **Supabase PostgreSQL** as its database, accessed via the Transaction pooler.

---

## Connection Details

| Parameter | Value |
|-----------|-------|
| Host | `aws-0-eu-west-1.pooler.supabase.com` |
| Port | `6543` (Transaction pooler) |
| Database | `postgres` |
| SSL | Required (`ssl=require`) |
| Prepared statements | Disabled (`statement_cache_size=0`) |

> The Transaction pooler (port 6543) is used instead of the direct connection (port 5432) because the direct host is blocked in many network environments. Prepared statements must be disabled because they are not compatible with PgBouncer in transaction mode.

---

## Schema

Migration files are located in `backend/migrations/`. Run them in order inside the Supabase **SQL Editor**.

### Table: `profiles`

Extends Supabase's built-in `auth.users` table. Created automatically via trigger on signup.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, FK → `auth.users(id) ON DELETE CASCADE` | Supabase auth user ID |
| `name` | `text` | NOT NULL | Display name |
| `role` | `text` | NOT NULL, DEFAULT `'user'` | `'user'` or `'admin'` |
| `avatar_url` | `text` | nullable | Profile picture URL |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**Trigger:** `on_auth_user_created` — runs `handle_new_user()` on each `INSERT` into `auth.users`, which creates a corresponding row in `profiles` with `name` from `raw_user_meta_data`.

---

### Table: `properties`

Rental properties listed on the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `title` | `text` | NOT NULL | Property name |
| `type` | `text` | NOT NULL | `'apartment'`, `'house'`, `'villa'`, `'cabin'`, etc. |
| `description` | `text` | NOT NULL | Full description |
| `price` | `numeric(10,2)` | NOT NULL | Price per night (USD) |
| `capacity` | `int` | NOT NULL | Max number of guests |
| `bedrooms` | `int` | NOT NULL | Number of bedrooms |
| `bathrooms` | `int` | NOT NULL | Number of bathrooms |
| `area` | `int` | NOT NULL | Area in square meters |
| `amenities` | `text[]` | NOT NULL, DEFAULT `'{}'` | Array of amenity strings |
| `featured` | `bool` | NOT NULL, DEFAULT false | Show on landing page |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

---

### Table: `property_images`

Images attached to a property.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `property_id` | `uuid` | NOT NULL, FK → `properties(id) ON DELETE CASCADE` | Owning property |
| `url` | `text` | NOT NULL | Full public URL in Supabase Storage |
| `position` | `int` | NOT NULL, DEFAULT 0 | Display order (0 = first/cover) |

**Index:** `idx_property_images_property_id` on `property_id`.

---

### Table: `bookings`

Guest reservations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id) ON DELETE CASCADE` | Guest |
| `property_id` | `uuid` | NOT NULL, FK → `properties(id) ON DELETE CASCADE` | Reserved property |
| `check_in` | `date` | NOT NULL | Check-in date |
| `check_out` | `date` | NOT NULL, CHECK > check_in | Check-out date |
| `guests` | `int` | NOT NULL | Number of guests |
| `total_price` | `numeric(10,2)` | NOT NULL | nights × price per night |
| `status` | `text` | NOT NULL, DEFAULT `'confirmed'` | `'confirmed'`, `'cancelled'`, `'completed'` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**Indexes:**
- `idx_bookings_user_id` on `user_id`
- `idx_bookings_property_id` on `property_id`

---

## Row Level Security (RLS)

All tables have RLS enabled. The helper function `public.is_admin()` returns `true` if the current user's `profiles.role` is `'admin'`.

### `profiles`

| Operation | Who | Condition |
|-----------|-----|-----------|
| SELECT | Everyone | Always |
| UPDATE | Owner | `id = auth.uid()` |

### `properties`

| Operation | Who | Condition |
|-----------|-----|-----------|
| SELECT | Everyone | Always |
| INSERT | Admin only | `is_admin()` |
| UPDATE | Admin only | `is_admin()` |
| DELETE | Admin only | `is_admin()` |

### `property_images`

| Operation | Who | Condition |
|-----------|-----|-----------|
| SELECT | Everyone | Always |
| INSERT | Admin only | `is_admin()` |
| DELETE | Admin only | `is_admin()` |

### `bookings`

| Operation | Who | Condition |
|-----------|-----|-----------|
| SELECT | Owner or Admin | `user_id = auth.uid() OR is_admin()` |
| INSERT | Authenticated user | `user_id = auth.uid()` |
| UPDATE | Owner or Admin | `user_id = auth.uid() OR is_admin()` |

---

## Storage

**Bucket name:** `property-images` (public)

Files are stored at path `properties/{property_id}/{uuid}.{ext}`.

| Policy | Who | Condition |
|--------|-----|-----------|
| SELECT | Everyone | `bucket_id = 'property-images'` |
| INSERT | Admin only | `bucket_id = 'property-images' AND is_admin()` |
| DELETE | Admin only | `bucket_id = 'property-images' AND is_admin()` |

> The backend uses the **service role key** to bypass RLS when uploading images via `supabase-py`. The storage policies above are for direct client access.

---

## Seed Data

`003_seed.sql` inserts 7 properties with stable UUIDs (`a1111111-0000-0000-0000-000000000001` through `a7777777-...`), all using Unsplash image URLs (no Storage upload needed for seed data).

To apply seed data, run `003_seed.sql` in the Supabase SQL Editor after the schema and RLS migrations.

---

## Entity Relationship Diagram

```
auth.users (Supabase managed)
    │
    ├─── profiles (1:1, trigger-created)
    │         id, name, role, avatar_url
    │
    └─── bookings (1:many)
              │
              └── properties (many:1)
                      │
                      └── property_images (1:many)
```
