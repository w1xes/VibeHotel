-- Migration 005: Add slug column to properties
-- Run in Supabase SQL Editor AFTER 001–004 migrations.
-- Slugs are unique, URL-safe identifiers derived from the property title.

ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug TEXT;

-- Populate slugs for the seeded properties
UPDATE properties SET slug = 'lakeside-cottage'    WHERE id = 'a1111111-1111-1111-1111-111111111111';
UPDATE properties SET slug = 'mountain-view-suite' WHERE id = 'a2222222-2222-2222-2222-222222222222';
UPDATE properties SET slug = 'forest-cabin'        WHERE id = 'a3333333-3333-3333-3333-333333333333';
UPDATE properties SET slug = 'garden-family-house' WHERE id = 'a4444444-4444-4444-4444-444444444444';
UPDATE properties SET slug = 'comfort-room'        WHERE id = 'a5555555-5555-5555-5555-555555555555';
UPDATE properties SET slug = 'riverside-villa'     WHERE id = 'a6666666-6666-6666-6666-666666666666';
UPDATE properties SET slug = 'panoramic-loft'      WHERE id = 'a7777777-7777-7777-7777-777777777777';

-- Now enforce NOT NULL + uniqueness
ALTER TABLE properties ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
