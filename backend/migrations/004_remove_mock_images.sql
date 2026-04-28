-- Migration 004: Remove Unsplash mock images from property_images
-- Run this AFTER executing scripts/upload_photos.py so that the real
-- Supabase Storage URLs are already in place for the uploaded properties.
--
-- This deletes ALL rows whose URL points to images.unsplash.com.
-- Properties that had only mock images will have an empty images array
-- until real photos are uploaded via the admin panel or upload_photos.py.

DELETE FROM property_images
WHERE url LIKE '%images.unsplash.com%';
