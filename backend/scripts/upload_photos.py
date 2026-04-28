"""
One-shot migration: upload local property photos to Supabase Storage
and create matching property_images rows in the database.

Naming convention used for every file:
    properties/{property_id}/{position:02d}.{ext}
e.g.
    properties/a1111111-1111-1111-1111-111111111111/00.jpg
    properties/a1111111-1111-1111-1111-111111111111/01.jpg

Usage
-----
    cd backend
    # (activate .venv first)
    python scripts/upload_photos.py [--dry-run]

Edit ROOM_MAP below to match your photo folders to DB property UUIDs.
Run with --dry-run to preview actions without uploading or writing to DB.
"""

import argparse
import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# *** EDIT THIS MAPPING ***
# key  = folder name under  data/photos/
# value = property UUID as stored in the `properties` table
# ---------------------------------------------------------------------------
ROOM_MAP: dict[str, str] = {
    "Lakeside_Cottage":    "a1111111-1111-1111-1111-111111111111",
    "Mountain_View_Suite": "a2222222-2222-2222-2222-222222222222",
    "Forest_Cabin":        "a3333333-3333-3333-3333-333333333333",
    "Garden_Family_House": "a4444444-4444-4444-4444-444444444444",
    "Riverside_Villa":     "a6666666-6666-6666-6666-666666666666",
    "Panoramic_Loft":      "a7777777-7777-7777-7777-777777777777",
    # Note: Comfort Room (a5555555) has no local photos — upload via admin panel.
}

# Supabase Storage bucket name (must already exist)
BUCKET = "property-images"

# Path to the photos root, relative to the repo root
PHOTOS_ROOT = Path(__file__).resolve().parents[2] / "data" / "photos"

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}


def _load_env() -> dict[str, str]:
    """Read .env from backend/ without requiring python-dotenv."""
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
            env[k.strip()] = v.strip()
    return env


def _get_supabase(env: dict[str, str]):
    try:
        from supabase import create_client
    except ImportError:
        sys.exit("ERROR: supabase package not installed. Run: pip install supabase")
    return create_client(env["SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"])


def _sorted_photos(folder: Path) -> list[Path]:
    """Return image files sorted by filename (alphabetical = timestamp order)."""
    files = sorted(
        [f for f in folder.iterdir() if f.suffix.lower() in ALLOWED_EXTS],
        key=lambda f: f.name,
    )
    return files


def _storage_path(property_id: str, position: int, ext: str) -> str:
    """Canonical storage key: properties/{property_id}/{position:02d}.{ext}"""
    return f"properties/{property_id}/{position:02d}{ext.lower()}"


def _delete_existing_storage_files(sb, property_id: str, dry_run: bool) -> None:
    """Remove all previously uploaded files for this property from the bucket."""
    prefix = f"properties/{property_id}/"
    try:
        existing = sb.storage.from_(BUCKET).list(f"properties/{property_id}")
        paths = [prefix + obj["name"] for obj in existing if obj.get("name")]
        if paths:
            print(f"  → Deleting {len(paths)} existing file(s) from storage: {paths}")
            if not dry_run:
                sb.storage.from_(BUCKET).remove(paths)
    except Exception as exc:
        # Folder may not exist yet — that's fine
        print(f"  (no existing storage files or list failed: {exc})")


def _delete_existing_db_records(sb, property_id: str, dry_run: bool) -> None:
    """Remove all property_images rows for this property."""
    print(f"  → Deleting existing DB rows for property {property_id}")
    if not dry_run:
        sb.table("property_images").delete().eq("property_id", property_id).execute()


def _upload_and_insert(
    sb,
    property_id: str,
    photos: list[Path],
    dry_run: bool,
) -> None:
    for position, photo in enumerate(photos):
        ext = photo.suffix.lower()
        content_type = CONTENT_TYPES.get(ext, "image/jpeg")
        storage_key = _storage_path(property_id, position, ext)

        print(f"  [{position:02d}] {photo.name}  →  {BUCKET}/{storage_key}")
        if dry_run:
            continue

        # Upload file
        content = photo.read_bytes()
        sb.storage.from_(BUCKET).upload(
            storage_key,
            content,
            {"content-type": content_type},
        )

        # Get public URL
        public_url = sb.storage.from_(BUCKET).get_public_url(storage_key)

        # Insert DB record
        sb.table("property_images").insert(
            {
                "property_id": property_id,
                "url": public_url,
                "position": position,
            }
        ).execute()


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload property photos to Supabase.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions without uploading or modifying the database.",
    )
    args = parser.parse_args()
    dry_run: bool = args.dry_run

    if dry_run:
        print("=== DRY RUN — no files will be uploaded, no DB rows will change ===\n")

    env = _load_env()
    sb = _get_supabase(env)

    for folder_name, property_id in ROOM_MAP.items():
        folder = PHOTOS_ROOT / folder_name
        if not folder.exists():
            print(f"SKIP: folder not found: {folder}")
            continue

        photos = _sorted_photos(folder)
        if not photos:
            print(f"SKIP: no images found in {folder}")
            continue

        print(f"\n{'='*60}")
        print(f"Property : {property_id}")
        print(f"Folder   : {folder_name}  ({len(photos)} photo(s))")
        print(f"{'='*60}")

        _delete_existing_db_records(sb, property_id, dry_run)
        _delete_existing_storage_files(sb, property_id, dry_run)
        _upload_and_insert(sb, property_id, photos, dry_run)

    print("\nDone." + (" (dry run — no changes made)" if dry_run else ""))


if __name__ == "__main__":
    main()
