-- VibeHotel — Initial Database Schema
-- Run this migration in the Supabase SQL editor or via the Supabase CLI:
--   supabase db push

-- ─── Extensions ──────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type room_type as enum ('standard', 'deluxe', 'suite', 'penthouse');

create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- ─── rooms ───────────────────────────────────────────────────────────────────

create table if not exists rooms (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  type            room_type   not null,
  description     text        not null default '',
  price_per_night numeric(10,2) not null check (price_per_night > 0),
  capacity        smallint    not null check (capacity > 0),
  size_sqm        numeric(6,2) not null check (size_sqm > 0),
  amenities       text[]      not null default '{}',
  images          text[]      not null default '{}',
  is_available    boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Automatically update updated_at on every row change
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rooms_updated_at
  before update on rooms
  for each row execute procedure set_updated_at();

-- ─── bookings ─────────────────────────────────────────────────────────────────

create table if not exists bookings (
  id               uuid primary key default gen_random_uuid(),
  room_id          uuid           not null references rooms(id) on delete restrict,
  guest_name       text           not null,
  guest_email      text           not null,
  guest_phone      text           not null,
  check_in         date           not null,
  check_out        date           not null,
  guests_count     smallint       not null check (guests_count > 0),
  total_price      numeric(10,2)  not null check (total_price >= 0),
  status           booking_status not null default 'pending',
  special_requests text,
  created_at       timestamptz    not null default now(),
  updated_at       timestamptz    not null default now(),
  constraint check_out_after_check_in check (check_out > check_in)
);

create trigger bookings_updated_at
  before update on bookings
  for each row execute procedure set_updated_at();

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists rooms_type_idx         on rooms(type);
create index if not exists rooms_available_idx    on rooms(is_available);
create index if not exists bookings_room_id_idx   on bookings(room_id);
create index if not exists bookings_status_idx    on bookings(status);
create index if not exists bookings_check_in_idx  on bookings(check_in);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table rooms    enable row level security;
alter table bookings enable row level security;

-- Anyone can read available rooms
create policy "Public can view rooms"
  on rooms for select
  using (true);

-- Bookings are readable only by the service role (admin) — no public read
-- The anon key cannot select bookings; only the backend service role can.

-- Anyone can insert a booking (guest makes a reservation)
create policy "Anyone can create a booking"
  on bookings for insert
  with check (true);
