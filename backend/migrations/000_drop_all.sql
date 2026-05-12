-- VibeHotel: Complete database reset
-- ⚠️  DESTRUCTIVE — drops ALL app tables, views, and functions.
-- Run BEFORE re-applying migrations on a fresh install.
-- After this, run: 001 → 002 → 003 → 006 → upload_photos.py → 004 → seed_reviews.py

-- Drop tables in reverse-dependency order (CASCADE handles FK chains)
DROP TABLE IF EXISTS reviews         CASCADE;
DROP TABLE IF EXISTS bookings        CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS properties      CASCADE;
DROP TABLE IF EXISTS profiles        CASCADE;

-- Drop views
DROP VIEW IF EXISTS property_ratings CASCADE;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
