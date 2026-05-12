"""
seed_reviews.py — Seed test users, completed bookings and reviews
==================================================================
Creates 5 test users via the Supabase Auth Admin API, then inserts
completed bookings and reviews for every seeded property.

Usage
-----
    cd backend
    # (activate .venv first)
    python scripts/seed_reviews.py [--dry-run]

Prerequisites
-------------
* 006_reviews.sql migration must have been applied to the database.
* A valid .env file must exist in backend/ with:
    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL
"""

import argparse
import sys
from pathlib import Path
from datetime import date

# ---------------------------------------------------------------------------
# Test-user definitions
# ---------------------------------------------------------------------------
TEST_USERS = [
    {"email": "alice@vibehotel.test",  "password": "Vibehotel123!", "name": "Alice Morgan"},
    {"email": "bob@vibehotel.test",    "password": "Vibehotel123!", "name": "Bob Nguyen"},
    {"email": "carol@vibehotel.test",  "password": "Vibehotel123!", "name": "Carol Smith"},
    {"email": "david@vibehotel.test",  "password": "Vibehotel123!", "name": "David Park"},
    {"email": "eva@vibehotel.test",    "password": "Vibehotel123!", "name": "Eva Kovalenko"},
]

# property_id → (title, price_per_night)
PROPERTIES = {
    "a1111111-1111-1111-1111-111111111111": ("Lakeside Cottage",      220),
    "a2222222-2222-2222-2222-222222222222": ("Mountain View Suite",   150),
    "a3333333-3333-3333-3333-333333333333": ("Forest Cabin",          130),
    "a4444444-4444-4444-4444-444444444444": ("Garden Family House",   280),
    "a5555555-5555-5555-5555-555555555555": ("Comfort Room",           85),
    "a6666666-6666-6666-6666-666666666666": ("Riverside Villa",       350),
    "a7777777-7777-7777-7777-777777777777": ("Panoramic Loft",        190),
}

# Seed bookings: (property_id, user_index, check_in, check_out, guests)
BOOKINGS_SEED = [
    ("a1111111-1111-1111-1111-111111111111", 0, date(2025, 7, 10), date(2025, 7, 15), 4),
    ("a1111111-1111-1111-1111-111111111111", 1, date(2025, 8, 20), date(2025, 8, 25), 6),
    ("a2222222-2222-2222-2222-222222222222", 2, date(2025, 6,  1), date(2025, 6,  5), 2),
    ("a2222222-2222-2222-2222-222222222222", 3, date(2025, 9, 12), date(2025, 9, 16), 2),
    ("a3333333-3333-3333-3333-333333333333", 0, date(2025, 5,  3), date(2025, 5,  7), 2),
    ("a4444444-4444-4444-4444-444444444444", 4, date(2025, 8,  1), date(2025, 8,  8), 7),
    ("a4444444-4444-4444-4444-444444444444", 1, date(2025,10,  5), date(2025,10, 10), 5),
    ("a5555555-5555-5555-5555-555555555555", 2, date(2025, 4, 14), date(2025, 4, 17), 1),
    ("a6666666-6666-6666-6666-666666666666", 3, date(2025, 7, 20), date(2025, 7, 27), 6),
    ("a7777777-7777-7777-7777-777777777777", 4, date(2025, 9,  1), date(2025, 9,  5), 2),
]

# Reviews: (booking_seed_index, comfort, cleanliness, location, price, comment)
REVIEWS_SEED = [
    (0, 5, 5, 4, 5, "Absolutely magical stay! The private dock at sunrise was breathtaking and the fireplace kept us warm every evening."),
    (1, 4, 5, 5, 4, "Great cottage with stunning lake views. A few minor issues but the host resolved them quickly. Would return!"),
    (2, 5, 5, 5, 4, "Woke up every morning to panoramic mountain views. Beautifully designed — modern yet cosy."),
    (3, 4, 4, 5, 3, "Incredible location with easy trail access. The mini bar was a nice touch after a long hike. Slightly pricey."),
    (4, 4, 5, 5, 5, "Perfect digital detox! Fell asleep to the stream, woke up to birds. Incredibly peaceful and great value."),
    (5, 5, 5, 4, 4, "Our whole family had a wonderful time. The garden and playground kept the kids busy all day. Spotlessly clean."),
    (6, 4, 4, 3, 5, "Spacious and well-equipped. Not the most central location but great value for money."),
    (7, 3, 5, 4, 4, "Clean, functional and exactly what I needed. Nothing fancy but comfortable and good value."),
    (8, 5, 5, 5, 4, "Hands down the best villa we have ever rented. The hot tub overlooking the river at night was unforgettable."),
    (9, 5, 5, 5, 5, "The double-height ceilings and mezzanine bedroom gave a real boutique-hotel feel. Stunning 180° views."),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        sys.exit(f"ERROR: .env not found at {env_path}")
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def _get_supabase(env: dict[str, str]):
    try:
        from supabase import create_client
    except ImportError:
        sys.exit("ERROR: supabase package not installed. Run: pip install supabase")
    return create_client(env["SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"])


def _nights(check_in: date, check_out: date) -> int:
    return (check_out - check_in).days


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main(dry_run: bool) -> None:
    env = _load_env()
    sb = _get_supabase(env)

    print(f"{'[DRY RUN] ' if dry_run else ''}Connecting to {env['SUPABASE_URL']}\n")

    # ── Step 1: Create / fetch test users ──────────────────────────────────
    user_ids: list[str] = []
    for u in TEST_USERS:
        print(f"  User: {u['email']} … ", end="", flush=True)
        if dry_run:
            print("skipped (dry-run)")
            user_ids.append("00000000-0000-0000-0000-000000000000")
            continue
        try:
            res = sb.auth.admin.create_user(
                {
                    "email": u["email"],
                    "password": u["password"],
                    "email_confirm": True,
                    "user_metadata": {"name": u["name"]},
                }
            )
            user_id = res.user.id
            # Ensure profile name is set (trigger may have already done it)
            sb.table("profiles").upsert(
                {"id": user_id, "name": u["name"]}, on_conflict="id"
            ).execute()
            print(f"created ({user_id})")
            user_ids.append(user_id)
        except Exception as exc:
            # User may already exist — try to find them by email
            err_str = str(exc)
            if "already been registered" in err_str or "already exists" in err_str:
                try:
                    admin_users = sb.auth.admin.list_users()
                    existing = next(
                        (au for au in admin_users if getattr(au, "email", None) == u["email"]),
                        None,
                    )
                    if existing:
                        print(f"already exists ({existing.id})")
                        user_ids.append(existing.id)
                        continue
                except Exception:
                    pass
            print(f"ERROR: {exc}")
            sys.exit(1)

    if dry_run:
        print("\n[DRY RUN] Would insert the following rows:")

    # ── Step 2: Insert completed bookings ──────────────────────────────────
    booking_ids: list[str | None] = []
    print("\nInserting bookings …")
    for (prop_id, user_idx, check_in, check_out, guests) in BOOKINGS_SEED:
        title, price = PROPERTIES[prop_id]
        total = _nights(check_in, check_out) * price
        row = {
            "user_id":      user_ids[user_idx],
            "property_id":  prop_id,
            "check_in":     check_in.isoformat(),
            "check_out":    check_out.isoformat(),
            "guests":       guests,
            "total_price":  total,
            "status":       "completed",
        }
        print(f"  {title} ({check_in} – {check_out}, {guests} guests, ${total}) … ", end="", flush=True)
        if dry_run:
            print("skipped")
            booking_ids.append("00000000-0000-0000-0000-000000000000")
            continue
        try:
            res = sb.table("bookings").insert(row).execute()
            booking_id = res.data[0]["id"]
            booking_ids.append(booking_id)
            print(f"ok ({booking_id})")
        except Exception as exc:
            err_str = str(exc)
            # FK violation — property likely deleted; skip gracefully
            if "foreign key" in err_str.lower() or "violates" in err_str.lower() or "23503" in err_str:
                print(f"SKIPPED (property missing: {prop_id})")
                booking_ids.append(None)
            else:
                print(f"ERROR: {exc}")
                sys.exit(1)

    # ── Step 3: Insert reviews ─────────────────────────────────────────────
    print("\nInserting reviews …")
    for (booking_idx, comfort, cleanliness, location, price, comment) in REVIEWS_SEED:
        prop_id, user_idx, *_ = BOOKINGS_SEED[booking_idx]
        title, _ = PROPERTIES[prop_id]
        avg = round((comfort + cleanliness + location + price) / 4, 1)

        booking_id = booking_ids[booking_idx]
        if booking_id is None:
            print(f"  {title} — avg {avg} … SKIPPED (no booking)")
            continue

        row = {
            "booking_id":   booking_id,
            "property_id":  prop_id,
            "user_id":      user_ids[user_idx],
            "comfort":      comfort,
            "cleanliness":  cleanliness,
            "location":     location,
            "price":        price,
            "comment":      comment,
        }
        print(f"  {title} — avg {avg} … ", end="", flush=True)
        if dry_run:
            print("skipped")
            continue
        try:
            sb.table("reviews").insert(row).execute()
            print("ok")
        except Exception as exc:
            err_str = str(exc)
            # Duplicate review for this booking — already seeded, skip
            if "duplicate" in err_str.lower() or "unique" in err_str.lower() or "23505" in err_str:
                print("already exists (skipped)")
            else:
                print(f"ERROR: {exc}")
                sys.exit(1)

    print("\nDone!" if not dry_run else "\n[DRY RUN] Complete — no data was written.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed test users and reviews for VibeHotel")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without writing to DB")
    args = parser.parse_args()
    main(dry_run=args.dry_run)
